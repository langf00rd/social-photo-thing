import { CollageCanvas } from "@/components/collage-canvas";
import { Metadata } from "next";

export default function CollagePage() {
  return <CollageCanvas />;
}

export const metadata: Metadata = {
  title: "collage maker",
};
