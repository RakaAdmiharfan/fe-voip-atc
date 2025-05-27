"use client";

import { useEffect, useState } from "react";
import Button from "@/components/button";
import TextField from "@/components/textfield";
import { FaSignInAlt } from "react-icons/fa";
import { useCall } from "@/context/callContext";
import { useVoIP } from "@/context/voipContext";
import { toast } from "react-toastify";
import ModalAdd, { FormData } from "@/components/modal-add";
import Loading from "@/components/loading";
import { Inviter, UserAgent } from "sip.js";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import ModalApprove from "@/components/modal-approval";

interface Channel {
  id: number;
  name: string;
  number: string;
  created_at: string;
  members?: number;
  is_private?: number;
  creator_id: number;
  creator_name?: string;
}

export default function ChannelPage() {
  const [search, setSearch] = useState("");
  const { joinChannelCall } = useCall();
  const { userAgent } = useVoIP();
  const [joiningChannelNumber, setJoiningChannelNumber] = useState<
    string | null
  >(null);
  const [joining, setJoining] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalJoinOpen, setModalJoinOpen] = useState(false);
  const [modalCreateOpen, setModalCreateOpen] = useState(false);
  const [joinForm, setJoinForm] = useState<FormData>({
    name: "",
  });
  const [createForm, setCreateForm] = useState<FormData>({
    name: "",
    type: "public",
  });
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<FormData>({
    name: "",
    type: "public",
  });
  const [editChannelId, setEditChannelId] = useState<number | null>(null);
  const [availableChannels, setAvailableChannels] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [deleteChannelId, setDeleteChannelId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/me");
      if (!res.ok) throw new Error("Failed to fetch user");

      const data = await res.json();
      setCurrentUserId(data.id); // sesuaikan dengan struktur responsmu
    } catch (err) {
      console.error("Failed to fetch current user:", err);
    }
  };

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

  const fetchAvailableChannels = async () => {
    try {
      const res = await fetch("/api/channel/available");
      if (!res.ok) throw new Error("Failed to fetch");

      const data: Channel[] = await res.json();
      const names = data.map((c) => c.name);
      setAvailableChannels(names);
      setModalJoinOpen(true);
    } catch (err) {
      toast.error("Failed to load joinable channels");
      console.error("Fetch available channels error:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchCurrentUser();
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

    setCreating(true);
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
        const data = await res.json();
        toast.error(data.error || "Failed to create channel");
      }
    } catch (err) {
      console.error("Failed to create channel", err);
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
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

  const handleChannelCall = async (channelNumber: string) => {
    if (!userAgent || !channelNumber || joiningChannelNumber) return;

    setJoiningChannelNumber(channelNumber);
    try {
      const uri = UserAgent.makeURI(`sip:${channelNumber}@sip.pttalk.id`);
      if (!uri) throw new Error("Invalid SIP URI");

      const inviter = new Inviter(userAgent, uri);
      await inviter.invite();
      joinChannelCall(channelNumber, inviter);
    } catch (err) {
      console.error("Join channel failed", err);
      toast.error("Failed to join channel");
    } finally {
      setJoiningChannelNumber(null);
    }
  };

  const handleEditChannel = async () => {
    if (!editChannelId || !editForm.name?.trim()) {
      toast.warn("Name is required");
      return;
    }

    setEditing(true);
    try {
      const res = await fetch(`/api/channel/${editChannelId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editForm.name, type: editForm.type }),
      });

      if (res.ok) {
        await fetchChannels();
        toast.success("Channel updated");
        setModalEditOpen(false);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update channel");
      }
    } catch (err) {
      console.error("Edit channel error", err);
      toast.error("Something went wrong");
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteChannel = async () => {
    if (!deleteChannelId) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/channel/${deleteChannelId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Channel deleted");
        await fetchChannels(); // refresh list
        setModalDeleteOpen(false);
        setDeleteChannelId(null);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete channel");
      }
    } catch (err) {
      console.error("Delete channel error:", err);
      toast.error("Something went wrong");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = channels.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {modalJoinOpen && (
        <ModalAdd
          title="Join Channel"
          formData={joinForm}
          setFormData={setJoinForm}
          button1Text="Cancel"
          button2Text="Join"
          onButton1Click={() => setModalJoinOpen(false)}
          onButton2Click={handleJoinChannel}
          showFields={{ dropdown: true }}
          dropdownOptions={availableChannels}
          loading={joining}
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
          showFields={{ name: true, channelType: true }}
          loading={creating}
        />
      )}

      {modalEditOpen && (
        <ModalAdd
          title="Edit Channel"
          formData={editForm}
          setFormData={setEditForm}
          button1Text="Cancel"
          button2Text="Save"
          onButton1Click={() => setModalEditOpen(false)}
          onButton2Click={handleEditChannel}
          showFields={{ name: true, channelType: true }}
          loading={editing}
        />
      )}

      {modalDeleteOpen && (
        <ModalApprove
          title="Hapus Channel?"
          subtitle="Channel ini akan dihapus secara permanen."
          button1Text="Batal"
          button2Text="Hapus"
          onButton1Click={() => setModalDeleteOpen(false)}
          onButton2Click={handleDeleteChannel}
          loading={deleteLoading}
        />
      )}

      <div className="space-y-6">
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
              onClick={fetchAvailableChannels}
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
            <h2 className="text-xl font-semibold text-white mb-2">
              Belum Join ke Channel
            </h2>
            <p className="text-gray-400 max-w-sm">
              Kamu belum tergabung di channel manapun. Coba join atau buat
              channel baru untuk mulai komunikasi dengan tim kamu.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((channel) => (
              <div
                key={channel.id}
                className="relative bg-[#292b2f] p-6 rounded-xl shadow-md flex flex-col justify-between"
              >
                <div className="flex flex-row justify-between">
                  <div>
                    <h2 className="text-white text-lg font-semibold mb-1">
                      {channel.name}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {channel.members ?? "?"} Members ·{" "}
                      {channel.is_private ? "Private" : "Public"}
                    </p>
                  </div>
                  <div>
                    {channel.creator_id === currentUserId && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditForm({
                              name: channel.name,
                              type: channel.is_private ? "private" : "public",
                            });
                            setEditChannelId(channel.id);
                            setModalEditOpen(true);
                          }}
                          className=" p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white shadow-md"
                          title="Edit Channel"
                        >
                          <FaEdit size={16} />
                        </button>

                        <button
                          onClick={() => {
                            setDeleteChannelId(channel.id);
                            setModalDeleteOpen(true);
                          }}
                          className="p-2 bg-red-600 hover:bg-red-700 rounded-full text-white shadow-md"
                          title="Delete Channel"
                        >
                          <MdDelete size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-10 flex flex-wrap justify-between gap-2">
                  <button
                    disabled={joiningChannelNumber !== null}
                    onClick={() => handleChannelCall(channel.number)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm ${
                      joiningChannelNumber === channel.number
                        ? "bg-gray-500 text-white cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    <FaSignInAlt />
                    {joiningChannelNumber === channel.number
                      ? "Joining..."
                      : "Join"}
                  </button>

                  {channel.creator_id !== currentUserId && (
                    <button
                      onClick={() => handleLeave(channel.name)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Leave
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
