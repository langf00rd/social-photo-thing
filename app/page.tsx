"use client";

import { motion } from "motion/react";

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="max-w-[950px] space-y-20 px-10">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="space-y-4"
        >
          <h1 className="text-xl text-center md:leading-[1.25] md:text-[3.4rem] font-medium"></h1>
          <h1 className="text-xl text-center md:leading-[1.25] md:text-[3.4rem] font-medium">
            Free Photo Splitter, Collage Maker &amp; Color Extractor
          </h1>
          <motion.p className="text-neutral-500 max-w-xl mx-auto text-xl text-center">
            Upload your photo, see its color theme, make a collage, or slice it
            into seamless panels for Instagram carousels
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
