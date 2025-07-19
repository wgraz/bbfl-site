"use client";

import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase.js";
import { useEffect, useState } from "react";

type Team = {
  id: string;
  name: string;
  captain: string;
  color: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAg: number;
  rank: number;
};

type Player = {
  id: string;
  name: string;
  teamID: string;
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [teamSnap, playerSnap] = await Promise.all([
        getDocs(collection(db, "teams")),
        getDocs(collection(db, "players")),
      ]);

      const rawTeams: Team[] = [];
      teamSnap.forEach((docSnap) => {
        const data = docSnap.data();
        rawTeams.push({
          id: docSnap.id,
          name: data.name,
          captain: data.captain,
          color: data.color,
          leaguePoints: data.leaguePoints,
          wins: data.wins,
          losses: data.losses,
          pointsFor: data.pointsFor,
          pointsAg: data.pointsAg,
          rank: data.rank,
        });
      });

      const players: Player[] = [];
      playerSnap.forEach((docSnap) => {
        const data = docSnap.data();
        players.push({
          id: docSnap.id,
          name: data.name,
          teamID: data.teamID,
        });
      });

      // Rank Calculation
      const sortedTeams = [...rawTeams].sort((a, b) => {
        if (b.leaguePoints !== a.leaguePoints)
          return b.leaguePoints - a.leaguePoints;
        if (b.wins !== a.wins) return b.wins - a.wins;

        const aDiff = a.pointsFor - a.pointsAg;
        const bDiff = b.pointsFor - b.pointsAg;
        return bDiff - aDiff;
      });

      // Update Firestore ranks if needed
      await Promise.all(
        sortedTeams.map(async (team, index) => {
          const correctRank = index + 1;
          if (team.rank !== correctRank) {
            const teamRef = doc(db, "teams", team.id);
            await updateDoc(teamRef, { rank: correctRank });
            team.rank = correctRank;
          }
        })
      );

      setTeams(sortedTeams);
      setPlayers(players);
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="p-6 text-center text-lg text-gray-500">
        Loading teams...
      </main>
    );
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-center">🏆 BBFL Teams</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {teams.map((team) => {
          const teamPlayers = players.filter((p) => p.teamID === team.id);

          return (
            <div
              key={team.id}
              className="bg-white shadow-md rounded-2xl p-6 border-t-4"
              style={{ borderTopColor: team.color || "#ccc" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {team.name}
                </h2>
                <span
                  className="text-sm font-medium px-2 py-1 rounded bg-gray-100 text-gray-600"
                  title="Rank"
                >
                  Rank #{team.rank}
                </span>
              </div>

              <p className="mb-2 text-gray-600">
                <strong>Captain:</strong> {team.captain}
              </p>

              <div className="grid grid-cols-2 gap-3 text-sm mb-4 text-gray-700">
                <p>
                  Wins: <span className="font-semibold">{team.wins}</span>
                </p>
                <p>
                  Losses: <span className="font-semibold">{team.losses}</span>
                </p>
                <p>
                  Points For:{" "}
                  <span className="font-semibold">{team.pointsFor}</span>
                </p>
                <p>
                  Points Against:{" "}
                  <span className="font-semibold">{team.pointsAg}</span>
                </p>
                <p>
                  League Points:{" "}
                  <span className="font-semibold">{team.leaguePoints}</span>
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">
                  Roster
                </h3>
                {teamPlayers.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {teamPlayers.map((player) => (
                      <li key={player.id}>{player.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm italic text-gray-500">
                    No players assigned.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
