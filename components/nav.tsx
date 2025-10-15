"use client";

import { PAGES } from "@/lib/contants";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  return (
    <div className="flex fixed bottom-4 left-0 items-center justify-center py-2 w-screen">
      <div className="grid md:grid-cols-4 overflow-hidden bg-white gap-4 md:gap-0 border py-3">
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
    </div>
  );
}
