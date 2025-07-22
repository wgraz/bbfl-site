"use client";

import { useState } from "react";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SignUp() {
  const [name, setName] = useState("");
  const [pos, setPos] = useState("QB");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const positions = ["QB", "WR", "DEF"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);

    try {
      const snapshot = await getDocs(collection(db, "players"));
      const takenIDs = snapshot.docs.map((doc) => doc.id);

      // Find first available pX
      let nextID = 1;
      while (takenIDs.includes(`p${nextID}`)) {
        nextID++;
      }
      const newID = `p${nextID}`;

      await setDoc(doc(db, "players", newID), {
        name,
        pos,
        teamID: "",
        gp: 0,
        tds: 0,
        ints: 0,
        sacks: 0,
        conv: 0,
        photoURL: "",
      });

      setName("");
      setPos("QB");
      setSuccess(true);
    } catch (error) {
      console.error("Error submitting:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-500 to-blue-800 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">BBFL Sign Up</h1>

        <input
          type="text"
          placeholder="Your Name"
          className="w-full border p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label htmlFor="position" className="block font-semibold text-gray-700">
          Position
        </label>
        <select
          id="position"
          value={pos}
          onChange={(e) => setPos(e.target.value)}
          className="w-full border p-2 rounded"
          required
        >
          {positions.map((position) => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>

        {success && (
          <p className="text-green-600 text-center">Successfully signed up!</p>
        )}
      </form>
    </div>
  );
}
