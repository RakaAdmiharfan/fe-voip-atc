"use client";
import React from "react";

export default function ModalApprove({
  title,
  subtitle,
  button1Text,
  button2Text,
  onButton1Click,
  onButton2Click,
  loading = false,
}: {
  title: string;
  subtitle: string;
  button1Text: string;
  button2Text: string;
  onButton1Click: React.MouseEventHandler<HTMLButtonElement> | undefined;
  onButton2Click: React.MouseEventHandler<HTMLButtonElement> | undefined;
  loading?: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-80 md:w-96 p-6 text-center">
        <h2 className="text-lg font-semibold text-[#181D27] mb-2">{title}</h2>
        <p className="text-sm font-normal text-[#535862] mb-6">{subtitle}</p>
        <div className="flex justify-between">
          <button
            className={`flex-1 bg-[#FFFFFF] hover:bg-gray-200 text-[#414651] py-2 px-4 rounded-lg mr-2 border-2 border-[#D5D7DA]`}
            onClick={onButton1Click}
          >
            {button1Text}
          </button>
          <button
            className={`flex-1 bg-[#D92D20] hover:bg-red-400 text-white py-2 px-4 rounded-lg ml-2`}
            onClick={onButton2Click}
          >
            {loading ? (
              <div className="text-white flex justify-center items-center">
                <svg
                  className="mr-3 h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            ) : (
              button2Text
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
