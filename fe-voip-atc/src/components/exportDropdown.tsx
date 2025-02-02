"use client";
import { FiDownload } from "react-icons/fi";
import { FaChevronDown } from "react-icons/fa";
import { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getWithAuth } from "@/services/api";
import Cookies from "universal-cookie";

export default function DropdownButton({
  id,
  type,
}: {
  id: string;
  type: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const cookies = new Cookies();
  const token = cookies.get("token");

  // Fungsi untuk ekspor CSV
  const handleExportCSV = async (id: string) => {
    try {
      setIsOpen(false);
      const rowData = await getDataById(id); // Tunggu data selesai diambil
      if (!rowData) {
        console.error("No data found to export for CSV");
        return;
      }

      const csvRows = [
        Object.keys(rowData).join(","), // Header
        Object.values(rowData).join(","), // Data row
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `${type || "data"}_${id}.csv`);
      setIsOpen(false);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  // Fungsi untuk ekspor XLSX
  const handleExportXLSX = async (id: string) => {
    try {
      setIsOpen(false);
      const rowData = await getDataById(id); // Tunggu data selesai diambil
      if (!rowData) {
        console.error("No data found to export for XLSX");
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet 1");

      // Tambahkan header dan data row
      worksheet.addRow(Object.keys(rowData));
      worksheet.addRow(Object.values(rowData));

      // Ekspor ke file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `${type || "data"}_${id}.xlsx`);
    } catch (error) {
      console.error("Error exporting XLSX:", error);
    }
  };

  // Fungsi untuk mendapatkan data berdasarkan ID
  const getDataById = async (id: string) => {
    try {
      let endpoint = "";
      if (type === "data-pengguna") {
        endpoint = `entry-user/${id}`;
      } else if (type === "data-lembaga") {
        endpoint = `entry-lembaga/${id}`;
      } else {
        throw new Error("Type tidak valid");
      }

      const response = await getWithAuth(token, endpoint);
      const apiData = response.data.data; // Ambil data dari response

      console.log(`Fetched data for ID ${id}:`, apiData);

      return apiData; // Pastikan data sesuai dengan kebutuhan
    } catch (error) {
      console.error(`Error fetching data for ID ${id}:`, error);
      return null; // Kembalikan nilai null jika terjadi kesalahan
    }
  };

  return (
    <div className="flex relative justify-center items-center">
      <button
        onClick={toggleDropdown}
        className="flex items-center px-4 py-2 text-xs md:text-sm font-medium text-[#181D27] bg-white border-2 border-[#D5D7DA] rounded-md gap-2"
      >
        <div>
          <FiDownload />
        </div>
        <p>Ekspor Data</p>
        <div>
          <FaChevronDown />
        </div>
      </button>

      {isOpen && (
        <div className="z-[1000] absolute top-full mt-2 bg-white border border-[#F5F5F5] rounded-sm shadow-lg w-fit">
          <div className="p-2">
            <button
              className="flex items-left w-full text-[#181D27] text-[6px] md:text-[10px] p-1 md:p-2"
              onClick={() => handleExportCSV(id)}
            >
              Ekspor Format CSV (.csv)
            </button>
            <button
              className="flex items-left w-full text-[#181D27] text-[6px] md:text-[10px] p-1 md:p-2"
              onClick={() => handleExportXLSX(id)}
            >
              Ekspor Format XLSX (.xlsx)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
