"use client";

import { useState } from "react";

export default function JobForm() {
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState("Applied");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const job = {
      company,
      position,
      status,
      date,
      notes,
    };

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(job),
      });

      if (!response.ok) {
        throw new Error("Failed to add application");
      }

      const data = await response.json();

      console.log("Application added:", data);

      alert("Application added successfully!");

      setCompany("");
      setPosition("");
      setStatus("Applied");
      setDate("");
      setNotes("");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-5 rounded-xl bg-white p-6 shadow"
    >
      <div>
        <label className="mb-2 block font-medium">
          Company
        </label>

        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full rounded-lg border p-3"
          placeholder="Example: CodeGen"
          required
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">
          Position
        </label>

        <input
          type="text"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full rounded-lg border p-3"
          placeholder="Software Engineer Intern"
          required
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">
          Status
        </label>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-lg border p-3"
        >
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block font-medium">
          Application Date
        </label>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border p-3"
          required
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">
          Notes
        </label>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border p-3"
          placeholder="Add notes..."
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-gray-900 px-5 py-3 text-white"
      >
        Add Application
      </button>
    </form>
  );
}