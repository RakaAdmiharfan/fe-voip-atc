"use client";

import { useEffect, useState } from "react";
import Button from "@/components/button";
import { CallListRow } from "@/types/db";
import AudioPlayer, { RHAP_UI } from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import Loading from "@/components/loading";

function getDuration(start: Date, end: Date): string {
  const diff = Math.floor((end.getTime() - start.getTime()) / 1000);
  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;
  return `${minutes} min ${seconds} sec`;
}

function getInitials(id: string) {
  return id ? id.slice(0, 2).toUpperCase() : "??";
}

function getStatusColor(status: string) {
  switch (status) {
    case "ANSWER":
      return "bg-green-500";
    case "CANCEL":
      return "bg-yellow-500";
    case "NOANSWER":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

export default function RecordingPage() {
  const [tab, setTab] = useState<"private" | "channel">("private");
  const [recordings, setRecordings] = useState<CallListRow[]>([]);
  const [dateFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecordings = async () => {
      setIsLoading(true); // mulai loading
      try {
        const res = await fetch(
          tab === "private"
            ? "/api/recordings/private"
            : "/api/recordings/channel"
        );
        const data = await res.json();

        const parsed = (Array.isArray(data) ? data : []).map((r) => ({
          ...r,
          start_time: new Date(r.start_time),
          end_time: new Date(r.end_time),
        }));

        setRecordings(parsed);
      } catch (err) {
        console.error("Failed to fetch recordings", err);
      } finally {
        setIsLoading(false); // selesai loading
      }
    };

    fetchRecordings();
  }, [tab]);

  const filtered = recordings.filter((r) =>
    dateFilter ? r.start_time.toISOString().split("T")[0] === dateFilter : true
  );

  return (
    <section className="flex flex-col gap-6 text-white">
      <h1 className="text-2xl font-bold mb-4 pb-2 text-white border-b-2 border-white border-opacity-20">
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
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center py-24">
            <Loading />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-center col-span-full">
            Tidak ada recording.
          </p>
        ) : (
          filtered.map((r, i) => (
            <div
              key={i}
              className="bg-[#292b2f] p-6 rounded-xl shadow-md flex flex-col gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#40444b] text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {getInitials(r.receiver_id)}
                </div>
                <div className="flex flex-col">
                  <h2 className="font-semibold">
                    Call With {r.receiver_id ?? "Unknown"}
                  </h2>
                  <span className="text-sm text-gray-400">
                    {r.start_time.toLocaleString()}
                  </span>
                </div>
                <span
                  className={`ml-auto text-xs px-2 py-1 rounded-full text-white ${getStatusColor(
                    r.status
                  )}`}
                >
                  {r.status}
                </span>
              </div>

              <div className="text-sm text-gray-400">
                Duration: {getDuration(r.start_time, r.end_time)}
              </div>

              <AudioPlayer
                src={r.recording_s3_url ?? null}
                showJumpControls={false}
                customVolumeControls={[RHAP_UI.VOLUME]}
                layout="horizontal"
                className="!bg-gray-200 !rounded-lg !px-4 !py-2"
              />

              <div className="flex justify-end">
                <a
                  href={r.recording_s3_url ?? "#"}
                  download
                  className="text-sm bg-[#202225] hover:bg-[#40444b] px-4 py-2 rounded-md"
                >
                  Download
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
