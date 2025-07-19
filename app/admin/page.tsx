"use client";

import { useState } from "react";
import Link from "next/link";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminPage() {
  const [input, setInput] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);

  const ADMIN_PASSWORD = "Willy"; // change to whatever you want

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      setAccessGranted(true);
    } else {
      alert("Incorrect password");
    }
  }

  async function resetTestData() {
    const collections = ["events", "players", "teams"];
    for (const col of collections) {
      const snap = await getDocs(collection(db, col));
      for (const docu of snap.docs) {
        await deleteDoc(doc(db, col, docu.id));
      }
    }

    const testTeams = [
      {
        id: "team1",
        name: "Team A",
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAg: 0,
        leaguePoints: 0,
        eventsPlayed: 0,
        rank: 0,
        color: "red",
        roster: [],
      },
      {
        id: "team2",
        name: "Team B",
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAg: 0,
        leaguePoints: 0,
        eventsPlayed: 0,
        rank: 0,
        color: "blue",
        roster: [],
      },
      {
        id: "team3",
        name: "Team C",
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAg: 0,
        leaguePoints: 0,
        eventsPlayed: 0,
        rank: 0,
        color: "green",
        roster: [],
      },
      {
        id: "team4",
        name: "Team D",
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAg: 0,
        leaguePoints: 0,
        eventsPlayed: 0,
        rank: 0,
        color: "yellow",
        roster: [],
      },
    ];
    for (const team of testTeams) {
      await setDoc(doc(db, "teams", team.id), team);
    }

    const testPlayers = [];
    for (let i = 1; i <= 16; i++) {
      const teamIndex = Math.floor((i - 1) / 4);
      testPlayers.push({
        id: `p${i}`,
        name: `Player ${i}`,
        gp: 0,
        ints: 0,
        sacks: 0,
        tds: 0,
        conv: 0,
        pos: "WR",
        photoURL: "",
        teamID: `team${teamIndex + 1}`,
      });
    }
    for (const player of testPlayers) {
      await setDoc(doc(db, "players", player.id), player);
    }

    for (let i = 1; i <= 15; i++) {
      await setDoc(doc(db, "events", `week${i}`), {
        week: i.toString(),
        date: new Date().toISOString(),
        teams: [],
        games: [],
        rankings: [],
      });
    }

    alert("Test data initialized.");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Access</h1>

      {!accessGranted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Enter Admin Password
            </label>
            <input
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="border rounded px-3 py-2 w-64"
              placeholder="Password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      ) : (
        <div className="space-y-4 w-full max-w-sm">
          <p className="text-green-700 font-semibold text-center">
            Access Granted ✅
          </p>

          <Link
            href="/adminEdit"
            className="block text-center bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Go to Admin Edit
          </Link>

          <Link
            href="/adminEvent"
            className="block text-center bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
          >
            Go to Admin Event
          </Link>

          <Link
            href="/draft"
            className="block text-center bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700"
          >
            Go to Draft Page
          </Link>

          <Link
            href="/adminStat"
            className="block text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Go to Admin Stat Page
          </Link>

          <button
            onClick={resetTestData}
            className="block w-full text-center bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          >
            Reset and Initialize Test Data
          </button>
        </div>
      )}
    </div>
  );
}
