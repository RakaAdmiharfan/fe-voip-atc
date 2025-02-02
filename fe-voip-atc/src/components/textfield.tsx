"use client";
import { useRef, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { FaCalendarAlt, FaChevronDown } from "react-icons/fa";
import { LuEye, LuEyeOff } from "react-icons/lu";

export default function TextField({
  name,
  type = "field",
  placeholder,
  value,
  label,
  icon,
  width,
  options,
  defaultValue,
  onChange,
  onChangeDropdown,
  onChangeArea,
}: {
  name: string;
  type?: "field" | "password" | "search" | "area" | "dropdown" | "date";
  value?: string | number | readonly string[] | undefined;
  placeholder: string;
  label: string;
  icon?: React.ReactNode;
  width?: number;
  options?: { label: string; value: string }[];
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement> | undefined;
  onChangeDropdown?: React.ChangeEventHandler<HTMLSelectElement> | undefined;
  onChangeArea?: React.ChangeEventHandler<HTMLTextAreaElement> | undefined;
}) {
  const useLabel = type != "search" || label == "";
  const [showPassword, setShowPassword] = useState("password");
  const [eyeIcon, setEyeIcon] = useState(<LuEyeOff></LuEyeOff>);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const handleToggle = () => {
    if (showPassword === "password") {
      setEyeIcon(<LuEye></LuEye>);
      setShowPassword("text");
    } else {
      setEyeIcon(<LuEyeOff></LuEyeOff>);
      setShowPassword("password");
    }
  };

  const handleDateIconClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  const inputWidth = width ? width : "100%";
  return (
    <div style={{ width: inputWidth }}>
      {useLabel && (
        <label
          htmlFor={name}
          className="text-[#414651] font-medium text-[14px]"
        >
          {label}
        </label>
      )}
      {type == "field" && (
        <div className="mt-2 mb-2 gap-[8px] w-full flex items-center px-[14px] py-[10px] text-[14px] text-[#1A0048] bg-white border-[1px] border-[#D5D7DA] focus-within:border-primary-900 rounded-[8px] group">
          {icon && (
            <div className="text-[16px] w-fit text-[#717680] group-focus-within:text-primary-900">
              {icon}
            </div>
          )}
          <input
            id={name}
            type="text"
            // required={required}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="grow focus:outline-none w-full"
          />
        </div>
      )}
      {type == "password" && (
        <div className="mt-2 mb-4 w-full flex items-center px-[14px] py-[10px] text-[14px] text-[#1A0048] bg-white border-[1px] border-[#D5D7DA] focus-within:border-primary-900 rounded-[8px] group">
          <input
            id="password"
            type={showPassword}
            //   required={required}
            placeholder={placeholder}
            onChange={onChange}
            value={value}
            className="grow focus:outline-none w-full"
          />
          <div
            className="text-[16px] w-fit group-focus-within:text-primary-900 text-[#1E1E1E]"
            onClick={handleToggle}
          >
            {eyeIcon}
          </div>
        </div>
      )}
      {type == "search" && (
        <div className="mt-2 mb-4 gap-[8px] w-full flex items-center px-[14px] py-[10px] text-[14px] text-[#1A0048] bg-white border-[1px] border-[#D5D7DA] focus-within:border-primary-900 rounded-[8px] group">
          <div className="text-[16px] w-fit text-[#717680] group-focus-within:text-primary-900">
            <AiOutlineSearch />
          </div>
          <input
            id="search"
            type="text"
            //  required={required}
            placeholder="Search"
            onChange={onChange}
            value={value}
            className="grow focus:outline-none w-full"
          />
        </div>
      )}
      {type == "area" && (
        <div
          className={`mt-2 mb-2 w-full flex items-center px-[14px] py-[10px] text-[14px] text-[#1A0048] bg-white border-[1px] border-[#D5D7DA] focus-within:border-primary-900 focus:outline-primary-900 rounded-[8px] ${
            value &&
            "invalid:border-error-600 invalid:focus:outline-error-600 peer"
          }`}
        >
          <textarea
            id={name}
            // required={required}
            placeholder={placeholder}
            onInput={(e) => {
              e.currentTarget.style.height = "auto";
              e.currentTarget.style.height =
                e.currentTarget.scrollHeight + "px";
            }}
            style={{ height: "auto", minHeight: "96px" }}
            value={value}
            onChange={onChangeArea}
            className="grow resize-none focus:outline-none"
          />
        </div>
      )}
      {type === "dropdown" && options && (
        <div className="mt-2 mb-2 gap-[8px] flex items-center px-[14px] py-[10px] text-[14px] text-[#1A0048] bg-white border-[1px] border-[#D5D7DA] focus-within:border-primary-900 rounded-[8px] group">
          {icon && (
            <div className="text-[16px] w-fit text-[#717680] group-focus-within:text-primary-900">
              {icon}
            </div>
          )}
          <select
            id={name}
            value={value}
            defaultValue={defaultValue}
            onChange={onChangeDropdown}
            className="grow focus:outline-none w-full bg-white text-[#1A0048] text-[14px] border-none appearance-none"
          >
            {options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="text-[16px] w-fit text-[#717680] group-focus-within:text-primary-900">
            <FaChevronDown />
          </div>
        </div>
      )}
      {type === "date" && (
        <div
          className="mt-2 mb-2 gap-[8px] flex items-center px-[14px] py-[10px] text-[14px] text-[#717680] bg-white border-[1px] border-[#D5D7DA] focus-within:border-primary-900 rounded-[8px] group"
          onClick={handleDateIconClick}
        >
          <div className="text-[16px] w-fit text-[#717680] group-focus-within:text-primary-900">
            <FaCalendarAlt />
          </div>
          <input
            ref={dateInputRef}
            id={name}
            type="date"
            placeholder={placeholder}
            value={value as string}
            onChange={onChange}
            className="grow focus:outline-none w-full bg-white text-[#1A0048] cursor-pointer appearance-none"
          />
        </div>
      )}
    </div>
  );
}
