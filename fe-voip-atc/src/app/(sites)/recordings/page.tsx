"use client";
import { useEffect, useState } from "react";
import Button from "@/components/button";
import Loading from "@/components/loading";
import { CallListRow, ChannelHistoryRow } from "@/types/db";
import RecordingCard from "@/components/recordingCard";

// Gabungan type
type RecordingRow =
  | CallListRow
  | (ChannelHistoryRow & { start_time: Date; end_time: Date });

// Group by call_id
function groupByCallId(recordings: RecordingRow[]) {
  const grouped: { [callId: string]: RecordingRow[] } = {};
  for (const rec of recordings) {
    if (!rec.call_id) continue;
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
  const [recordings, setRecordings] = useState<RecordingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        const rawData = await res.json();

        if (tab === "private") {
          const parsed: CallListRow[] = (rawData as CallListRow[]).map((r) => ({
            ...r,
            start_time: new Date(r.start_time),
            end_time: new Date(r.end_time),
          }));
          setRecordings(parsed);
        } else {
          const parsed: RecordingRow[] = (rawData as ChannelHistoryRow[]).map(
            (r) => ({
              ...r,
              start_time: r.start_time
                ? new Date(r.start_time)
                : r.join_time
                ? new Date(r.join_time)
                : new Date(),
              end_time: r.end_time
                ? new Date(r.end_time)
                : r.leave_time
                ? new Date(r.leave_time)
                : new Date(),
            })
          );
          setRecordings(parsed);
        }
      } catch (err) {
        console.error("Failed to fetch recordings", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecordings();
  }, [tab]);

  // Filter & group
  const grouped = groupByCallId(recordings);

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
