"use client";

import dynamic from "next/dynamic";

const AuthListener = dynamic(() => import("./AuthListener"), { ssr: false });

export default function ClientLayout({ children }) {
  return (
    <>
      <AuthListener />
      {children}
    </>
  );
}
