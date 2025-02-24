"use client";
import { useState, useCallback } from "react";
import VoIPComponent from "@/context/voip-component";
import Button from "@/components/button";
import TextField from "@/components/textfield";
import ModalApprove from "@/components/modal-approval";
import { MdEdit } from "react-icons/md";
import { IoCallSharp } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";
import { UserAgent, Inviter, URI, SessionState } from "sip.js";
import ModalAdd from "@/components/modal-add";
import { useCall } from "@/context/callContext";

export default function ContactPage() {
  const [contacts, setContacts] = useState([
    { contact_id: 101, username: "webrtc_user", name: "John Doe" },
    { contact_id: 102, username: "janedoe", name: "Jane Doe" },
    { contact_id: 103, username: "alexsmith", name: "Alex Smith" },
  ]);

  const [callState, setCallState] = useState("");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [sipUserAgent, setSipUserAgent] = useState<UserAgent | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "manager",
    status: "",
    email: "",
  });

  const { startCall, addParticipant } = useCall();

  const handleCall = useCallback(
    async (username: string) => {
      if (!sipUserAgent) {
        alert("SIP not connected!");
        return;
      }

      try {
        const targetURI = UserAgent.makeURI(`sip:${username}@108.136.168.80`);
        if (!targetURI) throw new Error("Invalid target URI");

        const inviter = new Inviter(sipUserAgent, targetURI);
        await inviter.invite();

        startCall(username, "test.com");

        inviter.stateChange.addListener((state) => {
          console.log(`Call state changed: ${state}`);

          if (state === SessionState.Established) {
            setCallState("connected");
            addParticipant(username);
            console.log("Call established.");
          } else if (state === SessionState.Terminated) {
            setCallState("idle");
            console.log("Call ended.");
          }
        });

        console.log(`Calling ${username}...`);
      } catch (error) {
        console.error("Error making call:", error);
        alert("Call failed!");
      }
    },
    [sipUserAgent, startCall, addParticipant]
  );

  return (
    <div>
      {/* SIP Initialization */}
      <VoIPComponent onAgentReady={setSipUserAgent} />
      {showAddModal && (
        <ModalAdd
          title="Tambah Akun"
          formData={formData}
          setFormData={setFormData}
          button1Text="Batalkan"
          button2Text="Tambah"
          onButton1Click={() => setShowAddModal(false)}
          onButton2Click={() => setShowAddModal(false)}
          isEdit={true}
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
