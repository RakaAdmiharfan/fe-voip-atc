"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import { IoPersonCircleSharp } from "react-icons/io5";
import { FaSquarePhone } from "react-icons/fa6";
import { FaHeadphonesAlt } from "react-icons/fa";
import { LuLogOut } from "react-icons/lu";
import ModalApprove from "./modal-approval";
import { useSearchParams } from "next/navigation";
import Cookies from "universal-cookie";
// import { postWithAuth } from "@/services/api";
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
          className={`absolute top-4 left-5 lg:hidden z-20 bg-white hover:text-black p-2 rounded-md `}
          onClick={() => {
            setIsMobileOpen((prev) => !prev);
            setInstitutionDataOpen(false);
            setUserDataOpen(false);
          }}
        >
          <FaBars className="w-4 h-4 text-gray-700" />
        </button>
        <nav
          className={`flex flex-col h-full bg-[#292b2f] transition-all duration-300 ${
            isMobileOpen ? "w-60" : "w-[72px]"
          } lg:w-60`}
        >
          {/* Header */}
          <div className="p-8 lg:p-4 border-b border-[#40444b]">
            <div className="p-0 lg:p-2 flex rounded-2xl gap-4">
              <Image
                src={"next.svg"}
                alt={"Logo"}
                className={`w-10 hidden lg:block justify-center items-center transition-transform duration-300 bg-[#40444b] p-2 rounded-lg`}
                width={10}
                height={10}
              />
              <div className="my-auto hidden lg:block">
                <h1 className="text-[15px] font-bold text-white">Username</h1>
                <h2 className="text-[14px] text-white">email</h2>
              </div>
            </div>
          </div>

          {/* Menu */}
          <ul className="p-6 flex-1 overflow-y-auto">
            {/* Contact */}
            <li>
              <Link
                href="/contact"
                className={`flex items-center lg:p-2 rounded-lg ${
                  active === 1
                    ? `text-white font-semibold lg:bg-[#40444b]`
                    : `text-white hover:bg-[#2f3136]`
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
                className={`flex items-center lg:p-2 rounded-lg ${
                  active === 3
                    ? `text-white font-semibold lg:bg-[#40444b]`
                    : `text-white hover:bg-[#2f3136]`
                }`}
                // onClick={() => setIsMobileOpen(false)}
              >
                <FaHeadphonesAlt className="w-5 h-5 rounded-full" />
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
                className={`flex items-center lg:p-2 rounded-lg ${
                  active === 2
                    ? `text-white font-semibold lg:bg-[#40444b]`
                    : `text-white hover:bg-[#2f3136]`
                }`}
                // onClick={() => setIsMobileOpen(false)}
              >
                <FaSquarePhone className="w-6 h-6 rounded-full" />
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
          <div className="w-full flex justify-center p-4 border-t border-[#40444b]">
            <button
              onClick={() => setShowModal(true)}
              className="p-2 rounded-full transition"
            >
              <LuLogOut className="text-xl text-white hover:text-red-500" />
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
