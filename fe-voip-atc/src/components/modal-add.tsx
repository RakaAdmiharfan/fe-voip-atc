"use client";
import React, { useState } from "react";
import TextField from "./textfield";
import Image from "next/image";

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
  isEdit = false,
}: {
  title: string;
  formData: {
    username: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      username: string;
    }>
  >;
  button1Text: string;
  button2Text: string;
  onButton1Click: React.MouseEventHandler<HTMLButtonElement> | undefined;
  onButton2Click: React.MouseEventHandler<HTMLButtonElement> | undefined;
  button1Color?: string;
  button2Color?: string;
  button1TextColor?: string;
  button2TextColor?: string;
  isEdit?: boolean;
}) {
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const validateUsername = async (username: string) => {
    // Check if the input field is empty or contains only spaces
    if (username.length == 0) {
      setUsernameError("You must fill this field.");
      return;
    } else {
      setUsernameError(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-72 md:w-96 p-6 text-center">
        <Image
          src={"/modal/add-icon.svg"}
          alt="Modal Icon"
          className="w-12 h-12 mx-auto mb-4"
          width={12}
          height={12}
        />
        <h2 className="text-base md:text-lg font-semibold text-[#181D27] mb-5">
          {title}
        </h2>

        {/* Form Fields */}
        <div className="flex flex-col justify-start items-start text-left mb-8">
          {/* Field yang muncul hanya saat menambahkan */}
          {!isEdit && (
            <TextField
              name={"Username"}
              placeholder={"Enter username"}
              label={"Username"}
              type="field"
              value={formData.username || ""}
              onChange={async (e) => {
                const username = e.target.value;
                setFormData((prev) => ({ ...prev, username }));
                await validateUsername(username);
              }}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            className={`flex-1 ${button1Color ?? "bg-[#FFFFFF]"} ${
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
