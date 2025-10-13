"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CANVAS_SIZE } from "@/lib/contants";
import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

    // Calculate dimensions to fit the image
    const imgAspect = originalImage.width / originalImage.height;
    const totalWidth = CANVAS_SIZE * 2; // Two slides side by side
    const targetAspect = totalWidth / CANVAS_SIZE;

    let sourceWidth, sourceHeight, sourceX, sourceY;

    if (imgAspect > targetAspect) {
      // Image is wider - fit to height
      sourceHeight = originalImage.height;
      sourceWidth = sourceHeight * targetAspect;
      sourceX = (originalImage.width - sourceWidth) / 2;
      sourceY = 0;
    } else {
      // Image is taller - fit to width
      sourceWidth = originalImage.width;
      sourceHeight = sourceWidth / targetAspect;
      sourceX = 0;
      sourceY = (originalImage.height - sourceHeight) / 2;
    }

    // Draw left half
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

    // Draw right half
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
        a.download = `instagram-split-${side}-${Date.now()}.png`;
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
    <div className="pt-10">
      <div className="fixed right-10 bottom-10 z-10 flex gap-2">
        {originalImage && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Change Image
            </Button>
            <Button onClick={handleExportBoth}>
              <Download />
              Export
            </Button>
          </div>
        )}
      </div>

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
        <div className="grid md:grid-cols-2 gap-4">
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
        <div className="flex items-center border-b justify-center h-[90vh]">
          <Button onClick={() => fileInputRef.current?.click()}>
            Choose Image
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
          className="hidden"
        />
        {!originalImage ? (
          <Button onClick={() => fileInputRef.current?.click()} size="lg">
            Choose Image
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground truncate">
              {fileName}
            </div>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose Different Image
            </Button>
          </div>
        )}
      </Card>

      {/* Preview Section */}
      {originalImage && (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4 space-y-3">
              <Label className="font-semibold">Slide 1 (Left)</Label>
              <canvas
                ref={leftCanvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="w-full h-auto border-2 border-border rounded-lg"
              />
              <Button
                onClick={() => handleExport("left")}
                variant="outline"
                className="w-full gap-2"
              >
                <Download className="h-4 w-4" />
                Export Slide 1
              </Button>
            </Card>

            <Card className="p-4 space-y-3">
              <Label className="font-semibold">Slide 2 (Right)</Label>
              <canvas
                ref={rightCanvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="w-full h-auto border-2 border-border rounded-lg"
              />
              <Button
                onClick={() => handleExport("right")}
                variant="outline"
                className="w-full gap-2"
              >
                <Download className="h-4 w-4" />
                Export Slide 2
              </Button>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button onClick={handleExportBoth} size="lg" className="gap-2">
              <Download className="h-5 w-5" />
              Export Both Slides
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
