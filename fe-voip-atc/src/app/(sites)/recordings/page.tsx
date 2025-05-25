"use client";

import { useEffect, useState } from "react";
import Button from "@/components/button";
import Loading from "@/components/loading";
import { CallListRow } from "@/types/db";
import RecordingCard from "@/components/recordingCard";

// Group recordings by call_id
function groupByCallId(recordings: CallListRow[]) {
  const grouped: { [callId: string]: CallListRow[] } = {};
  for (const rec of recordings) {
    if (!grouped[rec.call_id]) grouped[rec.call_id] = [];
    grouped[rec.call_id].push(rec);
  }
  for (const callId in grouped) {
    grouped[callId].sort(
      (a, b) => a.start_time.getTime() - b.start_time.getTime()
    );
  }
  return grouped;
}

export default function RecordingPage() {
  const [tab, setTab] = useState<"private" | "channel">("private");
  const [recordings, setRecordings] = useState<CallListRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const fetchRecordings = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          tab === "private"
            ? "/api/recordings/private"
            : "/api/recordings/channel"
        );

        if (!res.ok) throw new Error("Failed to load recordings");

        const data: CallListRow[] = await res.json();

        const parsed = data.map((r) => ({
          ...r,
          start_time: new Date(r.start_time),
          end_time: new Date(r.end_time),
        }));

        setRecordings(parsed);
      } catch (err) {
        console.error("Failed to fetch recordings", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecordings();
  }, [tab]);

  // Optional filter by date
  const filtered = recordings.filter((r) =>
    dateFilter ? r.start_time.toISOString().split("T")[0] === dateFilter : true
  );

  const grouped = groupByCallId(filtered);

  return (
    <section className="flex flex-col gap-6 text-white">
      <h1 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-white border-opacity-20">
        Recordings
      </h1>

      {/* Tabs */}
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

      {/* Isi rekaman */}
      <div className="flex flex-col gap-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loading />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="text-gray-400 text-center mt-8 text-xl">
            Tidak ada recording.
          </p>
        ) : (
          Object.entries(grouped).map(([callId, group]) => (
            <RecordingCard key={callId} recordings={group} />
          ))
        )}
      </div>
    </section>
  );
}
