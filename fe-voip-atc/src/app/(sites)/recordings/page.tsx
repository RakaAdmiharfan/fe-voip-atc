"use client";

import { useState } from "react";
import Button from "@/components/button";
import { FaPlay } from "react-icons/fa";

export default function RecordingPage() {
  const [tab, setTab] = useState<"private" | "channel">("private");

  const recordings = [
    {
      id: 1,
      type: "private",
      name: "Call with John",
      time: "2025-04-29 10:30",
      duration: "15 min",
      url: "/recordings/private1.mp3",
    },
    {
      id: 2,
      type: "channel",
      name: "General Meeting",
      time: "2025-04-28 14:00",
      duration: "30 min",
      url: "/recordings/channel1.mp3",
    },
    {
      id: 3,
      type: "private",
      name: "Call with Jane",
      time: "2025-04-27 09:45",
      duration: "10 min",
      url: "/recordings/private2.mp3",
    },
  ];

  const filtered = recordings.filter((r) => r.type === tab);

  return (
    <section className="flex flex-col gap-6 text-white">
      <h1 className="text-2xl font-bold mb-4 pb-2 text-white border-b-2 border-white border-opacity-30">
        Recordings
      </h1>

      <div className="flex gap-4 mb-4">
        <Button
          type="button"
          text="Private Call"
          onClick={() => setTab("private")}
          color={tab === "private" ? "black" : "neutral"}
        />
        <Button
          type="button"
          text="Channel Call"
          onClick={() => setTab("channel")}
          color={tab === "channel" ? "black" : "neutral"}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((recording) => (
          <div
            key={recording.id}
            className="bg-[#292b2f] p-6 rounded-xl shadow-md flex flex-col justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold mb-1">{recording.name}</h2>
              <p className="text-sm text-gray-400">{recording.time}</p>
              <p className="text-sm text-gray-400">
                Duration: {recording.duration}
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <a
                href={recording.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#202225] hover:bg-[#40444b] text-white px-4 py-2 rounded-md text-sm"
              >
                <FaPlay /> Play
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
