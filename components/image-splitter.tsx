"use client";

import { Button } from "@/components/ui/button";
import { CANVAS_SIZE } from "@/lib/contants";
import { Download, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ActionFAB } from "./fab";

export function ImageSplitter() {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(
    null,
  );
  const [fileName, setFileName] = useState<string>("");
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (originalImage) {
      renderSplitImages();
    }
  }, [originalImage]);

  const handleImageUpload = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        setOriginalImage(img);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const renderSplitImages = () => {
    if (!originalImage || !leftCanvasRef.current || !rightCanvasRef.current)
      return;

    const leftCtx = leftCanvasRef.current.getContext("2d");
    const rightCtx = rightCanvasRef.current.getContext("2d");
    if (!leftCtx || !rightCtx) return;

    // calculate dimensions to fit the photo
    const imgAspect = originalImage.width / originalImage.height;
    const totalWidth = CANVAS_SIZE * 2; // two slides side by side
    const targetAspect = totalWidth / CANVAS_SIZE;

    let sourceWidth, sourceHeight, sourceX, sourceY;

    if (imgAspect > targetAspect) {
      // photo is wider - fit to height
      sourceHeight = originalImage.height;
      sourceWidth = sourceHeight * targetAspect;
      sourceX = (originalImage.width - sourceWidth) / 2;
      sourceY = 0;
    } else {
      // photo is taller - fit to width
      sourceWidth = originalImage.width;
      sourceHeight = sourceWidth / targetAspect;
      sourceX = 0;
      sourceY = (originalImage.height - sourceHeight) / 2;
    }

    // draw left half
    leftCtx.fillStyle = "#ffffff";
    leftCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    leftCtx.drawImage(
      originalImage,
      sourceX,
      sourceY,
      sourceWidth / 2,
      sourceHeight,
      0,
      0,
      CANVAS_SIZE,
      CANVAS_SIZE,
    );

    // draw right half
    rightCtx.fillStyle = "#ffffff";
    rightCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    rightCtx.drawImage(
      originalImage,
      sourceX + sourceWidth / 2,
      sourceY,
      sourceWidth / 2,
      sourceHeight,
      0,
      0,
      CANVAS_SIZE,
      CANVAS_SIZE,
    );
  };

  const handleExport = (side: "left" | "right") => {
    const canvas =
      side === "left" ? leftCanvasRef.current : rightCanvasRef.current;
    if (!canvas) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `SPLIT-${side.toUpperCase()}-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      },
      "image/png",
      1.0,
    );
  };

  const handleExportBoth = () => {
    handleExport("left");
    setTimeout(() => handleExport("right"), 100);
  };

  return (
    <>
      <ActionFAB>
        <div className="flex gap-2">
          {originalImage && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload />
                Change photo
              </Button>
              <Button onClick={handleExportBoth}>
                <Download />
                Export
              </Button>
            </div>
          )}
        </div>
      </ActionFAB>

      <input
        ref={fileInputRef}
        className="hidden"
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
        }}
      />

      {originalImage ? (
        <div className="grid md:grid-cols-2 gap-2 items-center h-screen">
          <canvas
            ref={leftCanvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="w-full h-auto border bg-white"
          />
          <canvas
            ref={rightCanvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="w-full h-auto border bg-white"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <Button onClick={() => fileInputRef.current?.click()}>
            Choose photo
          </Button>
        </div>
      )}
    </>
  );
}
