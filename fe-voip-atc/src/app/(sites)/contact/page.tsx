"use client";

import { useEffect, useState } from "react";
import { IoCallSharp } from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import TextField from "@/components/textfield";
import { useVoIP } from "@/context/voipContext";
import { Inviter, UserAgent } from "sip.js";
import ModalAdd from "@/components/modal-add";
import Button from "@/components/button";
import { useCall } from "@/context/callContext";

interface Contact {
  id: string;
  username: string;
  name?: string;
}

export default function ContactPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<{ username: string; name?: string }>({
    username: "",
    name: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const { userAgent } = useVoIP();
  const { startCall } = useCall();
  const [calling, setCalling] = useState(false);

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/contacts");
      const data = await res.json();
      setContacts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch contacts", err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleCall = async (username: string) => {
    console.log("🔍 userAgent", userAgent);
    console.log("🔍 calling", calling);

    if (!userAgent || calling) {
      console.warn("❌ Cannot proceed: userAgent null or already calling");
      return;
    }

    setCalling(true);
    try {
      const targetURI = `sip:${username}@sip.pttalk.id`;
      console.log("📞 Calling", targetURI);

      const inviter = new Inviter(userAgent, UserAgent.makeURI(targetURI)!);
      startCall(username);
      await inviter.invite();
    } catch (err) {
      console.error("Call failed", err);
    } finally {
      setCalling(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/contacts?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleAddContact = async () => {
    if (!form.username.trim()) return;
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        fetchContacts();
        setForm({ username: "", name: "" });
        setModalOpen(false);
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (error) {
      console.error("Failed to add contact", error);
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {modalOpen && (
        <ModalAdd
          title="Add New Contact"
          formData={form}
          setFormData={setForm}
          button1Text="Cancel"
          button2Text="Add"
          onButton1Click={() => setModalOpen(false)}
          onButton2Click={handleAddContact}
        />
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-white">Contacts</h1>
        </div>

        <div className="flex flex-row justify-between">
          <div className="w-full sm:w-80">
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
            text="Add Contact"
            type="button"
            onClick={() => setModalOpen(true)}
            color="black"
            width={120}
          />
        </div>

        <div className="overflow-hidden rounded-xl shadow-sm">
          <table className="min-w-full">
            <tbody>
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="border-b border-gray-600">
                  <td className="px-6 py-4 text-lg font-medium text-white">
                    {contact.username}
                  </td>
                  <td className="px-6 py-4 text-lg text-center text-white">
                    {contact.name || "-"}
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <button
                      onClick={() => {
                        console.log(
                          "☎️ Call button clicked for",
                          contact.username
                        );
                        handleCall(contact.username);
                      }}
                      className="p-2 rounded-full bg-white text-gray-600"
                    >
                      <IoCallSharp size={18} />
                    </button>

                    <button className="p-2 rounded-full bg-white text-gray-600">
                      <MdEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="p-2 rounded-full bg-white text-gray-600"
                    >
                      <FaTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredContacts.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-gray-500">
                    No contacts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
