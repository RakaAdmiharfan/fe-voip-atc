"use client";

import React, { useState } from "react";
import TextField from "./textfield";

export interface FormData {
  username?: string;
  name?: string;
  type?: string;
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
    dropdown?: boolean;
    channelType?: boolean;
  };
  dropdownOptions?: string[];
}

export default function ModalAdd({
  title,
  formData,
  setFormData,
  button1Text,
  button2Text,
  onButton1Click,
  onButton2Click,
  showFields = { username: true, name: true },
  dropdownOptions = [],
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
          {/* Username field */}
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

          {/* Name field */}
          {showFields.name && !showFields.dropdown && (
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

          {/* Dropdown instead of name */}
          {showFields.dropdown && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Channel Name
              </label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-500"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              >
                <option value="" disabled>
                  -- Select a Channel --
                </option>
                {dropdownOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Channel Type Dropdown */}
          {showFields.channelType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Channel Type
              </label>
              <select
                className="w-full border text-gray-500 border-gray-300 rounded px-3 py-2"
                value={formData.type || "public"}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value }))
                }
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
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
