import Image from "next/image";
import Link from "next/link";
import React from "react";
import MobileNav from "./MobileNav";
import Theme from "./Theme";

const Navbar = () => {
  return (
    <nav className="flex-between background-light900_dark200 fixed z-50 w-full gap-5 p-6 shadow-light-300 sm:px-12 dark:shadow-none">
      <Link href={"/"} className="flex">
        <Image
          src={"/assets/images/site-logo.svg"}
          width={23}
          height={23}
          alt="DevOverFlow"
        />
        <p className="h2-bold ml-2 font-spaceGrotesk text-dark-100 max-sm:hidden dark:text-light-900">
          Dev <span className="text-primary-500">OverFlow</span>
        </p>
      </Link>
      <div className="flex-between gap-5">
        <Theme />

        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;
