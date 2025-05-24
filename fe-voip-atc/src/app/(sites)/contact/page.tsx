"use client";

import { useEffect, useRef, useState } from "react";
import { IoCallSharp } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";
import TextField from "@/components/textfield";
import { useVoIP } from "@/context/voipContext";
import { Inviter, UserAgent } from "sip.js";
import ModalAdd, { FormData } from "@/components/modal-add";
import Button from "@/components/button";
import { useCall } from "@/context/callContext";
import { toast } from "react-toastify";
import Loading from "@/components/loading";

interface Contact {
  id: string;
  username: string;
  name?: string;
  sipId: string;
  isOnline?: boolean;
}

export default function ContactPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const contactsRef = useRef<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormData>({
    username: "",
    name: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [calling, setCalling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(
    null
  );

  const { userAgent } = useVoIP();
  const { startCall } = useCall();

  const fetchContacts = async (): Promise<Contact[]> => {
    try {
      const res = await fetch("/api/contacts");
      return await res.json();
    } catch (err) {
      console.error("Failed to fetch contacts", err);
      return [];
    }
  };

  const fetchPresence = async (targetContacts: Contact[]) => {
    if (!targetContacts.length) return;

    try {
      const sipIds = targetContacts.map((c) => c.sipId);
      const res = await fetch(
        `/api/presence?${sipIds.map((id) => `sipId=${id}`).join("&")}`
      );
      const statusData: { sipId: string; isOnline: boolean }[] =
        await res.json();

      const updated = targetContacts.map((contact) => {
        const status = statusData.find((s) => s.sipId === contact.sipId);
        return { ...contact, isOnline: status?.isOnline ?? false };
      });

      setContacts(updated);
      contactsRef.current = updated;
    } catch (err) {
      console.error("Failed to fetch presence", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const list = await fetchContacts();
      setContacts(list);
      contactsRef.current = list;
      await fetchPresence(list);
      setLoading(false);
    };

    init();

    const interval = setInterval(() => {
      fetchPresence(contactsRef.current);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleCall = async (sipId: string) => {
    if (!userAgent || !sipId) return;

    setCalling(true);
    try {
      const uri = UserAgent.makeURI(`sip:${sipId}@sip.pttalk.id`);
      if (!uri) throw new Error("Invalid SIP URI");

      const inviter = new Inviter(userAgent, uri);
      await inviter.invite();
      await startCall(inviter, sipId);
    } catch (err) {
      console.error("Call failed", err);
    } finally {
      setCalling(false);
    }
  };

  const handleDelete = async (contactId: string) => {
    setDeletingContactId(contactId);
    try {
      const res = await fetch(`/api/contacts?id=${contactId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const updated = contacts.filter((c) => c.id !== contactId);
        setContacts(updated);
        contactsRef.current = updated;
        toast.success("Kontak berhasil dihapus");
      } else {
        const data = await res.json();
        toast.error(data.message || "Gagal menghapus kontak");
      }
    } catch (error) {
      console.error("Failed to delete contact", error);
      toast.error("Terjadi kesalahan saat menghapus kontak");
    } finally {
      setDeletingContactId(null);
    }
  };

  const handleAddContact = async () => {
    if (!form.username?.trim()) {
      toast.warn("Username tidak boleh kosong");
      return;
    }

    setAdding(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await fetchContacts();
        setContacts(updated);
        contactsRef.current = updated;
        await fetchPresence(updated);
        setForm({ username: "", name: "" });
        setModalOpen(false);
        toast.success("Kontak berhasil ditambahkan");
      } else {
        const data = await res.json();
        toast.error(data.message || "Gagal menambahkan kontak");
      }
    } catch (error) {
      console.error("Failed to add contact", error);
      toast.error("Terjadi kesalahan saat menambahkan kontak");
    } finally {
      setAdding(false);
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {modalOpen && (
        <ModalAdd
          title="Add Contact"
          formData={form}
          setFormData={setForm}
          button1Text="Cancel"
          button2Text="Add"
          onButton1Click={() => setModalOpen(false)}
          onButton2Click={handleAddContact}
          showFields={{ username: true, name: true }}
          loading={adding}
        />
      )}

      <div className="space-y-6">
        <h1 className="text-2xl font-bold mb-4 pb-2 text-white border-b-2 border-white border-opacity-20">
          Contacts
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
            text="Add Contact"
            type="button"
            onClick={() => setModalOpen(true)}
            color="black"
            width={170}
          />
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-8">
            <Loading />
          </div>
        ) : filteredContacts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-12">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-[#292b2f] p-6 rounded-xl shadow-md flex flex-col justify-between"
              >
                <div className="flex justify-between">
                  <div>
                    <h1 className="text-lg font-semibold text-white">
                      {contact.name || "-"}
                    </h1>
                    <h2 className="text-base font-medium text-gray-200">
                      {contact.username}
                    </h2>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">
                      SIP ID: {contact.sipId}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          contact.isOnline ? "bg-green-400" : "bg-gray-500"
                        }`}
                      />
                      <p
                        className={`text-sm font-semibold ${
                          contact.isOnline ? "text-green-400" : "text-gray-400"
                        }`}
                      >
                        {contact.isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between gap-2">
                  <button
                    disabled={calling}
                    onClick={() => handleCall(contact.sipId)}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-md text-sm"
                  >
                    <IoCallSharp />
                    {calling ? "Calling..." : "Call"}
                  </button>

                  <button
                    disabled={deletingContactId === contact.id}
                    onClick={() => handleDelete(contact.id)}
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded-md text-sm"
                  >
                    <FaTrash />
                    {deletingContactId === contact.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No contacts found.
          </div>
        )}
      </div>
    </>
  );
}
