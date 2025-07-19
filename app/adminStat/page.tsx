"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Player = {
  id: string;
  name: string;
  teamID: string;
  pos: string;
  photoURL: string;
  tds: number;
  ints: number;
  sacks: number;
  conv: number;
  gp: number;
};

type Team = {
  id: string;
  name: string;
  color: string;
};

export default function AdminStatPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [statInputs, setStatInputs] = useState<Record<string, Partial<Player>>>(
    {}
  );

  useEffect(() => {
    async function fetchData() {
      const [playerSnap, teamSnap] = await Promise.all([
        getDocs(collection(db, "players")),
        getDocs(collection(db, "teams")),
      ]);

      const allPlayers: Player[] = [];
      playerSnap.forEach((doc) => {
        const data = doc.data();
        allPlayers.push({
          id: doc.id,
          name: data.name,
          teamID: data.teamID,
          pos: data.pos,
          photoURL: data.photoURL,
          tds: data.tds || 0,
          ints: data.ints || 0,
          sacks: data.sacks || 0,
          conv: data.conv || 0,
          gp: data.gp || 0,
        });
      });

      const allTeams: Team[] = [];
      teamSnap.forEach((doc) => {
        const data = doc.data();
        allTeams.push({
          id: doc.id,
          name: data.name,
          color: data.color,
        });
      });

      setPlayers(allPlayers);
      setTeams(allTeams);
    }

    fetchData();
  }, []);

  const handleInputChange = (
    playerId: string,
    field: keyof Player,
    value: number
  ) => {
    setStatInputs((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: value,
      },
    }));
  };

  const handleSaveStats = async () => {
    const updates = Object.entries(statInputs);

    for (const [playerId, newStats] of updates) {
      const playerRef = doc(db, "players", playerId);
      const playerSnap = await getDocs(collection(db, "players"));
      const playerData = playerSnap.docs
        .find((doc) => doc.id === playerId)
        ?.data();

      if (!playerData) continue;

      await updateDoc(playerRef, {
        tds: (playerData.tds || 0) + (newStats.tds || 0),
        ints: (playerData.ints || 0) + (newStats.ints || 0),
        sacks: (playerData.sacks || 0) + (newStats.sacks || 0),
        conv: (playerData.conv || 0) + (newStats.conv || 0),
        gp: (playerData.gp || 0) + (newStats.gp || 0),
      });
    }

    alert("Stats added successfully!");
    setStatInputs({});
  };

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        📊 Admin Stat Entry
      </h1>

      {teams.map((team) => {
        const teamPlayers = players.filter((p) => p.teamID === team.id);
        return (
          <div key={team.id} className="mb-8">
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ color: team.color }}
            >
              {team.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamPlayers.map((player) => (
                <div
                  key={player.id}
                  className="bg-white p-4 rounded shadow space-y-2"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={player.photoURL || "/default-player.png"}
                      alt={player.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{player.name}</p>
                      <p className="text-sm text-gray-500">{player.pos}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {["tds", "ints", "sacks", "conv", "gp"].map((stat) => (
                      <div key={stat}>
                        <label className="block font-medium capitalize">
                          {stat}
                        </label>
                        <input
                          type="number"
                          min={0}
                          className="border rounded px-2 py-1 w-full"
                          value={
                            statInputs[player.id]?.[stat as keyof Player] ?? ""
                          }
                          onChange={(e) =>
                            handleInputChange(
                              player.id,
                              stat as keyof Player,
                              parseInt(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="text-center mt-10">
        <button
          onClick={handleSaveStats}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          Save Stats
        </button>
      </div>
    </main>
  );
}
