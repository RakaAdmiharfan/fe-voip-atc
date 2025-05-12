"use client";

import React, { useState } from "react";
import TextField from "./textfield";
import Image from "next/image";

export interface FormData {
  username?: string;
  name?: string;
}

interface ModalAddProps {
  title: string;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onButton1Click?: React.MouseEventHandler<HTMLButtonElement>;
  onButton2Click?: React.MouseEventHandler<HTMLButtonElement>;
  button1Text: string;
  button2Text: string;
  showFields?: {
    username?: boolean;
    name?: boolean;
  };
}

export default function ModalAdd({
  title,
  formData,
  setFormData,
  button1Text,
  button2Text,
  onButton1Click,
  onButton2Click,
  showFields = { username: true, name: true }, // default: tampilkan semua
}: ModalAddProps) {
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const validateUsername = async (username: string) => {
    if (!username.trim()) {
      setUsernameError("Username is required.");
    } else {
      setUsernameError(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-72 md:w-96 p-6 text-center">
        <h2 className="text-lg font-semibold text-[#181D27] mb-5">{title}</h2>

        <div className="flex flex-col gap-4 text-left mb-8">
          {showFields.username && (
            <>
              <TextField
                name="username"
                placeholder="Enter username"
                label="Username"
                type="field"
                value={formData.username || ""}
                onChange={async (e) => {
                  const username = e.target.value;
                  setFormData((prev) => ({ ...prev, username }));
                  await validateUsername(username);
                }}
              />
              {usernameError && (
                <p className="text-sm text-red-500 -mt-2">{usernameError}</p>
              )}
            </>
          )}

          {showFields.name && (
            <TextField
              name="name"
              placeholder="Enter name"
              label="Name"
              type="field"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          )}
        </div>

        <div className="flex justify-between">
          <button
            className="flex-1 bg-[#202225] hover:bg-gray-600 text-white py-2 px-4 rounded-lg ml-2"
            onClick={onButton1Click}
          >
            {button1Text}
          </button>
          <button
            className="flex-1 bg-[#202225] hover:bg-gray-600 text-white py-2 px-4 rounded-lg ml-2"
            onClick={onButton2Click}
          >
            {button2Text}
          </button>
        </div>
      </div>
    </div>
  );
}
