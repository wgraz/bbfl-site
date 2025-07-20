// app/rules/page.tsx
export default function RulesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-4xl font-extrabold text-center text-blue-700 mb-6">
          📜 BBFL Official Rules
        </h1>

        <p className="text-gray-700 text-center mb-10">
          These rules govern all BBFL play. Review them carefully. Bolded rules
          are strictly enforced.
        </p>

        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              ⏱ Game Structure
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>
                <strong>Two 15-minute halves</strong>
              </li>
              <li>
                <strong>5-minute halftime</strong>
              </li>
              <li>3 timeouts per team per game (1 minute each)</li>
              <li>College OT format starting from the 30-yard line</li>
              <li>1-point conversion from the 2-yard line</li>
              <li>2-point conversion from the 7-yard line</li>
              <li>
                <strong>
                  Pick-six on a conversion counts for points attempted
                </strong>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              🏃 Offensive Rules
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>
                <strong>10-second play clock after the ball is spotted</strong>
              </li>
              <li>
                <strong>
                  Quarterback can scramble 5 seconds after blitz begins
                </strong>
              </li>
              <li>
                No throwing the ball if it was already thrown forward to you
              </li>
              <li>
                If play clock count is too fast, offense can ask defense to
                count out loud
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              🛡️ Defensive Rules
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>
                <strong>5-second blitz count required before rushing</strong>
              </li>
              <li>
                <strong>
                  Defense gets a minimum of 3 seconds to set up after offense
                  lines up
                </strong>
              </li>
              <li>
                No pulling or grabbing a player to get a second-hand touch
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              🕒 Clock Management
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>
                <strong>Clock stops under 5 minutes for major stoppages</strong>{" "}
                (e.g., touchdowns, timeouts)
              </li>
              <li>
                <strong>Efforts to illegitimately kill clock</strong> = 5-yard
                penalty + time added back
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              💥 Special Situations
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>
                <strong>Onside Kick Alternative:</strong> "Jackpot" style from
                the 25-yard line into ~10-yard zone. If failed, opponent starts
                on their 25.
              </li>
              <li>
                <strong>
                  Tied league points are broken by wins then point differential.
                </strong>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
