"use client";

import { useState, useRef } from "react";
import { RiUploadCloud2Line } from "react-icons/ri";
import Button from "./button";
import Image from "next/image";

export default function UploadBox({
  type,
  file,
  setFile,
}: {
  type: string;
  file?: string;
  setFile: (file: File | null) => void;
}) {
  const [imagePreview, setImagePreview] = useState<string | null>(file || null);

  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const uploadedFile = e.target.files[0];
      handleImageUpload(uploadedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const uploadedFile = e.dataTransfer.files[0];
    handleImageUpload(uploadedFile);
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleImageUpload = (uploadedFile: File) => {
    if (uploadedFile && uploadedFile.type.startsWith("image/")) {
      setFile(uploadedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImagePreview(reader.result as string);
        }
      };
      reader.readAsDataURL(uploadedFile);
    } else {
      alert("Please select a valid image file");
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`w-[216px] md:w-[260px] h-auto bg-white p-4 md:p-6 flex flex-col items-start rounded-xl gap-4 md:gap-5 mb-3 ${
        type == "Foto" ? "" : "shadow-xl"
      }`}
    >
      <div
        className={`w-full h-[175px] md:h-[200px] p-2 rounded-lg flex flex-col items-center justify-center gap-4 transition-all duration-200 cursor-pointer ${
          imagePreview
            ? ""
            : `border-2 border-dashed ${
                isDragging
                  ? "border-primary-900 bg-primary-50"
                  : "border-[#E0E0E0] bg-white"
              }`
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload"
          ref={fileInputRef}
        />
        <div
          className={`cursor-pointer font-semibold flex flex-col justify-center items-center ${
            imagePreview ? "hidden" : "block"
          }`}
        >
          <RiUploadCloud2Line className="w-6 h-6" />
          <p className="text-[8px] md:text-[10px] text-[#292D32] mt-4 mb-[6px] font-medium text-center">
            Choose a file or drag & drop it here
          </p>
          <p className="text-[8px] md:text-[10px] text-[#A9ACB4] font-medium text-center">
            JPEG, PNG, PDG, and MP4 formats, up to 50MB
          </p>
        </div>

        {imagePreview && (
          <div className="w-full h-auto mt-4">
            <Image
              src={imagePreview}
              alt="Uploaded preview"
              className="w-full h-[180px] object-cover rounded-md"
              width={10}
              height={10}
            />
          </div>
        )}
      </div>
      <Button text={"Upload " + type} type={"button"} color="neutral" onClick={handleClick} />
    </div>
  );
}
