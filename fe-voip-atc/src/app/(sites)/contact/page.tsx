"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import VoIPComponent from "@/context/voipComponent";
import Button from "@/components/button";
import TextField from "@/components/textfield";
import { MdEdit } from "react-icons/md";
import { IoCallSharp } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";
import { UserAgent, Inviter, URI, SessionState } from "sip.js";
import ModalAdd from "@/components/modal-add";
import CallUI from "@/components/callUI";
import { useCall } from "@/context/callContext";

export default function ContactPage() {
  const [contacts, setContacts] = useState([
    { contact_id: 101, username: "user7@gmail.com", name: "John Doe" },
    { contact_id: 102, username: "janedoe", name: "Jane Doe" },
    { contact_id: 103, username: "alexsmith", name: "Alex Smith" },
  ]);
  const [sipUserAgent, setSipUserAgent] = useState<UserAgent | null>(null);
  const [callState, setCallState] = useState("");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
  });

  const ws = useRef<WebSocket | null>(null);

  // Inisialisasi WebSocket saat halaman dimuat
  useEffect(() => {
    ws.current = new WebSocket("wss://localhost:3000/api/websocket");

    ws.current.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received WebSocket message:", data);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  // Fungsi untuk melakukan panggilan
  const handleCall = async (username: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ action: "call", username }));
    } else {
      console.error("WebSocket is not connected");
    }
  };

  return (
    <div>
      {/* SIP Initialization */}
      {showAddModal && (
        <ModalAdd
          title="Tambah Akun"
          formData={formData}
          setFormData={setFormData}
          button1Text="Batalkan"
          button2Text="Tambah"
          onButton1Click={() => setShowAddModal(false)}
          onButton2Click={() => setShowAddModal(false)}
          isEdit={false}
        />
      )}

      <h1 className="text-2xl font-bold mb-4">Contact List</h1>

      {/* Search & Add Contact */}
      <div className="flex flex-col md:flex-row items-center md:justify-between mb-6 gap-4">
        <div className="w-52 md:w-80">
          <TextField
            name="Search"
            type="search"
            placeholder="Search"
            onChange={(e) => setSearch(e.target.value)}
            label={""}
          />
        </div>
        <Button
          text="Tambah Akun"
          width={170}
          onClick={() => setShowAddModal(true)}
          color="primary"
          type={undefined}
        />
      </div>

      {/* Contact Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-b border-gray-200 rounded-lg">
          <tbody>
            {contacts
              .filter(
                (contact) =>
                  contact.name.toLowerCase().includes(search.toLowerCase()) ||
                  contact.username.toLowerCase().includes(search.toLowerCase())
              )
              .map((contact) => (
                <tr key={contact.contact_id} className="text-center border-b">
                  <td className="p-8 border-b">{contact.contact_id}</td>
                  <td className="p-8 border-b">{contact.username}</td>
                  <td className="p-8 border-b">{contact.name}</td>
                  <td className="p-8 border-b gap-6 flex justify-center">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="p-2 bg-orange-400 rounded-full hover:bg-gray-300 transition"
                    >
                      <MdEdit size={20} className="text-white" />
                    </button>
                    <button
                      onClick={() =>
                        setContacts(
                          contacts.filter(
                            (c) => c.contact_id !== contact.contact_id
                          )
                        )
                      }
                      className="p-2 bg-orange-400 rounded-full hover:bg-gray-300 transition"
                    >
                      <FaTrash size={20} className="text-white" />
                    </button>
                    <button
                      onClick={() => handleCall(contact.username)}
                      className="p-2 bg-orange-400 rounded-full hover:bg-gray-300 transition"
                    >
                      <IoCallSharp size={20} className="text-white" />
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
