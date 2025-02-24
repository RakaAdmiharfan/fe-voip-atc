"use client";
import { useState } from "react";
import Button from "@/components/button";

export default function CallList() {
  const [callType, setCallType] = useState<"direct" | "channel">("direct");

  const callHistory = [
    {
      id: 1,
      type: "direct",
      contact: "John Doe",
      time: "10:30 AM",
      duration: "15 min",
      recordingUrl: "/recordings/call1.mp3",
    },
    {
      id: 2,
      type: "channel",
      contact: "Project Team",
      time: "11:45 AM",
      duration: "30 min",
      recordingUrl: "/recordings/call2.mp3",
    },
    {
      id: 3,
      type: "direct",
      contact: "Jane Smith",
      time: "01:15 PM",
      duration: "10 min",
      recordingUrl: "/recordings/call3.mp3",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Call List</h1>

      {/* Toggle Direct Call / Channel */}
      <div className="flex gap-4 mb-6">
        <Button
          type="button"
          text="Direct Call"
          onClick={() => setCallType("direct")}
          color={callType === "direct" ? "primary" : "neutral"}
        />
        <Button
          type="button"
          text="Channel"
          onClick={() => setCallType("channel")}
          color={callType === "channel" ? "primary" : "neutral"}
        />
      </div>

      {/* Call List */}
      <div className="overflow-x-auto">
        <table className="w-full border-b border-gray-300 rounded-lg">
          <tbody>
            {callHistory
              .filter((call) => call.type === callType)
              .map((call) => (
                <tr
                  key={call.id}
                  className="border-b justify-center items-center mx-auto text-center"
                >
                  <td className="p-4">{call.contact}</td>
                  <td className="p-4">{call.time}</td>
                  <td className="p-4">{call.duration}</td>
                  <td className="p-4">
                    <a
                      href={call.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-orange-400 rounded-full hover:bg-gray-300 text-white"
                    >
                      Open Recording
                    </a>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
