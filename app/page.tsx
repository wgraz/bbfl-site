import Link from "next/link";

export default function Home() {
  const showSite = process.env.NEXT_PUBLIC_SHOW_SITE === "true";

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
          <p className="text-2xl sm:text-3xl font-light mb-8 animate-fadeIn delay-500">
            The Baker Boys Football League returns this season.
          </p>
          <p className="text-lg text-zinc-300 italic animate-fadeIn delay-700">
            Draft day is around the corner. Stats. Standings. Rivalries. Legacy.
            <br />
            Full site goes live soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-slate-100 to-slate-300">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold mb-4 text-blue-700">🏈 BBFL</h1>
        <p className="text-lg mb-8 text-gray-700">
          The Baker Boys Football League. Compete weekly. Dominate the field.
          Earn those 8 points.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
          <Link
            href="/teams"
            className="block p-6 bg-white rounded-xl shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold text-blue-600">Teams</h2>
            <p className="text-sm text-gray-600">View rosters and team stats</p>
          </Link>

          <Link
            href="/standings"
            className="block p-6 bg-white rounded-xl shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold text-green-600">Standings</h2>
            <p className="text-sm text-gray-600">Current team rankings</p>
          </Link>

          <Link
            href="/stats"
            className="block p-6 bg-white rounded-xl shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold text-purple-600">Stats</h2>
            <p className="text-sm text-gray-600">Top players and leaders</p>
          </Link>

          <Link
            href="/schedule"
            className="block p-6 bg-white rounded-xl shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold text-teal-600">Schedule</h2>
            <p className="text-sm text-gray-600">Upcoming & past events</p>
          </Link>

          <Link
            href="/admin"
            className="block p-6 bg-gray-900 text-white rounded-xl shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold">Admin</h2>
            <p className="text-sm text-gray-300">
              Private league control panel
            </p>
          </Link>

          <Link
            href="/rules"
            className="block p-6 bg-white rounded-xl shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold text-red-600">Rules</h2>
            <p className="text-sm text-gray-600">View league rules & format</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
