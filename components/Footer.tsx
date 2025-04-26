import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <div className="fixed bottom-[30px] left-[15px] z-50 text-white text-sm">
      <div className="flex flex-col gap-2 backdrop-blur-md bg-black/50 p-4 rounded-xl shadow-lg shadow-black/30">
        <Link
          href="https://github.com/ThalesBMC/vibe-radio"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center hover:text-yellow-400 transition-all group"
        >
          <span className="group-hover:underline ml-2">
            Open Source on GitHub ⭐
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Footer;
