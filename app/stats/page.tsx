"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

type Player = {
  id: string;
  name: string;
  teamID: string;
  pos: string;
  gp: number;
  tds: number;
  ints: number;
  sacks: number;
  conv: number;
  photoURL: string;
};

type StatKey = "tds" | "ints" | "sacks" | "gp" | "conv";

const statOptions: StatKey[] = ["tds", "ints", "sacks", "gp", "conv"];

export default function StatsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filter, setFilter] = useState<StatKey>("tds");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayers() {
      const snap = await getDocs(collection(db, "players"));
      const data: Player[] = [];

      snap.forEach((doc) => {
        const d = doc.data();
        data.push({
          id: doc.id,
          name: d.name,
          teamID: d.teamID,
          pos: d.pos,
          gp: d.gp,
          tds: d.tds,
          ints: d.ints,
          sacks: d.sacks,
          conv: d.conv,
          photoURL: d.photoURL,
        });
      });

      setPlayers(data);
      setLoading(false);
    }

    fetchPlayers();
  }, []);

  const sortedPlayers = [...players].sort(
    (a, b) => (b[filter] as number) - (a[filter] as number)
  );

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen p-6 text-lg text-gray-500">
        Loading player stats...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 py-12 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold text-blue-800 mb-8 text-center drop-shadow-sm">
          🏈 Player Stats Leaders
        </h1>

        <div className="mb-8 flex justify-center items-center gap-3">
          <label htmlFor="filter" className="font-semibold text-gray-700">
            Filter by:
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as StatKey)}
            className="border border-gray-300 rounded-md px-4 py-2 text-gray-700 hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          >
            {statOptions.map((stat) => (
              <option key={stat} value={stat}>
                {stat.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {sortedPlayers.map((player) => (
            <div
              key={player.id}
              className="flex items-center bg-white shadow-lg rounded-2xl p-5 transition hover:shadow-2xl"
            >
              <img
                src={player.photoURL || "/default-player.png"}
                alt={player.name}
                className="w-20 h-20 rounded-full object-cover mr-6 border-2 border-blue-400"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-gray-900 truncate">
                  {player.name}
                </h2>
                <p className="text-sm text-gray-600">
                  Position: <span className="font-medium">{player.pos}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Games Played: <span className="font-medium">{player.gp}</span>
                </p>
              </div>
              <div className="text-right min-w-[70px] ml-6">
                <p className="text-3xl font-extrabold text-blue-700">
                  {player[filter]}
                </p>
                <p className="text-xs uppercase text-gray-400 tracking-wide mt-1">
                  {filter}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
