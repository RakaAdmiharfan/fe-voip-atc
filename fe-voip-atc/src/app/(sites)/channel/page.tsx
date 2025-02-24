"use client";
import { useState } from "react";
import Button from "@/components/button";
import TextField from "@/components/textfield";
import ModalAdd from "@/components/modal-add";
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { IoLogIn } from "react-icons/io5";

export default function ChannelPage() {
  const [channels, setChannels] = useState([
    { id: 1, name: "General", members: 10 },
    { id: 2, name: "Tech Talk", members: 25 },
    { id: 3, name: "Gaming", members: 15 },
    { id: 4, name: "Music Lovers", members: 30 },
    { id: 5, name: "Random Chat", members: 5 },
  ]);

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    members: 0,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Daftar Channel</h1>

      {/* Search & Add Channel */}
      <div className="flex flex-col md:flex-row items-center md:justify-between mb-6 gap-4">
        <div className="w-52 md:w-80">
          <TextField
            name="Search"
            type="search"
            placeholder="Search Channel"
            onChange={(e) => setSearch(e.target.value)}
            label={""}
          />
        </div>
        <Button
          text="Tambah Channel"
          width={170}
          onClick={() => setShowAddModal(true)}
          color="primary"
          type={undefined}
        />
      </div>

      {/* Channel Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-b border-gray-200 rounded-lg">
          <tbody>
            {channels
              .filter((channel) =>
                channel.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((channel) => (
                <tr key={channel.id} className="text-center border-b">
                  <td className="p-8 border-b">{channel.id}</td>
                  <td className="p-8 border-b">{channel.name}</td>
                  <td className="p-8 border-b">{channel.members} Members</td>
                  <td className="p-8 border-b gap-6 flex justify-center">
                    <button
                      onClick={() =>
                        setChannels(channels.filter((c) => c.id !== channel.id))
                      }
                      className="p-2 bg-orange-400 rounded-full hover:bg-gray-300 transition"
                    >
                      <FaTrash size={20} className="text-white" />
                    </button>
                    <button
                      onClick={() => alert(`Joining ${channel.name}...`)}
                      className="p-2 bg-orange-400 rounded-full hover:bg-gray-300 transition text-white px-4 font-semibold"
                    >
                      Join
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
