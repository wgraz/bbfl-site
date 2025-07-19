import Link from "next/link";

export default function Home() {
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
        </div>
      </div>
    </main>
  );
}
