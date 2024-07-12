import Image from "next/image";
import React from "react";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Image
        src={"/assets/images/auth-light.png"}
        alt="Auth Bg"
        fill
        className="size-full"
      />
      {children}
    </div>
  );
}

export default Layout;
