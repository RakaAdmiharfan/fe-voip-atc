// components/faviconUpdater.js
"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function FaviconUpdater() {
  const customization = useSelector((state: RootState) => state.customization);

  useEffect(() => {
    let favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (favicon) {
      favicon.href = customization.favicon; // Pastikan state Redux memiliki properti `favicon`
    } else {
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = customization.favicon;
      document.head.appendChild(link);
    }
  }, [customization.favicon]);

  return null; // Komponen ini tidak merender elemen DOM
}