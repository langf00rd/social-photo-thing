"use client";

import { PAGES } from "@/lib/contants";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  return (
    <div className="flex fixed bottom-0 left-0 items-center justify-center py-2 w-screen">
      <div className="grid md:grid-cols-4 bg-white gap-4 md:gap-0 border py-2">
        {PAGES.map((page) => (
          <Link
            href={page.route}
            className={`uppercase text-nowrap tracking-tight text-sm last:border-none md:border-r text-center px-4 flex-1 w-full ${pathname === page.route ? "text-black font-medium" : "text-neutral-400"}`}
            key={page.route}
          >
            <p>{page.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
