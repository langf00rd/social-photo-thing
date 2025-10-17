"use client";

import { PAGES } from "@/lib/contants";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";

export default function Nav() {
  const pathname = usePathname();
  const [isHidden, setIsHidden] = useState(false);

  function toggleHidden() {
    setIsHidden((prev) => !prev);
  }

  return (
    <div
      className={`flex fixed bottom-2 left-0 overflow-hidden items-center w-screen ${isHidden ? "justify-start" : "justify-center"}`}
    >
      <Button
        size="icon"
        variant="outline"
        className={`h-[46px] ${!isHidden && "border-r-0"}`}
        onClick={toggleHidden}
      >
        {isHidden ? <ChevronRight /> : <ChevronLeft />}
      </Button>
      {!isHidden && (
        <div className="grid md:grid-cols-5 overflow-hidden bg-white gap-4 md:gap-0 border py-3">
          {PAGES.map((page, index) => (
            <Link
              href={page.route}
              className={`uppercase text-nowrap tracking-tight text-sm last:border-none md:border-r text-center px-4 flex-1 w-full ${pathname === page.route ? "text-black font-medium" : "text-neutral-400"}`}
              key={page.route}
            >
              <motion.p
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
              >
                {page.label}
              </motion.p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
