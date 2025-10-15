import { ImageSplitter } from "@/components/image-splitter";
import { Metadata } from "next";

export default function SplitterPage() {
  return <ImageSplitter />;
}

export const metadata: Metadata = {
  title: "photo splitter",
};
