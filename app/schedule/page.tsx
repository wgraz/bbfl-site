import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase.js"; // adjust path if different
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Schedule | BBFL",
};

type Game = {
  team1: string;
  team2: string;
  score1: number;
  score2: number;
};

type Ranking = {
  team: string;
  leaguePoints: number;
  pointDiff: number;
  wins: number;
  losses: number;
};

type EventWeek = {
  id: string;
  games: Game[];
  rankings: Ranking[];
  date?: string;
};

async function getEventData(): Promise<EventWeek[]> {
  const snapshot = await getDocs(collection(db, "events"));
  const weeks: EventWeek[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();

    weeks.push({
      id: doc.id,
      games: Array.isArray(data.games) ? data.games : [],
      rankings: Array.isArray(data.rankings) ? data.rankings : [],
      date: data.date ?? "",
    });
  });

  return weeks.sort((a, b) => {
    const aWeek = parseInt(a.id.replace("week", ""));
    const bWeek = parseInt(b.id.replace("week", ""));
    return aWeek - bWeek;
  });
}

export default async function SchedulePage() {
  const weeks = await getEventData();

  const previousWeeks = weeks.filter((week) => week.games.length > 0);
  const upcomingWeeks = weeks.filter((week) => week.games.length === 0);

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-center">
        🏈 BBFL Weekly Schedule
      </h1>

      {/* Previous Weeks */}
      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">
          🕘 Past Weeks
        </h2>
        <div className="space-y-8">
          {previousWeeks.map((week) => (
            <div key={week.id} className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-blue-600 capitalize">
                  {week.id}
                </h3>
                {week.date && (
                  <span className="text-sm text-gray-500">
                    {new Date(week.date).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Games */}
              <div className="mb-4">
                <h4 className="text-lg font-semibold mb-2 text-gray-700">
                  Games
                </h4>
                <div className="grid gap-3">
                  {week.games.map((game, idx) => {
                    const winner =
                      game.score1 > game.score2
                        ? game.team1
                        : game.score1 < game.score2
                        ? game.team2
                        : null;

                    return (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-gray-50 rounded-xl p-3 px-5"
                      >
                        <span
                          className={`font-semibold ${
                            winner === game.team1
                              ? "text-green-600"
                              : "text-gray-800"
                          }`}
                        >
                          {game.team1} ({game.score1})
                        </span>
                        <span className="text-sm text-gray-400">vs</span>
                        <span
                          className={`font-semibold ${
                            winner === game.team2
                              ? "text-green-600"
                              : "text-gray-800"
                          }`}
                        >
                          {game.team2} ({game.score2})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rankings */}
              <div>
                <h4 className="text-lg font-semibold mb-2 text-gray-700">
                  Rankings
                </h4>
                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                  {week.rankings.map((rank, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-100 rounded-lg p-3 flex justify-between items-center"
                    >
                      <span className="font-medium text-gray-700">
                        {rank.team}
                      </span>
                      <div className="text-right text-gray-600">
                        <p>{rank.leaguePoints} pts</p>
                        <p>Diff: {rank.pointDiff}</p>
                        <p>
                          {rank.wins}W - {rank.losses}L
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Weeks */}
      <section>
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">
          📅 Upcoming Weeks
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {upcomingWeeks.length > 0 ? (
            upcomingWeeks.map((week) => (
              <div
                key={week.id}
                className="bg-yellow-50 border border-yellow-300 rounded-xl p-5"
              >
                <h3 className="text-xl font-bold text-yellow-800 capitalize">
                  {week.id}
                </h3>
                {week.date ? (
                  <p className="text-sm text-yellow-700 mt-1">
                    Planned: {new Date(week.date).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="text-sm italic text-yellow-700 mt-1">
                    Date TBD
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">
              No upcoming weeks have been scheduled.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
