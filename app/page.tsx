"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase.js"; // adjust if needed

export default function Home() {
  const [showSite, setShowSite] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchShowSite = async () => {
      try {
        const snapshot = await getDocs(collection(db, "general"));
        const doc = snapshot.docs[1]; // assuming only one doc in "general"
        const data = doc?.data();

        setShowSite(data?.showSite ?? false); // fallback to false if missing
      } catch (error) {
        console.error("Error fetching showSite flag:", error);
        setShowSite(false); // fallback to splash page
      }
    };

    fetchShowSite();
  }, []);

  if (showSite === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!showSite) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-black via-gray-900 to-zinc-800 text-white relative overflow-hidden">
        {/* Background Rings */}
        <div
          className="absolute w-[800px] h-[800px] bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ top: "-20%", left: "-20%" }}
        ></div>
        <div
          className="absolute w-[600px] h-[600px] bg-gradient-to-tr from-blue-400 to-purple-600 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ bottom: "-20%", right: "-10%" }}
        ></div>

        <div className="z-10 text-center px-6">
          <h1 className="text-6xl sm:text-7xl font-extrabold tracking-wide mb-6 animate-fadeIn drop-shadow-lg">
            🏈 BBFL IS COMING
          </h1>
          <p className="text-2xl sm:text-3xl font-light mb-6 animate-fadeIn delay-500">
            The Baker Boys Football League returns this season.
          </p>
          <p className="text-lg text-zinc-300 italic mb-8 animate-fadeIn delay-700">
            Draft day is around the corner. Stats. Standings. Rivalries. Legacy.
            <br />
            Full site goes live soon.
          </p>

          <Link href="/signUp">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-lg shadow-lg transition-all duration-300 animate-fadeIn delay-1000">
              Sign Up to Play
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-black text-blue-800 tracking-tight mb-4 drop-shadow-sm">
          🏈 BBFL
        </h1>
        <p className="text-xl text-gray-700 mb-12 font-medium">
          The Baker Boys Football League. Compete weekly. Dominate the field.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <Link
            href="/teams"
            className="group block rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-2xl font-bold text-blue-600 group-hover:underline">
              Teams
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              View rosters and team stats
            </p>
          </Link>

          <Link
            href="/standings"
            className="group block rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-2xl font-bold text-green-600 group-hover:underline">
              Standings
            </h2>
            <p className="text-sm text-gray-600 mt-2">Current team rankings</p>
          </Link>

          <Link
            href="/stats"
            className="group block rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-2xl font-bold text-purple-600 group-hover:underline">
              Stats
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Top players and leaders
            </p>
          </Link>

          <Link
            href="/schedule"
            className="group block rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-2xl font-bold text-teal-600 group-hover:underline">
              Schedule
            </h2>
            <p className="text-sm text-gray-600 mt-2">Upcoming & past events</p>
          </Link>

          <Link
            href="/admin"
            className="group block rounded-2xl bg-gray-900 text-white p-6 shadow-md hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-2xl font-bold group-hover:underline">Admin</h2>
            <p className="text-sm text-gray-300 mt-2">
              Private league control panel
            </p>
          </Link>

          <Link
            href="/rules"
            className="group block rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-2xl font-bold text-red-600 group-hover:underline">
              Rules
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              View league rules & format
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
