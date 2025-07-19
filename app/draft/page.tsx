"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";

type Player = {
  id: string;
  name: string;
  teamID: string;
  pos: string;
  photoURL: string;
};

type Team = {
  id: string;
  name: string;
  color: string;
};

export default function DraftPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [draftOrder, setDraftOrder] = useState<string[]>([]);
  const [currentPickIndex, setCurrentPickIndex] = useState(0);
  const [draftStarted, setDraftStarted] = useState(false);
  const [timer, setTimer] = useState(90);
  const [showDraftBoard, setShowDraftBoard] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (draftStarted && currentPickIndex < draftOrder.length) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCurrentPickIndex((prevIndex) => prevIndex + 1);
            return 90;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [draftStarted, currentPickIndex, draftOrder]);

  async function startDraft() {
    const [playerSnap, teamSnap] = await Promise.all([
      getDocs(collection(db, "players")),
      getDocs(collection(db, "teams")),
    ]);

    const allPlayers: Player[] = [];
    const resetPromises: Promise<void>[] = [];

    for (const docSnap of playerSnap.docs) {
      const data = docSnap.data();
      const playerRef = doc(db, "players", docSnap.id);
      resetPromises.push(updateDoc(playerRef, { teamID: "" }));
      allPlayers.push({
        id: docSnap.id,
        name: data.name,
        teamID: "",
        pos: data.pos,
        photoURL: data.photoURL,
      });
    }

    await Promise.all(resetPromises);

    const allTeams: Team[] = [];
    teamSnap.forEach((doc) => {
      const data = doc.data();
      allTeams.push({
        id: doc.id,
        name: data.name,
        color: data.color,
      });
    });

    const order: string[] = [];
    const rounds = Math.ceil(allPlayers.length / allTeams.length);
    for (let i = 0; i < rounds; i++) {
      const round = i % 2 === 0 ? allTeams : [...allTeams].reverse();
      order.push(...round.map((t) => t.id));
    }

    setPlayers(allPlayers);
    setTeams(allTeams);
    setDraftOrder(order);
    setDraftStarted(true);
    setCurrentPickIndex(0);
    setTimer(90);
  }

  async function handleMakePick(playerId: string) {
    const teamId = draftOrder[currentPickIndex];
    const playerRef = doc(db, "players", playerId);
    await updateDoc(playerRef, { teamID: teamId });

    const updatedPlayers = players.map((p) =>
      p.id === playerId ? { ...p, teamID: teamId } : p
    );
    setPlayers(updatedPlayers);
    setCurrentPickIndex((prev) => prev + 1);
    setTimer(90);
  }

  const currentTeamId = draftOrder[currentPickIndex];
  const currentTeam = teams.find((t) => t.id === currentTeamId);

  const draftComplete = currentPickIndex >= draftOrder.length;

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🏈 BBFL Draft Board
      </h1>

      {!draftStarted ? (
        <div className="text-center">
          <button
            onClick={startDraft}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Start Draft
          </button>
        </div>
      ) : draftComplete && !showDraftBoard ? (
        <div className="text-center">
          <p className="text-lg font-semibold mb-4">✅ Draft Complete!</p>
          <button
            onClick={() => setShowDraftBoard(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700"
          >
            See Draft Board
          </button>
        </div>
      ) : showDraftBoard ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            Final Draft Board
          </h2>
          {teams.map((team) => {
            const teamPlayers = players.filter((p) => p.teamID === team.id);
            return (
              <div key={team.id} className="bg-white p-4 rounded shadow mb-4">
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: team.color }}
                >
                  {team.name}
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {teamPlayers.map((player) => (
                    <li key={player.id}>
                      {player.name} ({player.pos})
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          <div className="text-center">
            <button
              onClick={() => router.push("/")}
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
            >
              Complete Draft
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Current Pick</h2>
            <p className="text-lg">
              <span style={{ color: currentTeam?.color || "#000" }}>
                {currentTeam?.name}
              </span>{" "}
              is on the clock 🕒 ({Math.floor(timer / 60)}:
              {String(timer % 60).padStart(2, "0")})
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Available Players</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {players
                .filter((p) => !p.teamID)
                .map((player) => (
                  <div
                    key={player.id}
                    className="bg-white p-4 rounded shadow flex flex-col items-center"
                  >
                    <img
                      src={player.photoURL || "/default-player.png"}
                      alt={player.name}
                      className="w-16 h-16 rounded-full object-cover mb-2"
                    />
                    <p className="font-semibold">{player.name}</p>
                    <p className="text-sm text-gray-500">{player.pos}</p>
                    {currentTeamId && (
                      <button
                        onClick={() => handleMakePick(player.id)}
                        className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Make Pick
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
