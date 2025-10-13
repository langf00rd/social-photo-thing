import { Card, CardContent } from "@/components/ui/card";
import { PAGES } from "@/lib/contants";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center">
      <div className="max-w-[800px] space-y-10 px-10 pt-32">
        <div>
          <h1 className="text-xl md:text-[3rem] font-medium text-left">
            A free Instagram photo splitter and collage maker
          </h1>
        </div>
        <div className="space-y-4">
          <p className="text-xl text-neutral-500">What do you want to do?</p>
          <div className="grid md:grid-cols-3 gap-4">
            {PAGES.map((page) => (
              <Link href={page.route} key={page.route}>
                <Card
                  className={`h-[100px] w-full ${page.enabled === false ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <CardContent className="text-center text-neutral-600 gap-2 flex items-center justify-center h-full">
                    <page.icon className="text-neutral-300" size={20} />
                    <p>{page.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
