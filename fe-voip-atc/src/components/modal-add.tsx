"use client";
import React, { useState } from "react";
import TextField from "./textfield";
import Image from "next/image";

interface FormData {
  username: string;
  name?: string;
}

interface ModalAddProps {
  title: string;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  button1Text: string;
  button2Text: string;
  onButton1Click: React.MouseEventHandler<HTMLButtonElement> | undefined;
  onButton2Click: React.MouseEventHandler<HTMLButtonElement> | undefined;
  button1Color?: string;
  button2Color?: string;
  button1TextColor?: string;
  button2TextColor?: string;
}

export default function ModalAdd({
  title,
  formData,
  setFormData,
  button1Text,
  button2Text,
  onButton1Click,
  onButton2Click,
  button1Color,
  button2Color,
  button1TextColor,
  button2TextColor,
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
        <Image
          src="/modal/add-icon.svg"
          alt="Modal Icon"
          className="w-12 h-12 mx-auto mb-4"
          width={48}
          height={48}
        />
        <h2 className="text-lg font-semibold text-[#181D27] mb-5">{title}</h2>

        <div className="flex flex-col gap-4 text-left mb-8">
          {/* Username Field */}
          <TextField
            name="username"
            placeholder="Enter username"
            label="Username"
            type="field"
            value={formData.username}
            onChange={async (e) => {
              const username = e.target.value;
              setFormData((prev) => ({ ...prev, username }));
              await validateUsername(username);
            }}
          />
          {usernameError && (
            <p className="text-sm text-red-500 -mt-2">{usernameError}</p>
          )}

          {/* Optional Name Field */}
          <TextField
            name="name"
            placeholder="Enter name"
            label="Name (optional)"
            type="field"
            value={formData.name || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            className={`flex-1 ${button1Color ?? "bg-white"} ${
              button1TextColor ?? "text-[#414651]"
            } py-2 px-4 rounded-lg mr-2 border-2 border-[#D5D7DA]`}
            onClick={onButton1Click}
          >
            {button1Text}
          </button>
          <button
            className={`flex-1 ${button2Color ?? "bg-orange-400"} ${
              button2TextColor ?? "text-white"
            } py-2 px-4 rounded-lg ml-2`}
            onClick={onButton2Click}
          >
            {button2Text}
          </button>
        </div>
      </div>
    </div>
  );
}
