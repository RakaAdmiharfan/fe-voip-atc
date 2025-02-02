import { MouseEventHandler } from "react";
import { IoIosWarning, IoMdCheckmark } from "react-icons/io";
import { PiWarningCircleFill } from "react-icons/pi";
import { RxCross2 } from "react-icons/rx";

export default function Toast({
  type,
  title,
  description,
  onClick,
}: {
  type: "error" | "warn" | "success";
  title: string;
  description: string;
  onClick?: MouseEventHandler<SVGElement> | undefined
}) {
  return (
    <div
      className={`w-[350px] pt-[10px] pb-4 flex flex-col items-start rounded-lg shadow-sm ${
        type == "error"
          ? "bg-[#F9E1E5]"
          : type == "warn"
          ? "bg-[#FBF0DA]"
          : "bg-[#D6F0E0]"
      }`}
    >
      <div className="w-full px-4 flex justify-between items-center mb-[10px]">
        <div className="flex gap-2 items-center justify-start">
          {type == "error" ? (
            <PiWarningCircleFill size={20} className="text-[#DC4C64]" />
          ) : type == "warn" ? (
            <IoIosWarning size={20} className="text-[#E4A11B]" />
          ) : (
            <IoMdCheckmark size={20} className="text-[#14A44D]" />
          )}
          <p
            className={`text-[14px] font-bold ${
              type == "error"
                ? "text-[#AF233A]"
                : type == "warn"
                ? "text-[#73510D]"
                : "text-[#0D6832]"
            }`}
          >
            {title}
          </p>
        </div>
        <RxCross2 size={20}
        onClick={onClick}
          className={`cursor-pointer ${
            type == "error"
              ? "text-[#DC4C64]"
              : type == "warn"
              ? "text-[#E4A11B]"
              : "text-[#14A44D]"
          }`}
        />
      </div>
      <div
        className={`w-full mb-4 h-[2px] ${
          type == "error"
            ? "bg-[#F4C8CF]"
            : type == "warn"
            ? "bg-[#F9E4BE]"
            : "bg-[#C0E7D0]"
        }`}
      ></div>
      <p
        className={`px-4 text-[14px] font-normal ${
          type == "error"
            ? "text-[#DC4C64]"
            : type == "warn"
            ? "text-[#E4A11B]"
            : "text-[#14A44D]"
        }`}
      >
        {description}
      </p>
    </div>
  );
}
