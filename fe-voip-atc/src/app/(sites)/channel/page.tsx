"use client";

import { useEffect, useState } from "react";
import Button from "@/components/button";
import TextField from "@/components/textfield";
import { FaTrash, FaSignInAlt } from "react-icons/fa";
import { useCall } from "@/context/callContext";
import { Inviter, UserAgent } from "sip.js";
import { useVoIP } from "@/context/voipContext";
import axios from "axios";
import { toast } from "react-toastify";
import ModalAdd, { FormData } from "@/components/modal-add";
import Loading from "@/components/loading";

interface Channel {
  id: number;
  name: string;
  number: string;
  created_at: string;
  members?: number;
}

export default function ChannelPage() {
  const [search, setSearch] = useState("");
  const { startCall } = useCall();
  const { userAgent } = useVoIP();
  const [joining, setJoining] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalJoinOpen, setModalJoinOpen] = useState(false);
  const [modalCreateOpen, setModalCreateOpen] = useState(false);
  const [joinForm, setJoinForm] = useState<FormData>({
    name: "",
  });
  const [createForm, setCreateForm] = useState<FormData>({
    name: "",
  });

  const fetchChannels = async () => {
    try {
      const res = await fetch("/api/channel/");
      const data: Channel[] = await res.json();
      setChannels(data);
    } catch (err) {
      toast.error("Failed to fetch channels");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchChannels();
    };
    init();
  }, []);

  const handleJoinChannel = async () => {
    if (joining) return;

    setJoining(true);
    try {
      const res = await fetch("/api/channel/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(joinForm),
      });

      if (res.ok) {
        await fetchChannels(); // ✅ fetch ulang
        setJoinForm({ name: "" });
        setModalJoinOpen(false);
        toast.success("You have joined the channel");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to join channel"); // ✅ tampilkan error spesifik
      }
    } catch (error) {
      console.error("Failed to join channel:", error);
      toast.error("Something went wrong");
    } finally {
      setJoining(false); // ✅ reset joining
    }
  };

  const handleCreateChannel = async () => {
    if (!createForm.name?.trim()) {
      toast.warn("Channel name is required");
      return;
    }

    setJoining(true);
    try {
      const res = await fetch("/api/channel/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createForm.name }),
      });

      if (res.ok) {
        await fetchChannels();
        setCreateForm({ name: "" });
        setModalCreateOpen(false);
        toast.success("Channel created successfully");
      } else {
        if (res.status === 409) {
          toast.error("Channel name already exists"); // 💥 Khusus error duplikat
        } else {
          const data = await res.json();
          toast.error(data.error || "Failed to create channel");
        }
      }
    } catch (err) {
      console.error("Failed to create channel", err);
      toast.error("Something went wrong");
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async (name: string) => {
    try {
      const res = await fetch("/api/channel/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setChannels((prev) => prev.filter((c) => c.name !== name));
        toast.success("Berhasil keluar dari channel");
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal keluar dari channel");
      }
    } catch (err) {
      console.error("Gagal leave channel:", err);
      toast.error("Terjadi kesalahan saat keluar dari channel");
    }
  };

  const filtered = channels.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="flex flex-col gap-6 text-white">
      {modalJoinOpen && (
        <ModalAdd
          title="Join Channel"
          formData={joinForm}
          setFormData={setJoinForm}
          button1Text="Cancel"
          button2Text="Join"
          onButton1Click={() => setModalJoinOpen(false)}
          onButton2Click={handleJoinChannel}
          showFields={{ name: true }} // hanya name
        />
      )}

      {modalCreateOpen && (
        <ModalAdd
          title="Create Channel"
          formData={createForm}
          setFormData={setCreateForm}
          button1Text="Cancel"
          button2Text="Create"
          onButton1Click={() => setModalCreateOpen(false)}
          onButton2Click={handleCreateChannel}
          showFields={{ name: true }} // hanya name
        />
      )}

      <h1 className="text-2xl font-bold mb-4 pb-2 text-white border-b-2 border-white border-opacity-20">
        Channel
      </h1>

      <div className="flex flex-col md:flex-row items-center md:justify-between mb-6 gap-4">
        <div className="w-52 md:w-80">
          <TextField
            name="search"
            type="search"
            placeholder="Search by channel name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            label=""
          />
        </div>

        <div className="flex gap-3">
          <Button
            text="Join Channel"
            type="button"
            onClick={() => setModalJoinOpen(true)}
            color="black"
            width={170}
          />

          <Button
            text="Create Channel"
            type="button"
            onClick={() => setModalCreateOpen(true)}
            color="black"
            width={170}
          />
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center text-gray-400 py-16">
          {/* <img
            src="/empty/channel.svg"
            alt="No channels"
            className="w-40 h-40 mb-6 opacity-70"
          /> */}
          <h2 className="text-xl font-semibold text-white mb-2">
            Belum Join ke Channel
          </h2>
          <p className="text-gray-400 max-w-sm">
            Kamu belum tergabung di channel manapun. Coba join atau buat channel
            baru untuk mulai komunikasi dengan tim kamu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((channel) => (
            <div
              key={channel.id}
              className="bg-[#292b2f] p-6 rounded-xl shadow-md flex flex-col justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold mb-1">{channel.name}</h2>
                <p className="text-sm text-gray-400">
                  {channel.members ?? "?"} Members
                </p>
              </div>

              <div className="mt-4 flex justify-between gap-3">
                <button
                  disabled={joining}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  <FaSignInAlt />
                  Join
                </button>
                <button
                  onClick={() => handleLeave(channel.name)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Leave
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
