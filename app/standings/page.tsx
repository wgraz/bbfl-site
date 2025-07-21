"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase.js";

type Team = {
  id: string;
  name: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAg: number;
  rank: number;
};

export default function StandingsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeams() {
      const snap = await getDocs(collection(db, "teams"));
      const rawTeams: Team[] = [];

      snap.forEach((docSnap) => {
        const data = docSnap.data();
        rawTeams.push({
          id: docSnap.id,
          name: data.name,
          leaguePoints: data.leaguePoints,
          wins: data.wins,
          losses: data.losses,
          pointsFor: data.pointsFor,
          pointsAg: data.pointsAg,
          rank: data.rank,
        });
      });

      const sorted = [...rawTeams].sort((a, b) => {
        if (b.leaguePoints !== a.leaguePoints)
          return b.leaguePoints - a.leaguePoints;
        if (b.wins !== a.wins) return b.wins - a.wins;

        const aDiff = a.pointsFor - a.pointsAg;
        const bDiff = b.pointsFor - b.pointsAg;
        return bDiff - aDiff;
      });

      await Promise.all(
        sorted.map(async (team, index) => {
          const newRank = index + 1;
          if (team.rank !== newRank) {
            await updateDoc(doc(db, "teams", team.id), { rank: newRank });
            team.rank = newRank;
          }
        })
      );

      setTeams(sorted);
      setLoading(false);
    }

    fetchTeams();
  }, []);

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen p-6 text-gray-500 text-lg">
        Loading standings...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 py-12 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold text-blue-800 mb-12 text-center drop-shadow-sm">
          📈 BBFL Standings
        </h1>

        <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-100 text-gray-700 text-sm font-semibold uppercase tracking-wide">
              <tr>
                <th className="py-3 px-5">Rank</th>
                <th className="py-3 px-5">Team</th>
                <th className="py-3 px-5">W - L</th>
                <th className="py-3 px-5">League Pts</th>
                <th className="py-3 px-5">Point Diff</th>
                <th className="py-3 px-5">PF - PA</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => {
                const pointDiff = team.pointsFor - team.pointsAg;

                return (
                  <tr
                    key={team.id}
                    className="border-b last:border-none hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-5 font-semibold text-blue-700">
                      #{team.rank}
                    </td>
                    <td className="py-3 px-5 font-medium">{team.name}</td>
                    <td className="py-3 px-5">
                      {team.wins} - {team.losses}
                    </td>
                    <td className="py-3 px-5 font-semibold">
                      {team.leaguePoints}
                    </td>
                    <td
                      className={`py-3 px-5 font-semibold ${
                        pointDiff >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {pointDiff >= 0 ? "+" : ""}
                      {pointDiff}
                    </td>
                    <td className="py-3 px-5">
                      {team.pointsFor} - {team.pointsAg}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
