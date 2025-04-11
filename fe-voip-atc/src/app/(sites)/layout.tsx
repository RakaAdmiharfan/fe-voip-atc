import React from "react";
import Sidebar from "@/components/sidebar";
import "react-toastify/dist/ReactToastify.css";
import CallUI from "@/components/callUI";
import { CallProvider } from "@/context/callContext";
import { UserAgent } from "sip.js";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const sipUserAgent = new UserAgent({
    uri: UserAgent.makeURI("sip:username@16.78.90.15"),
    transportOptions: { server: "wss://16.78.90.15" },
    authorizationUsername: "username",
    authorizationPassword: "password",
  });

  sipUserAgent.start().then(() => {
    console.log("SIP.js UserAgent started");
  });

  return (
    // <CallProvider>
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="ml-16 lg:ml-0 flex-1 flex flex-col w-screen bg-white overflow-hidden relative">
        <main className="p-8 md:p-12 overflow-y-auto">{children}</main>
        {/* <CallUI /> */}
      </div>
    </div>
    // </CallProvider>
  );
};

export default Layout;
