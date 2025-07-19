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
      <main className="p-6 text-center text-gray-500">
        Loading standings...
      </main>
    );
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-10">
        📈 BBFL Standings
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse rounded-xl overflow-hidden">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="py-2 px-4">Rank</th>
              <th className="py-2 px-4">Team</th>
              <th className="py-2 px-4">W - L</th>
              <th className="py-2 px-4">League Pts</th>
              <th className="py-2 px-4">Point Diff</th>
              <th className="py-2 px-4">PF - PA</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => {
              const pointDiff = team.pointsFor - team.pointsAg;

              return (
                <tr
                  key={team.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-2 px-4 font-semibold text-blue-600">
                    #{team.rank}
                  </td>
                  <td className="py-2 px-4">{team.name}</td>
                  <td className="py-2 px-4">
                    {team.wins} - {team.losses}
                  </td>
                  <td className="py-2 px-4">{team.leaguePoints}</td>
                  <td
                    className={`py-2 px-4 font-medium ${
                      pointDiff >= 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {pointDiff >= 0 ? "+" : ""}
                    {pointDiff}
                  </td>
                  <td className="py-2 px-4">
                    {team.pointsFor} - {team.pointsAg}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
