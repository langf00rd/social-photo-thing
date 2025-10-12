"use client";

import { PAGES } from "@/lib/contants";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  return (
    <div className="fixed bottom-0 left-0 flex items-center justify-center py-10 w-screen">
      <div className="grid grid-cols-3 bg-white border shadow-xs p-2">
        {PAGES.map((page) => (
          <Link
            href={page.route}
            className={`uppercase tracking-tight last:border-none border-r text-center px-4 flex-1 w-full ${pathname === page.route ? "text-black font-medium" : "text-neutral-400"}`}
            key={page.route}
          >
            <p>{page.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
