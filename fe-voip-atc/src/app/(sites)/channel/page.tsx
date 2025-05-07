"use client";

import { useState } from "react";
import Button from "@/components/button";
import TextField from "@/components/textfield";
import { FaTrash, FaSignInAlt } from "react-icons/fa";
import { useCall } from "@/context/callContext";
import { Inviter, UserAgent } from "sip.js";
import { useVoIP } from "@/context/voipContext";

export default function ChannelPage() {
  const [search, setSearch] = useState("");
  const { startCall } = useCall();
  const { userAgent } = useVoIP();
  const [joining, setJoining] = useState(false);

  const [channels, setChannels] = useState([
    { id: 1, name: "General", members: 10, number: "6000" },
    { id: 2, name: "Tech Talk", members: 25, number: "6001" },
    { id: 3, name: "Gaming", members: 15, number: "6002" },
    { id: 4, name: "Music Lovers", members: 30, number: "6003" },
    { id: 5, name: "Random Chat", members: 5, number: "6004" },
  ]);

  const handleJoinChannel = async (channelNumber: string) => {
    if (!userAgent || !channelNumber || joining) return;

    setJoining(true);
    try {
      const uri = UserAgent.makeURI(`sip:${channelNumber}@sip.pttalk.id`);
      if (!uri) return;
      const inviter = new Inviter(userAgent, uri);
      startCall(channelNumber, true, inviter);
      await inviter.invite();
    } catch (err) {
      console.error("Failed to join channel", err);
    } finally {
      setJoining(false);
    }
  };

  const handleDelete = (id: number) => {
    setChannels(channels.filter((c) => c.id !== id));
  };

  const filtered = channels.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="flex flex-col gap-6 text-white">
      <h1 className="text-2xl font-bold mb-4 pb-2 text-white border-b-2 border-white border-opacity-20">
        Channel
      </h1>

      <div className="flex flex-col md:flex-row items-center md:justify-between mb-6 gap-4">
        <div className="w-52 md:w-80">
          <TextField
            name="search"
            type="search"
            placeholder="Search by username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            label=""
          />
        </div>

        <Button
          text="Add Channel"
          type="button"
          // onClick={() => setModalOpen(true)}
          color="black"
          width={170}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((channel) => (
          <div
            key={channel.id}
            className="bg-[#292b2f] p-6 rounded-xl shadow-md flex flex-col justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold mb-1">{channel.name}</h2>
              <p className="text-sm text-gray-400">{channel.members} Members</p>
            </div>

            <div className="mt-4 flex justify-between gap-3">
              <button
                onClick={() => handleJoinChannel(channel.number)}
                disabled={joining}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
              >
                <FaSignInAlt />
                Join
              </button>
              <button
                onClick={() => handleDelete(channel.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
