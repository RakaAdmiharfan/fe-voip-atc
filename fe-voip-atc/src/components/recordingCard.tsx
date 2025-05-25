"use client";

import { useEffect, useRef, useState } from "react";
import { CallListRow } from "@/types/db";
import AudioPlayer, { RHAP_UI } from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

function getDuration(start: Date, end: Date): string {
  const diff = Math.floor((end.getTime() - start.getTime()) / 1000);
  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;
  return `${minutes} min ${seconds} sec`;
}

function getInitials(name: string | undefined | null) {
  return name ? name.slice(0, 2).toUpperCase() : "??";
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

export default function RecordingCard({
  recordings,
}: {
  recordings: CallListRow[];
}) {
  const first = recordings[0];
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const playerRefs = useRef<(HTMLAudioElement | null)[]>([]);

  // Saat user klik tombol play manual
  const handlePlay = (index: number) => {
    setCurrentIndex(index);
  };

  // Saat audio selesai, autoplay ke berikutnya
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
          {getInitials(first.display_name)}
        </div>
        <div className="flex flex-col">
          <h2 className="font-semibold text-lg">
            Call With {first.display_name ?? "Unknown"}
          </h2>
          <span className="text-sm text-gray-400">
            {first.start_time.toLocaleString()}
          </span>
        </div>
        <span
          className={`ml-auto text-xs px-3 py-1 rounded-full text-white ${getStatusColor(
            first.status
          )}`}
        >
          {first.status}
        </span>
      </div>

      {/* Total Duration */}
      <div className="text-sm text-gray-300">
        Total Duration:{" "}
        {getDuration(
          recordings[0].start_time,
          recordings[recordings.length - 1].end_time
        )}
      </div>

      {/* Segments */}
      <div className="flex flex-col gap-4 mt-2">
        {recordings.map((rec, idx) => (
          <div
            key={idx}
            className="bg-[#2f3136] p-4 rounded-xl flex flex-col gap-2 shadow-sm border border-[#40444b]"
          >
            {rec.recording_s3_url ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300 font-semibold">
                    🔊 Segment {idx + 1}
                  </span>
                  <a
                    href={rec.recording_s3_url}
                    download
                    className="text-xs bg-[#40444b] hover:bg-[#5a5d63] text-white px-3 py-1 rounded-md"
                  >
                    ⬇
                  </a>
                </div>

                {/* AudioPlayer wrapper to get HTMLAudioElement for autoplay control */}
                <AudioPlayer
                  ref={(el) => {
                    const audio = el?.audio.current;
                    if (audio) playerRefs.current[idx] = audio;
                  }}
                  src={rec.recording_s3_url ?? undefined}
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
        ))}
      </div>
    </div>
  );
}
