"use client";

import { useState } from "react";

export default function ContactPage() {
  const [contacts, setContacts] = useState<{ name: string; phone: string }[]>(
    []
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleAddContact = () => {
    if (!name || !phone) return alert("Name and phone number are required!");
    setContacts([...contacts, { name, phone }]);
    setName("");
    setPhone("");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Contact List</h1>

      {/* Contact Form */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <button
          onClick={handleAddContact}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Add Contact
        </button>
      </div>

      {/* Contact List */}
      <ul className="border-t pt-4">
        {contacts.length === 0 ? (
          <p className="text-gray-500">No contacts added yet.</p>
        ) : (
          contacts.map((contact, index) => (
            <li key={index} className="flex justify-between p-2 border-b">
              <span>{contact.name}</span>
              <span>{contact.phone}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
