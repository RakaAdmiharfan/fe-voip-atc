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
      const targetURI = `sip:${channelNumber}@sip.pttalk.id`;
      console.log("📞 Joining Channel:", targetURI);
      const inviter = new Inviter(userAgent, UserAgent.makeURI(targetURI)!);
      startCall(channelNumber, true);
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

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Channels</h1>

      {/* Search & Add */}
      <div className="flex flex-col md:flex-row md:justify-between items-center mb-6 gap-4">
        <TextField
          name="search"
          type="search"
          placeholder="Search channel..."
          label=""
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          text="Tambah Channel"
          width={170}
          color="black"
          type={undefined}
        />
      </div>

      {/* Channel List */}
      <div className="bg-[#2f3136] rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#292b2f] text-left text-gray-400 uppercase text-sm">
            <tr>
              <th className="p-4">Channel</th>
              <th className="p-4">Members</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {channels
              .filter((channel) =>
                channel.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((channel) => (
                <tr
                  key={channel.id}
                  className="border-t border-[#40444b] hover:bg-[#393c42] transition"
                >
                  <td className="p-4 font-medium">{channel.name}</td>
                  <td className="p-4">{channel.members} Members</td>
                  <td className="p-4 flex justify-center gap-3">
                    <button
                      disabled={joining}
                      onClick={() => handleJoinChannel(channel.number)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md flex items-center gap-2 text-sm"
                    >
                      <FaSignInAlt />
                      Join
                    </button>
                    <button
                      onClick={() => handleDelete(channel.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
