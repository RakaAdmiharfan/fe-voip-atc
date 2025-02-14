"use client";
import { ReactNode } from "react";
import Pagination from "./pagination";

type PrimitiveCellValue = string | number;
type ArrayCellValue = string[] | number[];
type CellValue = PrimitiveCellValue | ArrayCellValue | ReactNode;

interface TableProps<T extends Record<string, any>> {
  data: T[];
  header?: string[]; // Header bisa kosong
  addedItems?: ReactNode;
  isLoading: boolean;
  totalPages?: number;
  current: (x: number) => void | undefined;
  active: number;
}

function Table<T extends Record<string, any>>({
  data,
  header = [],
  addedItems,
  isLoading,
  totalPages = 1,
  current,
  active,
}: TableProps<T>) {
  const Load = () => {
    const dummy = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    return dummy.map((idx: number) => (
      <tr key={idx}>
        {(header.length > 0 ? header : Object.keys(data[0] || {})).map(
          (idx) => (
            <td
              key={idx}
              className="h-auto w-auto border-collapse px-2 py-1 text-[14px] md:text-[16px] text-center lg:px-4"
            >
              <div className="h-4 w-full animate-pulse bg-gray-600 bg-opacity-10"></div>
            </td>
          )
        )}
      </tr>
    ));
  };

  const renderCell = (cell: any) => {
    if (Array.isArray(cell)) {
      return (
        <ul className="list-disc pl-5 text-start w-full">
          {cell.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    } else {
      return cell;
    }
  };

  return (
    <div className="flex flex-col rounded-lg">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-[#E9EAEB] justify-center items-center">
          {/* Table Header (ditampilkan hanya jika header tersedia) */}
          {header.length > 0 && (
            <thead>
              <tr>
                {header.map((head, idx) => (
                  <th
                    key={idx}
                    className="h-auto w-auto bg-[#FAFAFA] px-1 py-2 md:px-3 md:py-4 text-xs sm:text-sm md:text-[16px] text-center font-medium truncate text-[#535862]"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
          )}

          {/* Table Body */}
          <tbody>
            {isLoading ? (
              <Load />
            ) : data.length > 0 ? (
              data.map((obj, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {Object.values(obj).map((cell, idx) => (
                    <td
                      key={idx}
                      className="h-auto w-auto border-b-2 border-orange-100 px-1 py-2 md:px-3 md:py-8 text-xs sm:text-sm md:text-[16px] text-center font-medium text-[#181D27] align-middle"
                    >
                      {renderCell(cell)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    (header.length > 0
                      ? header.length
                      : Object.keys(data[0] || {}).length) +
                    (addedItems ? 1 : 0)
                  }
                  className="h-auto w-auto border-collapse px-3 py-5 text-xs sm:text-sm md:text-[16px] text-center text-gray-500"
                >
                  Data tidak ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Fixed Pagination */}
      <div className="mt-8 p-2 justify-center sticky w-full bg-white rounded-lg">
        <Pagination totalPages={totalPages} current={current} active={active} />
      </div>
    </div>
  );
}

export default Table;
