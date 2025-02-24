"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaBars, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { MdFolderShared, MdHistory } from "react-icons/md";
import { usePathname, useRouter } from "next/navigation";
import { IoPersonCircleSharp } from "react-icons/io5";
import { BsGrid3X3GapFill } from "react-icons/bs";
import { LuLogOut } from "react-icons/lu";
import ModalApprove from "./modal-approval";
import { RiBankLine } from "react-icons/ri";
import { useSearchParams } from "next/navigation";
import Cookies from "universal-cookie";
// import { postWithAuth } from "@/services/api";
import { useSelector } from "react-redux";
import Image from "next/image";

const Sidebar = () => {
  const cookies = new Cookies();
  const role = cookies.get("role");
  let username = cookies.get("username");
  let email = cookies.get("email");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isUserDataOpen, setUserDataOpen] = useState(false);
  const [isInstitutionDataOpen, setInstitutionDataOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [active, setActive] = useState(0);

  const [navOpen, setNavOpen] = useState(false); // Desktop toggle
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Mobile toggle

  useEffect(() => {
    setNavOpen(false);
    const type = searchParams.get("type");
    if (pathname === "/contact") {
      setActive(1);
    } else if (pathname === "/call-list") {
      setActive(2);
    } else if (pathname === "/channel") {
      setActive(3);
    } else {
      setActive(-1);
    }
  }, [pathname, searchParams]);

  const handleLogOut = async () => {
    // const token = cookies.get("token");
    // setIsLoading(true);
    // const formData = new FormData();
    // try {
    //   await postWithAuth("logout", formData, token);
    //   cookies.remove("token", { path: "/", sameSite: "lax", secure: true });
    //   cookies.remove("user_id", { path: "/", sameSite: "lax", secure: true });
    //   cookies.remove("role", { path: "/", sameSite: "lax", secure: true });
    //   cookies.remove("username", { path: "/", sameSite: "lax", secure: true });
    //   cookies.remove("email", { path: "/", sameSite: "lax", secure: true });
    //   router.push("/login");
    //   window.location.reload();
    // } catch (error) {
    //   console.error("Logout error:", error);
    // }
  };

  return (
    <>
      {showModal && (
        <ModalApprove
          image="/modal/logout-icon.svg"
          title="Log out Account"
          subtitle="Apakah kamu yakin ingin log out dari akun ini?"
          button1Text="Cancel"
          button2Text="Ya"
          button1Color="bg-[#FFFFFF]"
          button1TextColor="text-[#414651]"
          button2Color="bg-[#D92D20]"
          button2TextColor="text-[#FFFFFF]"
          onButton1Click={() => setShowModal(false)}
          onButton2Click={() => handleLogOut()}
          loading={isLoading}
        />
      )}

      <aside
        className={`h-screen fixed lg:relative ${
          isMobileOpen || navOpen ? "inset-0 bg-black bg-opacity-50 z-30" : ""
        } z-40 overflow-hidden`}
      >
        <button
          className={`absolute top-4 left-4 lg:hidden z-20 bg-white hover:text-black p-2 rounded-md `}
          onClick={() => {
            setIsMobileOpen((prev) => !prev);
            setInstitutionDataOpen(false);
            setUserDataOpen(false);
          }}
        >
          <FaBars className="w-6 h-6 text-gray-700" />
        </button>
        <nav
          className={`flex flex-col h-full bg-white border-r border-[#E6E7EC] transition-all duration-300 ${
            isMobileOpen ? "w-60" : "w-[72px]"
          } lg:w-60`}
        >
          {/* Header */}
          <div className="p-4 border-b border-[#EDEEF3]">
            <div className="p-0 lg:p-4 border-b border-[#EDEEF3] flex rounded-2xl gap-4">
              <Image
                src={"next.svg"}
                alt={"Logo"}
                className={`w-10 justify-center items-center transition-transform duration-300 `}
                width={10}
                height={10}
              />
              <div className="my-auto hidden lg:block">
                <h1 className="text-[15px] font-bold text-black">Username</h1>
                <h2 className="text-[14px] text-black">email</h2>
              </div>
            </div>
          </div>

          {/* Menu */}
          <ul className="p-6 flex-1 overflow-y-auto">
            {/* Contact */}
            <li>
              <Link
                href="/contact"
                className={`flex items-center p-2 rounded-lg ${
                  active === 1
                    ? `text-white font-semibold border bg-orange-400`
                    : `text-orange-400 hover:text-black`
                }`}
              >
                <IoPersonCircleSharp className="w-6 h-6" />
                <span
                  className={`${
                    navOpen || isMobileOpen ? "block" : "hidden"
                  } lg:block ml-3`}
                >
                  Contacts
                </span>
              </Link>
            </li>

            {/* channel */}
            <li className="mt-4">
              <Link
                href="/channel"
                className={`flex items-center p-2 rounded-lg ${
                  active === 3
                    ? `text-white font-semibold border bg-orange-400`
                    : `text-orange-400 hover:text-black hover:bg-orange-100`
                }`}
                // onClick={() => setIsMobileOpen(false)}
              >
                <IoPersonCircleSharp className="w-6 h-6" />
                <span
                  className={`${
                    navOpen || isMobileOpen ? "block" : "hidden"
                  } lg:block ml-3`}
                >
                  Channel
                </span>
              </Link>
            </li>

            {/* Call List */}
            <li className="mt-4">
              <Link
                href="/call-list"
                className={`flex items-center p-2 rounded-lg ${
                  active === 2
                    ? `text-white font-semibold border bg-orange-400`
                    : `text-orange-400 hover:text-black hover:bg-orange-100`
                }`}
                // onClick={() => setIsMobileOpen(false)}
              >
                <IoPersonCircleSharp className="w-6 h-6" />
                <span
                  className={`${
                    navOpen || isMobileOpen ? "block" : "hidden"
                  } lg:block ml-3`}
                >
                  Call List
                </span>
              </Link>
            </li>
          </ul>

          {/* Footer */}
          <div
            className={`w-full flex justify-center items-center mx-6 lg:mx-auto py-6 border-t border-gray-200`}
          >
            <div className="flex items-center">
              <div
                className={`${
                  navOpen || isMobileOpen ? "block" : "hidden"
                } ml-2 lg:block`}
              >
                <p className="text-[#181D27] text-sm font-semibold">
                  {username}
                </p>
                <p className="text-[#535862] text-sm font-normal">{email}</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(true);
                }}
              >
                <LuLogOut className="text-lg text-gray-600 ml-8" />
              </button>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
