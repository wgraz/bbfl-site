"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase"; // adjust path to your Firebase config

type Captain = {
  id: string;
  color: string;
  eventsPlayed: number;
  leaguePoints: number;
  losses: number;
  name: string;
  pointsAg: number;
  pointsFor: number;
  rank: number;
  roster: string[]; // array of player ids or names? unclear
  wins: number;
};

type Player = {
  id: string;
  gp: number;
  ints: number;
  name: string;
  photoURL: string;
  pos: string;
  sacks: number;
  tds: number;
  teamID: string;
  conv: number;
  to: number;
};

export default function AdminEditPage() {
  const [captains, setCaptains] = useState<Captain[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedCaptainId, setSelectedCaptainId] = useState<string | null>(
    null
  );

  // Local copy of editable team and players
  const [teamData, setTeamData] = useState<Captain | null>(null);
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);

  // Load all captains on mount
  useEffect(() => {
    async function fetchCaptains() {
      const snapshot = await getDocs(collection(db, "teams"));
      const loadedCaptains: Captain[] = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Captain)
      );
      setCaptains(loadedCaptains);
    }
    fetchCaptains();
  }, []);

  // When selectedCaptainId changes, load that captain and its players
  useEffect(() => {
    if (!selectedCaptainId) {
      setTeamData(null);
      setTeamPlayers([]);
      return;
    }
    async function fetchCaptainAndPlayers() {
      // Find captain from list (already loaded)
      const team = captains.find((c) => c.id === selectedCaptainId);
      if (!team) return;

      setTeamData({ ...team }); // clone for editing

      // Query players for this team
      const q = query(
        collection(db, "players"),
        where("teamID", "==", selectedCaptainId)
      );
      const playerSnap = await getDocs(q);
      const teamPlayers: Player[] = playerSnap.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Player)
      );
      setTeamPlayers(teamPlayers);
    }
    fetchCaptainAndPlayers();
  }, [selectedCaptainId, captains]);

  // Handlers for editing team
  function handleTeamChange(field: keyof Captain, value: string | number) {
    if (!teamData) return;
    setTeamData({
      ...teamData,
      [field]:
        typeof value === "string" &&
        !isNaN(Number(value)) &&
        field !== "color" &&
        field !== "name"
          ? Number(value)
          : value,
    });
  }

  // Handlers for editing players
  function handlePlayerChange(
    playerId: string,
    field: keyof Player,
    value: string | number
  ) {
    setTeamPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? {
              ...p,
              [field]:
                typeof value === "string" &&
                !isNaN(Number(value)) &&
                field !== "pos" &&
                field !== "name" &&
                field !== "photoURL" &&
                field !== "teamID"
                  ? Number(value)
                  : value,
            }
          : p
      )
    );
  }

  // Save team changes to Firestore
  async function saveTeam() {
    if (!teamData) return;
    const teamRef = doc(db, "teams", teamData.id);
    const { id, ...dataToSave } = teamData;
    await updateDoc(teamRef, dataToSave);
    alert("Team saved!");
    // Update local captains state to reflect changes
    setCaptains((prev) =>
      prev.map((c) => (c.id === teamData.id ? teamData : c))
    );
  }

  // Save player changes to Firestore
  async function savePlayers() {
    for (const player of teamPlayers) {
      const playerRef = doc(db, "players", player.id);
      const { id, ...dataToSave } = player;
      await updateDoc(playerRef, dataToSave);
    }
    alert("Players saved!");
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Edit Page</h1>

      {/* List of Teams */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Teams</h2>
        <ul className="max-h-48 overflow-y-auto border p-2 rounded">
          {captains.map((c) => (
            <li key={c.id}>
              <button
                className={`w-full text-left py-1 px-2 rounded ${
                  c.id === selectedCaptainId
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-100"
                }`}
                onClick={() => setSelectedCaptainId(c.id)}
              >
                {c.name || "[Unnamed]"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Edit Team */}
      {teamData && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Edit Team: {teamData.name}
          </h2>
          <div className="grid grid-cols-2 gap-4 max-w-xl">
            {[
              { label: "Name", field: "name", type: "text" },
              { label: "Color", field: "color", type: "text" },
              { label: "Events Played", field: "eventsPlayed", type: "number" },
              { label: "League Points", field: "leaguePoints", type: "number" },
              { label: "Losses", field: "losses", type: "number" },
              { label: "Points Against", field: "pointsAg", type: "number" },
              { label: "Points For", field: "pointsFor", type: "number" },
              { label: "Rank", field: "rank", type: "number" },
              { label: "Wins", field: "wins", type: "number" },
            ].map(({ label, field, type }) => (
              <div key={field}>
                <label className="block font-medium mb-1">{label}</label>
                <input
                  type={type}
                  value={(teamData as any)[field]}
                  onChange={(e) =>
                    handleTeamChange(
                      field as keyof Captain,
                      type === "number"
                        ? Number(e.target.value)
                        : e.target.value
                    )
                  }
                  className="border rounded px-2 py-1 w-full"
                />
              </div>
            ))}
          </div>
          <button
            onClick={saveTeam}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save Team
          </button>
        </section>
      )}

      {/* Edit Players */}
      {teamPlayers.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Players on Team</h2>
          <div className="space-y-6 max-w-4xl">
            {teamPlayers.map((player) => (
              <div key={player.id} className="border rounded p-4">
                <h3 className="font-semibold mb-2">
                  {player.name || "[Unnamed Player]"}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Name", field: "name", type: "text" },
                    { label: "Photo URL", field: "photoURL", type: "text" },
                    { label: "Position", field: "pos", type: "text" },
                    { label: "Games Played", field: "gp", type: "number" },
                    { label: "Interceptions", field: "ints", type: "number" },
                    { label: "Sacks", field: "sacks", type: "number" },
                    { label: "Touchdowns", field: "tds", type: "number" },
                    { label: "Conversions", field: "conv", type: "number" },
                    { label: "Turnovers", field: "to", type: "number" },
                    { label: "Team ID", field: "teamID", type: "text" },
                  ].map(({ label, field, type }) => (
                    <div key={field}>
                      <label className="block font-medium mb-1">{label}</label>
                      <input
                        type={type}
                        value={(player as any)[field]}
                        onChange={(e) =>
                          handlePlayerChange(
                            player.id,
                            field as keyof Player,
                            type === "number"
                              ? Number(e.target.value)
                              : e.target.value
                          )
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={savePlayers}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save Players
          </button>
        </section>
      )}
    </div>
  );
}
