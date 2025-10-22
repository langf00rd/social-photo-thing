"use client";

import { PAGES } from "@/lib/contants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Nav() {
  const pathname = usePathname();
  const [isHidden, setIsHidden] = useState(false);

  function toggleHidden() {
    setIsHidden((prev) => !prev);
  }

  return (
    <div className="fixed border bottom-2 bg-white px-5 flex gap-10 h-[50px] items-center left-[28%]">
      {PAGES.map((page, index) => (
        <Link
          key={page.route}
          href={page.route}
          className={`flex items-center gap-1 ${pathname === page.route ? "text-black font-medium" : "text-neutral-400"}`}
        >
          {<page.icon size={18} />}
          {page.label}
        </Link>
      ))}
    </div>
  );

  return (
    <div
    // className={`fixed bottom-2 left-0 overflow-hidden  ${isHidden ? "justify-start" : "justify-center"}`}
    >
      {/*<Button
        size="icon"
        variant="outline"
        className={`h-[46px] ${!isHidden && "border-r-0"}`}
        onClick={toggleHidden}
      >
        {isHidden ? <ChevronRight /> : <ChevronLeft />}
      </Button>*/}
      {!isHidden && (
        <div
          className="flex h-full w-[1000px] border-t"
          // className={`grid md:grid-cols-6 overflow-hidden bg-white gap-4 md:gap-0 border py-3`}
        >
          {PAGES.map((page, index) => (
            <Link
              href={page.route}
              className={`flex flex-1 items-center bg-red-400 border`}
              // className={`uppercase flex gap-2 border justify-center items-center text-nowrap tracking-tight text-sm last:border-none md:border-r text-center px-4 flex-1 w-full ${pathname === page.route ? "text-black font-medium" : "text-neutral-400"}`}
              key={page.route}
            >
              {<page.icon size={20} />}
              {page.label}
              {/*<motion.p
                initial={{
                  y: 40,
                  opacity: 0,
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                }}
                transition={{
                  delay: index * 0.15,
                  type: "tween",
                }}
              ></motion.p>*/}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
