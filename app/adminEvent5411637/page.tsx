"use client";

import { useState, useMemo, useEffect } from "react";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

type Team = { id: string; name: string };

type ScoreEntry = { team1Score: number; team2Score: number };

function generateRoundRobinMatchups(selectedTeams: Team[]) {
  const matchups: { team1: Team; team2: Team }[] = [];
  for (let i = 0; i < selectedTeams.length; i++) {
    for (let j = i + 1; j < selectedTeams.length; j++) {
      matchups.push({ team1: selectedTeams[i], team2: selectedTeams[j] });
    }
  }
  return matchups;
}

// Default league points distribution by rank (1st to 4th)
const leaguePointsDistribution = [10, 6, 3, 1];

export default function AdminEventPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
  const [scores, setScores] = useState<{ [matchupKey: string]: ScoreEntry }>(
    {}
  );

  // Load teams from Firestore
  useEffect(() => {
    async function fetchTeams() {
      const snapshot = await getDocs(collection(db, "teams"));
      const loaded = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name ?? doc.id,
      }));
      setTeams(loaded);
    }
    fetchTeams();
  }, []);

  function toggleTeam(team: Team) {
    setSelectedTeams((prev) => {
      if (prev.find((t) => t.id === team.id)) {
        const newSelected = prev.filter((t) => t.id !== team.id);
        const newScores = { ...scores };
        Object.keys(newScores).forEach((key) => {
          if (key.includes(team.id)) delete newScores[key];
        });
        setScores(newScores);
        return newSelected;
      } else {
        return [...prev, team];
      }
    });
  }

  const matchups = generateRoundRobinMatchups(selectedTeams);

  function handleScoreChange(
    matchupKey: string,
    team: "team1Score" | "team2Score",
    value: string
  ) {
    const num = parseInt(value);
    setScores((prev) => ({
      ...prev,
      [matchupKey]: {
        team1Score: prev[matchupKey]?.team1Score ?? 0,
        team2Score: prev[matchupKey]?.team2Score ?? 0,
        [team]: isNaN(num) ? 0 : num,
      },
    }));
  }

  const rankings = useMemo(() => {
    if (selectedTeams.length < 2) return [];

    const stats: {
      [teamId: string]: {
        name: string;
        wins: number;
        losses: number;
        pointsFor: number;
        pointsAgainst: number;
        pointDiff: number;
      };
    } = {};

    selectedTeams.forEach((team) => {
      stats[team.id] = {
        name: team.name,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDiff: 0,
      };
    });

    matchups.forEach(({ team1, team2 }) => {
      const key = `${team1.id}-${team2.id}`;
      const score = scores[key];
      if (!score) return;

      const { team1Score, team2Score } = score;

      stats[team1.id].pointsFor += team1Score;
      stats[team1.id].pointsAgainst += team2Score;
      stats[team2.id].pointsFor += team2Score;
      stats[team2.id].pointsAgainst += team1Score;

      if (team1Score > team2Score) {
        stats[team1.id].wins += 1;
        stats[team2.id].losses += 1;
      } else if (team2Score > team1Score) {
        stats[team2.id].wins += 1;
        stats[team1.id].losses += 1;
      }
    });

    selectedTeams.forEach((team) => {
      stats[team.id].pointDiff =
        stats[team.id].pointsFor - stats[team.id].pointsAgainst;
    });

    return Object.entries(stats)
      .map(([id, s]) => ({
        teamId: id,
        team: s.name,
        ...s,
      }))
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.pointDiff - a.pointDiff;
      });
  }, [selectedTeams, matchups, scores]);

  const rankedWithPoints = useMemo(() => {
    if (rankings.length === 0) return [];

    const result: ((typeof rankings)[0] & { leaguePoints: number })[] = [];
    let currentRank = 1;
    let i = 0;

    while (i < rankings.length) {
      const tiedTeams = [rankings[i]];
      while (
        i + tiedTeams.length < rankings.length &&
        rankings[i].wins === rankings[i + tiedTeams.length].wins &&
        rankings[i].pointDiff === rankings[i + tiedTeams.length].pointDiff
      ) {
        tiedTeams.push(rankings[i + tiedTeams.length]);
      }

      const totalPoints = tiedTeams
        .map((_, idx) => leaguePointsDistribution[currentRank - 1 + idx] ?? 0)
        .reduce((a, b) => a + b, 0);
      const avgPoints =
        tiedTeams.length > 0 ? totalPoints / tiedTeams.length : 0;

      tiedTeams.forEach((team) => {
        result.push({ ...team, leaguePoints: avgPoints });
      });

      i += tiedTeams.length;
      currentRank += tiedTeams.length;
    }

    return result.sort((a, b) => b.leaguePoints - a.leaguePoints);
  }, [rankings]);

  async function saveEvent() {
    const eventDocId = `week${selectedWeek}`;
    const eventData = {
      week: selectedWeek.toString(),
      date: new Date().toISOString(),
      teams: selectedTeams.map((t) => t.id),
      games: matchups.map(({ team1, team2 }) => ({
        team1: team1.id,
        team2: team2.id,
        score1: scores[`${team1.id}-${team2.id}`]?.team1Score ?? 0,
        score2: scores[`${team1.id}-${team2.id}`]?.team2Score ?? 0,
      })),
      rankings: rankedWithPoints.map((r) => ({
        team: r.teamId,
        leaguePoints: r.leaguePoints,
        wins: r.wins,
        losses: r.losses,
        pointDiff: r.pointDiff,
      })),
    };

    try {
      await setDoc(doc(db, "events", eventDocId), eventData);

      // update team stats in Firestore
      for (const teamData of rankedWithPoints) {
        const teamDocRef = doc(db, "teams", teamData.teamId);
        const teamSnap = await getDoc(teamDocRef);
        const existing = teamSnap.exists() ? teamSnap.data() : {};

        const updatedStats = {
          wins: (existing.wins ?? 0) + teamData.wins,
          losses: (existing.losses ?? 0) + teamData.losses,
          pointsFor: (existing.pointsFor ?? 0) + teamData.pointsFor,
          pointsAg: (existing.pointsAg ?? 0) + teamData.pointsAgainst,
          leaguePoints: (existing.leaguePoints ?? 0) + teamData.leaguePoints,
          eventsPlayed: (existing.eventsPlayed ?? 0) + 1,
          lastEventWeek: selectedWeek,
          lastEventPoints: teamData.leaguePoints,
        };

        await setDoc(teamDocRef, {
          ...existing,
          ...updatedStats,
          name: existing.name ?? teamData.team,
        });
      }

      alert("Event and team stats updated successfully!");
    } catch (err) {
      console.error("Error saving event:", err);
      alert("Failed to save event.");
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Event Page</h1>

      <label className="block mb-4">
        <span className="font-semibold">Select Week:</span>
        <select
          className="ml-2 border rounded p-1"
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
        >
          {[...Array(15)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              Week {i + 1}
            </option>
          ))}
        </select>
      </label>

      <div className="mb-6">
        <h2 className="font-semibold mb-2">Select Teams Playing This Week:</h2>
        <div className="grid grid-cols-2 gap-2">
          {teams.map((team) => (
            <label key={team.id} className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={!!selectedTeams.find((t) => t.id === team.id)}
                onChange={() => toggleTeam(team)}
                className="form-checkbox"
              />
              <span>{team.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="font-semibold mb-4">Matchups (Round Robin):</h2>
        {matchups.length === 0 && (
          <p className="italic text-gray-500">
            Select at least 2 teams to generate matchups.
          </p>
        )}

        {matchups.map(({ team1, team2 }) => {
          const key = `${team1.id}-${team2.id}`;
          return (
            <div key={key} className="flex items-center space-x-4 mb-3">
              <span className="w-32">{team1.name}</span>
              <input
                type="number"
                min={0}
                placeholder="Score"
                value={scores[key]?.team1Score ?? ""}
                onChange={(e) =>
                  handleScoreChange(key, "team1Score", e.target.value)
                }
                className="border rounded w-20 p-1 text-center"
              />
              <span>vs</span>
              <input
                type="number"
                min={0}
                placeholder="Score"
                value={scores[key]?.team2Score ?? ""}
                onChange={(e) =>
                  handleScoreChange(key, "team2Score", e.target.value)
                }
                className="border rounded w-20 p-1 text-center"
              />
              <span className="w-32 text-right">{team2.name}</span>
            </div>
          );
        })}
      </div>

      <div className="mb-6">
        <h2 className="font-semibold mb-4">Rankings:</h2>
        {rankedWithPoints.length === 0 && (
          <p className="italic text-gray-500">Enter scores to see rankings.</p>
        )}
        {rankedWithPoints.length > 0 && (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Rank</th>
                <th className="border border-gray-300 p-2">Team</th>
                <th className="border border-gray-300 p-2">Wins</th>
                <th className="border border-gray-300 p-2">Losses</th>
                <th className="border border-gray-300 p-2">Points For</th>
                <th className="border border-gray-300 p-2">Points Against</th>
                <th className="border border-gray-300 p-2">Point Diff</th>
                <th className="border border-gray-300 p-2">League Points</th>
              </tr>
            </thead>
            <tbody>
              {rankedWithPoints.map((team, idx) => (
                <tr key={team.teamId} className="text-center">
                  <td className="border border-gray-300 p-2">{idx + 1}</td>
                  <td className="border border-gray-300 p-2">{team.team}</td>
                  <td className="border border-gray-300 p-2">{team.wins}</td>
                  <td className="border border-gray-300 p-2">{team.losses}</td>
                  <td className="border border-gray-300 p-2">
                    {team.pointsFor}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {team.pointsAgainst}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {team.pointDiff}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {team.leaguePoints.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <button
        onClick={saveEvent}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        disabled={selectedTeams.length < 2}
      >
        Save Event
      </button>
    </div>
  );
}
