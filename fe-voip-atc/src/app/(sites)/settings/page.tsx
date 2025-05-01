"use client";

import { useEffect, useState, useRef } from "react";

export default function VoiceSettingsPage() {
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedInput, setSelectedInput] = useState<string>("");
  const [selectedOutput, setSelectedOutput] = useState<string>("");
  const [inputVolume, setInputVolume] = useState<number>(50);
  const [outputVolume, setOutputVolume] = useState<number>(50);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [inputMode, setInputMode] = useState<"voice" | "ptt">("voice");

  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const fetchDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    setInputDevices(devices.filter((d) => d.kind === "audioinput"));
    setOutputDevices(devices.filter((d) => d.kind === "audiooutput"));
  };

  const startMicTest = async () => {
    if (micActive) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: selectedInput || undefined },
    });
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
    sourceRef.current.connect(analyserRef.current);
    analyserRef.current.fftSize = 256;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const draw = () => {
      analyserRef.current?.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setAudioLevel(avg);
      if (micActive) requestAnimationFrame(draw);
    };

    setMicActive(true);
    draw();
  };

  const stopMicTest = () => {
    audioContextRef.current?.close();
    setMicActive(false);
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <div className="text-white p-6 bg-[#2f3136] min-h-screen space-y-8">
      <h1 className="text-2xl font-bold">Voice & Video</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-1">Input Device</label>
          <select
            value={selectedInput}
            onChange={(e) => setSelectedInput(e.target.value)}
            className="w-full p-2 bg-[#202225] rounded text-white"
          >
            {inputDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || "Microphone"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Output Device</label>
          <select
            value={selectedOutput}
            onChange={(e) => setSelectedOutput(e.target.value)}
            className="w-full p-2 bg-[#202225] rounded text-white"
          >
            {outputDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || "Speaker"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Input Volume</label>
          <input
            type="range"
            min={0}
            max={100}
            value={inputVolume}
            onChange={(e) => setInputVolume(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block mb-1">Output Volume</label>
          <input
            type="range"
            min={0}
            max={100}
            value={outputVolume}
            onChange={(e) => setOutputVolume(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <label className="block mb-2">Mic Test</label>
        <button
          onClick={micActive ? stopMicTest : startMicTest}
          className="bg-indigo-600 px-4 py-2 rounded text-white mb-2"
        >
          {micActive ? "Stop" : "Let's Check"}
        </button>
        <div className="h-4 w-full bg-gray-700 rounded overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-75"
            style={{ width: `${Math.min(audioLevel, 100)}%` }}
          ></div>
        </div>
      </div>

      <div>
        <label className="block mb-2">Input Mode</label>
        <div className="space-y-2">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="inputMode"
              checked={inputMode === "voice"}
              onChange={() => setInputMode("voice")}
            />
            Voice Activity
          </label>
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="inputMode"
              checked={inputMode === "ptt"}
              onChange={() => setInputMode("ptt")}
            />
            Push to Talk
          </label>
        </div>
      </div>
    </div>
  );
}
