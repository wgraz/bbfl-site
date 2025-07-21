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

// Config
const ADMIN_PASSWORD = "Willy"; // Change this as needed

// Component
export default function AdminPage() {
  const [input, setInput] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);

  // Handle password form
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      setAccessGranted(true);
    } else {
      alert("Incorrect password");
    }
  }

  // Reset and initialize test data
  async function resetTestData() {
    const collections = ["events", "players", "teams"];

    // Delete all current docs in the collections
    for (const col of collections) {
      const snap = await getDocs(collection(db, col));
      for (const docu of snap.docs) {
        await deleteDoc(doc(db, col, docu.id));
      }
    }

    // Create test teams
    const testTeams = ["A", "B", "C", "D"].map((letter, i) => ({
      id: `team${i + 1}`,
      name: `Team ${letter}`,
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAg: 0,
      leaguePoints: 0,
      eventsPlayed: 0,
      rank: 0,
      color: ["red", "blue", "green", "yellow"][i],
      roster: [],
    }));

    for (const team of testTeams) {
      await setDoc(doc(db, "teams", team.id), team);
    }

    // Create 16 players across 4 teams
    const testPlayers = Array.from({ length: 16 }, (_, i) => {
      const teamIndex = Math.floor(i / 4);
      return {
        id: `p${i + 1}`,
        name: `Player ${i + 1}`,
        gp: 0,
        ints: 0,
        sacks: 0,
        tds: 0,
        conv: 0,
        pos: "WR",
        photoURL: "",
        teamID: `team${teamIndex + 1}`,
      };
    });

    for (const player of testPlayers) {
      await setDoc(doc(db, "players", player.id), player);
    }

    // Create 15 test events (weekly)
    const startDate = new Date("2025-09-07T17:00:00");
    for (let i = 1; i <= 15; i++) {
      const eventDate = new Date(startDate);
      eventDate.setDate(startDate.getDate() + (i - 1) * 7);
      await setDoc(doc(db, "events", `week${i}`), {
        week: i.toString(),
        date: eventDate.toISOString(),
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

          {/* Navigation Links */}
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

          {/* Reset Data Button */}
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
