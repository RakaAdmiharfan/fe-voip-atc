"use client";

import { useRef, useState } from "react";
import { CallListRow, ChannelHistoryRow } from "@/types/db";
import AudioPlayer, { RHAP_UI } from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { LuFileText } from "react-icons/lu";

// Gabungan type agar komponen menerima array hybrid
type RecordingRow =
  | CallListRow
  | (ChannelHistoryRow & { start_time: Date; end_time: Date });

function getDuration(
  start: Date | null | undefined,
  end: Date | null | undefined
): string {
  if (!start || !end) return "-";
  const diff = Math.floor((end.getTime() - start.getTime()) / 1000);
  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;
  return `${minutes} min ${seconds} sec`;
}

function getInitials(name: string | undefined | null) {
  return name ? name.slice(0, 2).toUpperCase() : "??";
}

function getStatusColor(status?: string | null) {
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

// Fallback untuk url recording dari dua tipe
function getRecordingUrl(rec: RecordingRow): string | undefined {
  // Prefer s3_url, lalu log_activity_filename, lalu recording_filename
  return (
    rec.recording_s3_url ??
    (rec as ChannelHistoryRow).log_activity_filename ??
    rec.recording_filename ??
    undefined
  );
}

// Fallback untuk log url dari dua tipe
function getLogUrl(rec: RecordingRow): string | undefined {
  return "log_activity_s3_url" in rec && rec.log_activity_s3_url
    ? rec.log_activity_s3_url
    : undefined;
}

// Fallback nama tampilan
function getDisplayName(rec: RecordingRow): string {
  return (
    (rec as CallListRow).display_name ??
    (rec as ChannelHistoryRow).channel_name ??
    (rec as CallListRow).caller_id ??
    (rec as ChannelHistoryRow).caller_id ??
    "Unknown"
  );
}

// Fallback status
function getStatus(rec: RecordingRow): string | undefined {
  return (
    (rec as CallListRow).status ??
    (rec as ChannelHistoryRow).status ??
    undefined
  );
}

export interface RecordingCardProps {
  recordings: RecordingRow[];
}

function getStartTime(rec: RecordingRow): Date | null {
  if ("start_time" in rec && rec.start_time) return rec.start_time;
  if ("join_time" in rec && rec.join_time) return rec.join_time;
  return null;
}
function getEndTime(rec: RecordingRow): Date | null {
  if ("end_time" in rec && rec.end_time) return rec.end_time;
  if ("leave_time" in rec && rec.leave_time) return rec.leave_time;
  return null;
}

export default function RecordingCard({ recordings }: RecordingCardProps) {
  const first = recordings[0];
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const playerRefs = useRef<(HTMLAudioElement | null)[]>([]);

  const displayName = getDisplayName(first);
  const status = getStatus(first) || "Channel";
  const startTime = getStartTime(first);
  const endTime = getEndTime(recordings[recordings.length - 1]);

  // Handle play dan auto-next
  const handlePlay = (index: number) => setCurrentIndex(index);

  const handleEnded = (index: number) => {
    if (index + 1 < recordings.length) {
      const next = playerRefs.current[index + 1];
      if (next) {
        next.play();
        setCurrentIndex(index + 1);
      }
    }
  };

  return (
    <div className="bg-[#292b2f] rounded-2xl p-6 shadow-md flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 bg-[#40444b] text-white rounded-full flex items-center justify-center font-bold text-sm">
          {getInitials(displayName)}
        </div>
        <div className="flex flex-col">
          <h2 className="font-semibold text-lg">Call With {displayName}</h2>
          <span className="text-sm text-gray-400">
            {startTime ? startTime.toLocaleString() : "-"}
          </span>
        </div>
        <div className="ml-auto flex flex-col items-end">
          <span
            className={`text-xs px-3 py-1 rounded-full text-white mb-3 ${getStatusColor(
              status
            )}`}
          >
            {status}
          </span>
          {getLogUrl(first) && (
            <a
              href={getLogUrl(first)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 text-sm bg-[#40444b] hover:bg-[#5a5d63] text-white px-3 py-1 rounded-md flex items-center gap-2"
            >
              <span>
                <LuFileText />
              </span>
              Log Activity
            </a>
          )}
        </div>
      </div>

      {/* Total Duration */}
      <div className="text-sm text-gray-300">
        Total Duration: {getDuration(startTime, endTime)}
      </div>

      {/* Segments */}
      <div className="flex flex-col gap-4 mt-2">
        {recordings.map((rec, idx) => {
          const url = getRecordingUrl(rec);
          return (
            <div
              key={idx}
              className="bg-[#2f3136] p-4 rounded-xl flex flex-col gap-2 shadow-sm border border-[#40444b]"
            >
              {url ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300 font-semibold">
                      🔊 Segment {idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      {currentIndex === idx && (
                        <span className="text-xs text-green-400 font-medium">
                          Now Playing
                        </span>
                      )}
                      <a
                        href={url}
                        download
                        className="text-xs bg-[#40444b] hover:bg-[#5a5d63] text-white px-3 py-1 rounded-md"
                      >
                        ⬇
                      </a>
                    </div>
                  </div>
                  {/* AudioPlayer wrapper to get HTMLAudioElement for autoplay control */}
                  <AudioPlayer
                    ref={(el) => {
                      const audio = el?.audio.current;
                      if (audio) playerRefs.current[idx] = audio;
                    }}
                    src={url}
                    onPlay={() => handlePlay(idx)}
                    onEnded={() => handleEnded(idx)}
                    showJumpControls={false}
                    customVolumeControls={[RHAP_UI.VOLUME]}
                    layout="horizontal"
                    className="!bg-gray-200 !rounded-lg !px-4 !py-2"
                  />
                </>
              ) : (
                <p className="text-sm italic text-gray-400">
                  Recording belum tersedia.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
