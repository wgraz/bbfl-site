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
      <main className="p-6 text-center text-lg text-gray-500">
        Loading player stats...
      </main>
    );
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🏈 Player Stats Leaders
      </h1>

      <div className="mb-6 text-center">
        <label className="mr-2 font-medium">Filter by:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as StatKey)}
          className="border px-3 py-1 rounded"
        >
          {statOptions.map((stat) => (
            <option key={stat} value={stat}>
              {stat.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {sortedPlayers.map((player) => (
          <div
            key={player.id}
            className="flex items-center bg-white shadow rounded-lg p-4"
          >
            <img
              src={player.photoURL || "/default-player.png"}
              alt={player.name}
              className="w-16 h-16 rounded-full object-cover mr-4"
            />
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{player.name}</h2>
              <p className="text-sm text-gray-600">Position: {player.pos}</p>
              <p className="text-sm text-gray-600">Games Played: {player.gp}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">{player[filter]}</p>
              <p className="text-sm text-gray-500">{filter.toUpperCase()}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
