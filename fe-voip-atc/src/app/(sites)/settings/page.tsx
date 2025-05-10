"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import Loading from "@/components/loading";

export default function VoiceSettingsPage() {
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedInput, setSelectedInput] = useState<string>("");
  const [selectedOutput, setSelectedOutput] = useState<string>("");
  const [inputVolume, setInputVolume] = useState<number>(50);
  const [outputVolume, setOutputVolume] = useState<number>(50);
  const [pttKey, setPttKey] = useState<string>("Control");
  const [bindingMode, setBindingMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const [micActive, setMicActive] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const fetchDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    setInputDevices(devices.filter((d) => d.kind === "audioinput"));
    setOutputDevices(devices.filter((d) => d.kind === "audiooutput"));
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) return;
        const data = await res.json();
        if (!data) return;

        setSelectedInput(data.input_device_id || "");
        setSelectedOutput(data.output_device_id || "");
        setInputVolume(data.input_volume ?? 50);
        setOutputVolume(data.output_volume ?? 50);
        setPttKey(data.ptt_key || "Control");
      } catch (err) {
        console.error("Failed to fetch settings", err);
        toast.error("Gagal memuat settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDevices().finally(() => fetchSettings());
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (bindingMode) {
        e.preventDefault();
        setPttKey(e.key);
        setBindingMode(false);
        toast.success(`PTT key set to: ${e.key}`);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [bindingMode]);

  const startMicTest = async () => {
    if (micActive) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: selectedInput || undefined },
    });
    const audioCtx = new AudioContext();
    audioContextRef.current = audioCtx;
    analyserRef.current = audioCtx.createAnalyser();
    sourceRef.current = audioCtx.createMediaStreamSource(stream);
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

  const saveSettings = async () => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_device_id: selectedInput,
          output_device_id: selectedOutput,
          input_volume: inputVolume,
          output_volume: outputVolume,
          ptt_key: pttKey,
        }),
      });

      if (res.ok) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error("Failed to save settings.");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save settings.");
    }
  };

  return (
    <div className="text-white p-6 bg-[#2f3136] min-h-screen space-y-8">
      <h1 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-white border-opacity-20">
        Settings
      </h1>
      {isLoading ? (
        <div className="col-span-full flex justify-center items-center py-32">
          <Loading />
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2">Input Device</label>
              <select
                value={selectedInput}
                onChange={(e) => setSelectedInput(e.target.value)}
                className="w-full p-3 bg-[#202225] rounded text-white"
              >
                {inputDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || "Microphone"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2">Output Device</label>
              <select
                value={selectedOutput}
                onChange={(e) => setSelectedOutput(e.target.value)}
                className="w-full p-3 bg-[#202225] rounded text-white"
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

          {/* <div>
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
          </div> */}

          <div>
            <label className="block mb-2">Push-to-Talk Key</label>
            <button
              onClick={() => setBindingMode(true)}
              className="bg-[#40444b] px-4 py-2 rounded text-white"
            >
              {bindingMode ? "Press any key..." : `Current: ${pttKey}`}
            </button>
          </div>

          <div className="flex pt-4 justify-end items-end">
            <button
              onClick={saveSettings}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white font-semibold"
            >
              Save Settings
            </button>
          </div>
        </>
      )}
    </div>
  );
}
