"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Types
type Honor = {
  id: string;
  title: string;
  description: string;
  winnerID?: string; // For non-weekly awards
  winnerIDs?: string[]; // For Weekly MVPs
  runnerIDs?: string[] | string[][]; // Flat array for non-weekly, 2D for weekly
};

type Player = {
  id: string;
  name: string;
  teamID?: string;
  gp?: number;
  tds?: number;
  ints?: number;
  sacks?: number;
  conv?: number;
  to?: number;
};

type Team = {
  id: string;
  name: string;
  color?: string;
};

export default function BBFLHonorsPage() {
  const [honors, setHonors] = useState<Honor[]>([]);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [teams, setTeams] = useState<Record<string, Team>>({});
  const [loading, setLoading] = useState(true);

  const starredTitles = [
    "The Weekly MVPs",
    "BBFL MVP",
    "Offensive Player of the Year",
    "Defensive Player of the Year",
  ];

  useEffect(() => {
    const fetchHonorsPlayersTeams = async () => {
      try {
        // Fetch honors
        const honorsSnapshot = await getDocs(collection(db, "honors"));
        const honorsList: Honor[] = honorsSnapshot.docs.map((docu) => ({
          id: docu.id,
          ...docu.data(),
        })) as Honor[];

        // Sort starred honors first
        honorsList.sort((a, b) => {
          const aIndex = starredTitles.indexOf(a.title);
          const bIndex = starredTitles.indexOf(b.title);
          if (aIndex === -1 && bIndex === -1) return 0;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });
        setHonors(honorsList);

        // Collect all player IDs
        const playerIDs = new Set<string>();
        honorsList.forEach((honor) => {
          if (honor.title === "The Weekly MVPs") {
            honor.winnerIDs?.forEach((id) => playerIDs.add(id));
            // 2D runnerIDs
            if (Array.isArray(honor.runnerIDs)) {
              (honor.runnerIDs as string[][]).forEach((weekArr) =>
                weekArr?.forEach((id) => playerIDs.add(id))
              );
            }
          } else {
            if (honor.winnerID) playerIDs.add(honor.winnerID);
            if (Array.isArray(honor.runnerIDs)) {
              (honor.runnerIDs as string[]).forEach((id) => playerIDs.add(id));
            }
          }
        });

        // Fetch players
        const playersMap: Record<string, Player> = {};
        await Promise.all(
          Array.from(playerIDs).map(async (pid) => {
            const playerDoc = await getDoc(doc(db, "players", pid));
            if (playerDoc.exists()) {
              const data = playerDoc.data();
              playersMap[pid] = {
                id: playerDoc.id,
                name: data.name,
                teamID: data.teamID,
                gp: data.gp || 0,
                tds: data.tds || 0,
                ints: data.ints || 0,
                sacks: data.sacks || 0,
                conv: data.conv || 0,
                to: data.to || 0,
              };
            }
          })
        );
        setPlayers(playersMap);

        // Fetch teams
        const teamsSnapshot = await getDocs(collection(db, "teams"));
        const teamsMap: Record<string, Team> = {};
        teamsSnapshot.docs.forEach((teamDoc) => {
          const data = teamDoc.data();
          teamsMap[teamDoc.id] = {
            id: teamDoc.id,
            name: data.name,
            color: data.color || "black",
          };
        });
        setTeams(teamsMap);
      } catch (err) {
        console.error("Error fetching honors/players/teams:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHonorsPlayersTeams();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">Loading honors...</p>
      </div>
    );
  }

  const renderPlayerInfo = (playerID?: string) => {
    if (!playerID) return <span className="text-gray-400">TBD</span>;
    const p = players[playerID];
    if (!p) return <span className="text-gray-400">Unknown</span>;
    const team = p.teamID ? teams[p.teamID] : undefined;

    return (
      <div className="flex flex-col items-center">
        <span className="font-semibold text-center">{p.name}</span>
        {team && (
          <span
            className="text-sm font-medium text-center"
            style={{ color: team.color }}
          >
            {team.name}
          </span>
        )}
        <span className="text-xs text-gray-600 mt-1 text-center">
          GP: {p.gp}, TDs: {p.tds}, INTs: {p.ints}, Sacks: {p.sacks}, Conv:{" "}
          {p.conv}, TO: {p.to}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-4xl font-bold mb-10 text-center text-gray-800">
        BBFL Honors
      </h1>

      <div className="space-y-8">
        {honors.map((honor) => (
          <div
            key={honor.id}
            className="p-6 rounded-2xl shadow-md bg-white border transition transform hover:-translate-y-1 hover:shadow-lg"
          >
            <h2
              className={`text-2xl font-bold mb-4 ${
                starredTitles.includes(honor.title)
                  ? "text-indigo-600"
                  : "text-gray-800"
              }`}
            >
              {honor.title}
            </h2>
            <p className="text-gray-600 mb-4">{honor.description}</p>

            {/* Weekly MVP grid: 5 columns x 2 rows */}
            {honor.title === "The Weekly MVPs" && (
              <div className="grid grid-cols-5 gap-4 pb-2">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-indigo-50 rounded-md shadow-sm min-w-[120px]"
                  >
                    <span className="block font-semibold text-center mb-1">
                      Week {idx + 1}
                    </span>
                    {renderPlayerInfo(honor.winnerIDs?.[idx])}
                  </div>
                ))}
              </div>
            )}

            {/* Other awards */}
            {honor.title !== "The Weekly MVPs" && (
              <div className="space-y-3">
                {honor.winnerID ? (
                  // Big winner card
                  <div className="p-4 bg-green-100 rounded-xl shadow-md flex flex-col items-center">
                    <span className="text-lg font-bold text-green-700 mb-1">
                      Winner
                    </span>
                    {renderPlayerInfo(honor.winnerID)}
                  </div>
                ) : honor.runnerIDs &&
                  (honor.runnerIDs as string[]).length > 0 ? (
                  // Show runner-ups only if no winner
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-700 mb-1 text-center">
                      Runner-Ups
                    </h3>
                    {(honor.runnerIDs as string[]).map((rid) => (
                      <div
                        key={rid}
                        className="p-2 bg-gray-100 rounded-md shadow-sm flex flex-col items-center"
                      >
                        {renderPlayerInfo(rid)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 text-center">TBD</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
