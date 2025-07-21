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

      const sortedTeams = [...rawTeams].sort((a, b) => {
        if (b.leaguePoints !== a.leaguePoints)
          return b.leaguePoints - a.leaguePoints;
        if (b.wins !== a.wins) return b.wins - a.wins;

        const aDiff = a.pointsFor - a.pointsAg;
        const bDiff = b.pointsFor - b.pointsAg;
        return bDiff - aDiff;
      });

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
    <main className="bg-gradient-to-br from-slate-100 to-slate-300 min-h-screen py-12 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-black text-blue-800 mb-12 text-center drop-shadow-sm">
          🏆 BBFL Teams
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {teams.map((team) => {
            const teamPlayers = players.filter((p) => p.teamID === team.id);

            return (
              <div
                key={team.id}
                className="bg-white rounded-2xl shadow-md p-6 border-t-8 transition hover:shadow-xl"
                style={{ borderTopColor: team.color || "#94a3b8" }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {team.name}
                  </h2>
                  <span
                    className="text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700"
                    title="Rank"
                  >
                    Rank #{team.rank}
                  </span>
                </div>

                <p className="mb-3 text-gray-600">
                  <strong className="text-gray-800">Captain:</strong>{" "}
                  {team.captain}
                </p>

                <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm text-gray-700 mb-4">
                  <p>
                    <strong className="text-gray-800">Wins:</strong> {team.wins}
                  </p>
                  <p>
                    <strong className="text-gray-800">Losses:</strong>{" "}
                    {team.losses}
                  </p>
                  <p>
                    <strong className="text-gray-800">Points For:</strong>{" "}
                    {team.pointsFor}
                  </p>
                  <p>
                    <strong className="text-gray-800">Points Against:</strong>{" "}
                    {team.pointsAg}
                  </p>
                  <p className="col-span-2">
                    <strong className="text-gray-800">League Points:</strong>{" "}
                    {team.leaguePoints}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
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
      </div>
    </main>
  );
}
