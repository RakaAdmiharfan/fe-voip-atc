import { FormEventHandler, MouseEventHandler } from "react";

export default function Button({
  text,
  type,
  onClick,
  onSubmit,
  color = "primary",
  icon,
  disable = false,
  width,
  isLoading = false,
}: {
  text: string;
  type: "button" | "submit" | "reset" | undefined;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  onSubmit?: FormEventHandler<HTMLButtonElement> | undefined;
  color?: "primary" | "red" | "neutral" | "secondary" | "tersier" | "black";
  icon?: React.ReactNode;
  disable?: boolean;
  width?: number;
  isLoading?: boolean;
}) {
  const inputWidth = width ? width : "100%";
  return (
    <button
      style={{ width: inputWidth }}
      disabled={disable}
      type={type}
      onClick={onClick}
      onSubmit={onSubmit}
      className={`${width == 350 ? "p-4" : "p-[10px]"} rounded-[8px] mt-2 ${
        disable
          ? "bg-[#D1D1D6]"
          : color == "primary"
          ? "bg-orange-400"
          : color == "red"
          ? "bg-error-600"
          : color == "secondary"
          ? "bg-light-900"
          : color == "tersier"
          ? "bg-navy-900"
          : color == "black"
          ? "bg-[#202225]"
          : "bg-white border-[1px] border-[#D5D7DA] hover:bg-gray-300"
      }`}
    >
      {isLoading ? (
        <div
          className={`${
            color == "primary" ? "text-white" : "text-black"
          } flex justify-center items-center`}
        >
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
              stroke="white"
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
        <div
          className={`${
            color == "neutral" ? "text-[#414651]" : "text-white"
          }  flex items-center justify-center gap-2 font-semibold text-[12px] md:text-[14px]`}
        >
          {text == "Next" ? "" : icon}
          {text}
          {text == "Next" ? icon : ""}
        </div>
      )}
    </button>
  );
}
