"use client";
import { GrLinkNext, GrLinkPrevious } from "react-icons/gr";
import Button from "./button";
import { JSX } from "react";

export default function Pagination({
  totalPages,
  current,
  active,
}: {
  totalPages: number;
  current: (x: number) => void | undefined;
  active: number;
}) {
  const handlePageChange = (page: number) => {
    if (page == 0) {
      current(1);
    } else if (page == totalPages + 1) {
      current(totalPages);
    } else {
      current(page);
    }
  };

  const pushPage = (pageNumbers: JSX.Element[], i: number) => {
    pageNumbers.push(
      <div
        key={i}
        className={`cursor-pointer px-[16.5px] py-[10px] rounded-lg font-medium flex items-center justify-center text-[14px] ${
          active === i
            ? "bg-[#F9F5FF] text-[#7F56D9]"
            : "hover:bg-[#F9F5FF] hover:text-[#7F56D9]"
        }`}
        onClick={() => handlePageChange(i)}
      >
        {i}
      </div>
    );
  };

  const renderPage = () => {
    const pageNumbers: JSX.Element[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (totalPages < 5) {
        pushPage(pageNumbers, i);
      } else {
        if (active < totalPages - 3) {
          if ((i < active + 3 && i >= active - 1) || i == totalPages) {
            pushPage(pageNumbers, i);
          } else if (i == active + 3) {
            pageNumbers.push(
              <div
                key={`ellipsis-${i}`}
                className="bg-transparent px-[16.5px] py-[10px] rounded-lg font-medium flex items-center justify-center"
              >
                ...
              </div>
            );
          }
        } else {
          if (i >= totalPages - 3 || i <= totalPages - active + 1) {
            pushPage(pageNumbers, i);
          } else if (i == totalPages - 4) {
            pageNumbers.push(
              <div
                key={`ellipsis-${i}`}
                className="bg-transparent px-[16.5px] py-[10px] rounded-lg font-medium flex items-center justify-center"
              >
                ...
              </div>
            );
          }
        }
      }
    }
    return pageNumbers;
  };

  return (
    <div className="w-full flex justify-between items-center bg-transparent">
      <Button
        color="neutral"
        text={"Previous"}
        type={"button"}
        icon={<GrLinkPrevious />}
        width={115}
        onClick={() => handlePageChange(active - 1)}
        disable={active == 1}
      />
      <div className="flex">{renderPage()}</div>
      <Button
        color="neutral"
        text={"Next"}
        type={"button"}
        icon={<GrLinkNext />}
        width={88}
        onClick={() => handlePageChange(active + 1)}
        disable={active == totalPages}
      />
    </div>
  );
}
