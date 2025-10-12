import { Card, CardContent } from "@/components/ui/card";
import { PAGES } from "@/lib/contants";
import Link from "next/link";

export default function Home() {
  return (
    <main className="h-screen flex items-center gap-4 justify-center">
      {PAGES.map((page) => (
        <Link href={page.route} key={page.route}>
          <Card className="size-[300px]">
            <CardContent className="text-center flex items-center justify-center h-full">
              <p>{page.label}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </main>
  );
}
