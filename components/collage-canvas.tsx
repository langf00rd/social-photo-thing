"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CANVAS_SIZE } from "@/lib/contants";
import { Download, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

type LayoutPreset = {
  id: string;
  name: string;
  slots: number;
  divisions: { x: number; y: number; width: number; height: number }[];
};

const PRESETS: LayoutPreset[] = [
  {
    id: "single",
    name: "1 Image",
    slots: 1,
    divisions: [{ x: 0, y: 0, width: 1, height: 1 }],
  },
  {
    id: "vertical-2",
    name: "2 Vertical",
    slots: 2,
    divisions: [
      { x: 0, y: 0, width: 0.5, height: 1 },
      { x: 0.5, y: 0, width: 0.5, height: 1 },
    ],
  },
  {
    id: "horizontal-2",
    name: "2 Horizontal",
    slots: 2,
    divisions: [
      { x: 0, y: 0, width: 1, height: 0.5 },
      { x: 0, y: 0.5, width: 1, height: 0.5 },
    ],
  },
  {
    id: "grid-3",
    name: "3 Grid",
    slots: 3,
    divisions: [
      { x: 0, y: 0, width: 0.5, height: 0.5 },
      { x: 0.5, y: 0, width: 0.5, height: 0.5 },
      { x: 0, y: 0.5, width: 1, height: 0.5 },
    ],
  },
  {
    id: "grid-4",
    name: "4 Grid",
    slots: 4,
    divisions: [
      { x: 0, y: 0, width: 0.5, height: 0.5 },
      { x: 0.5, y: 0, width: 0.5, height: 0.5 },
      { x: 0, y: 0.5, width: 0.5, height: 0.5 },
      { x: 0.5, y: 0.5, width: 0.5, height: 0.5 },
    ],
  },
];

type ImageSlot = {
  file: File | null;
  img: HTMLImageElement | null;
  scale: number;
  offsetX: number;
  offsetY: number;
};

export function CollageCanvas() {
  const [selectedPreset, setSelectedPreset] = useState<LayoutPreset>(
    PRESETS[0],
  );
  const [images, setImages] = useState<ImageSlot[]>([]);
  const [gapSize, setGapSize] = useState(0);
  const [padding, setPadding] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setImages(
      Array(selectedPreset.slots)
        .fill(null)
        .map(() => ({
          file: null,
          img: null,
          scale: 1,
          offsetX: 0,
          offsetY: 0,
        })),
    );
    setSelectedSlot(null);
  }, [selectedPreset]);

  useEffect(() => {
    renderCanvas();
  }, [images, selectedPreset, gapSize, backgroundColor, padding, selectedSlot]);

  const handleImageUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        setImages((prev) => {
          const newImages = [...prev];
          newImages[index] = {
            file,
            img,
            scale: 1,
            offsetX: 0,
            offsetY: 0,
          };
          return newImages;
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = CANVAS_SIZE;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);

    const availableSize = size - padding * 2;

    selectedPreset.divisions.forEach((division, index) => {
      const imageSlot = images[index];
      const slotWidth = division.width * availableSize - gapSize;
      const slotHeight = division.height * availableSize - gapSize;
      const slotX = padding + division.x * availableSize + gapSize / 2;
      const slotY = padding + division.y * availableSize + gapSize / 2;

      if (!imageSlot?.img) {
        ctx.fillStyle = "#f5f5f5";
        ctx.fillRect(slotX, slotY, slotWidth, slotHeight);
        ctx.strokeStyle = "#e0e0e0";
        ctx.lineWidth = 2;
        ctx.strokeRect(slotX, slotY, slotWidth, slotHeight);
        return;
      }

      const imgAspect = imageSlot.img.width / imageSlot.img.height;
      const slotAspect = slotWidth / slotHeight;

      let drawWidth, drawHeight;
      if (imgAspect > slotAspect) {
        drawHeight = slotHeight * imageSlot.scale;
        drawWidth = drawHeight * imgAspect;
      } else {
        drawWidth = slotWidth * imageSlot.scale;
        drawHeight = drawWidth / imgAspect;
      }

      const drawX = slotX + (slotWidth - drawWidth) / 2 + imageSlot.offsetX;
      const drawY = slotY + (slotHeight - drawHeight) / 2 + imageSlot.offsetY;

      ctx.save();
      ctx.beginPath();
      ctx.rect(slotX, slotY, slotWidth, slotHeight);
      ctx.clip();
      ctx.drawImage(imageSlot.img, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();

      if (selectedSlot === index) {
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 6;
        ctx.strokeRect(slotX, slotY, slotWidth, slotHeight);
        ctx.fillStyle = "rgba(6, 182, 212, 0.1)";
        ctx.fillRect(slotX, slotY, slotWidth, slotHeight);
      }
    });
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const exportSize = CANVAS_SIZE * 2; // 2x resolution export
    const exportCanvas = document.createElement("canvas");
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    exportCanvas.width = exportSize;
    exportCanvas.height = exportSize;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, exportSize, exportSize);

    const availableSize = exportSize - padding * 2;

    selectedPreset.divisions.forEach((division, index) => {
      const imageSlot = images[index];
      const slotWidth = division.width * availableSize - gapSize;
      const slotHeight = division.height * availableSize - gapSize;
      const slotX = padding + division.x * availableSize + gapSize / 2;
      const slotY = padding + division.y * availableSize + gapSize / 2;

      if (!imageSlot?.img) {
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(slotX, slotY, slotWidth, slotHeight);
        return;
      }

      const imgAspect = imageSlot.img.width / imageSlot.img.height;
      const slotAspect = slotWidth / slotHeight;

      let drawWidth, drawHeight;
      if (imgAspect > slotAspect) {
        drawHeight = slotHeight * imageSlot.scale;
        drawWidth = drawHeight * imgAspect;
      } else {
        drawWidth = slotWidth * imageSlot.scale;
        drawHeight = drawWidth / imgAspect;
      }

      const drawX = slotX + (slotWidth - drawWidth) / 2 + imageSlot.offsetX * 2;
      const drawY =
        slotY + (slotHeight - drawHeight) / 2 + imageSlot.offsetY * 2;

      ctx.save();
      ctx.beginPath();
      ctx.rect(slotX, slotY, slotWidth, slotHeight);
      ctx.clip();
      ctx.drawImage(imageSlot.img, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();
    });

    exportCanvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `instagram-collage-${Date.now()}-highres.png`;
        a.click();
        URL.revokeObjectURL(url);
      },
      "image/png",
      1.0,
    );
  };

  const updateImageProperty = (
    index: number,
    property: keyof ImageSlot,
    value: number,
  ) => {
    setImages((prev) => {
      const newImages = [...prev];
      newImages[index] = { ...newImages[index], [property]: value };
      return newImages;
    });
  };

  const clearImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      newImages[index] = {
        file: null,
        img: null,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
      };
      return newImages;
    });
    if (selectedSlot === index) {
      setSelectedSlot(null);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const availableSize = CANVAS_SIZE - padding * 2;
    let clickedInside = false;

    for (let i = 0; i < selectedPreset.divisions.length; i++) {
      const division = selectedPreset.divisions[i];
      const slotX = padding + division.x * availableSize + gapSize / 2;
      const slotY = padding + division.y * availableSize + gapSize / 2;
      const slotWidth = division.width * availableSize - gapSize;
      const slotHeight = division.height * availableSize - gapSize;

      if (
        x >= slotX &&
        x <= slotX + slotWidth &&
        y >= slotY &&
        y <= slotY + slotHeight
      ) {
        // Clicked inside this slot
        setSelectedSlot(i);
        clickedInside = true;
        break;
      }
    }

    // If click was outside all slots — remove highlight
    if (!clickedInside) {
      setSelectedSlot(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedSlot === null || !images[selectedSlot]?.img) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (canvasRef.current && !canvasRef.current.contains(e.target as Node)) {
        setSelectedSlot(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || selectedSlot === null) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    updateImageProperty(
      selectedSlot,
      "offsetX",
      images[selectedSlot].offsetX + deltaX,
    );
    updateImageProperty(
      selectedSlot,
      "offsetY",
      images[selectedSlot].offsetY + deltaY,
    );
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (selectedSlot === null || !images[selectedSlot]?.img) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(
      0.5,
      Math.min(3, images[selectedSlot].scale + delta),
    );
    updateImageProperty(selectedSlot, "scale", newScale);
  };

  const renderPresetPreview = (preset: LayoutPreset) => {
    const size = 80;
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="mx-auto"
      >
        <rect width={size} height={size} fill="#ccc" opacity="0.1" rx="4" />
        {preset.divisions.map((division, index) => (
          <rect
            key={index}
            x={division.x * size + 2}
            y={division.y * size + 2}
            width={division.width * size - 4}
            height={division.height * size - 4}
            fill="#ccc"
            opacity="0.3"
            stroke="#ccc"
            strokeWidth="1.5"
            rx="2"
          />
        ))}
      </svg>
    );
  };

  return (
    <div>
      <Button onClick={handleExport} className="fixed right-10 bottom-10 z-10">
        <Download />
        Export
      </Button>
      <div className="flex h-screen flex-row-reverse w-full gap-4">
        <div className="flex-1 p-14 flex items-start  space-y-4">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="w-full h-auto border max-w-[70vh] mx-auto cursor-move"
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
        </div>
        <div className="flex-1 p-14 border-r space-y-20">
          <div className="space-y-2">
            <Label>Choose Layout</Label>
            <div className="flex flex-wrap gap-4">
              {PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  className={`border p-1 cursor-pointer hover:bg-neutral-100 ${selectedPreset.id === preset.id ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setSelectedPreset(preset)}
                >
                  {renderPresetPreview(preset)}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Select Photos</Label>
            <div className="gap-4 grid grid-cols-2">
              {images.map((imageSlot, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`w-full ${selectedSlot === index ? "ring-2 ring-primary" : ""}`}
                  onClick={() => {
                    setSelectedSlot(index);
                    if (!imageSlot.img) {
                      fileInputRefs.current[index]?.click();
                    }
                  }}
                >
                  <div>
                    {imageSlot.img ? (
                      <div
                        className="flex items-center text-destructive gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearImage(index);
                        }}
                      >
                        <Trash2 /> Remove photo {index + 1}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-500">
                        Choose photo #{index + 1}
                      </p>
                    )}
                  </div>
                  <input
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(index, file);
                    }}
                    ref={(el) => {
                      fileInputRefs.current[index] = el;
                    }}
                  />
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Label>Customize Grid</Label>
            <div>
              <p className="font-medium text-neutral-500 text-sm">Gap</p>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={gapSize}
                onChange={(e) => setGapSize(Number.parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <p className="font-medium text-neutral-500 text-sm">Padding</p>
              <input
                type="range"
                min="0"
                max="200"
                step="10"
                value={padding}
                onChange={(e) => setPadding(Number.parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-neutral-500 text-sm">
                Background Color
              </p>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={backgroundColor}
                  className="w-10 p-1"
                  onChange={(e) => setBackgroundColor(e.target.value)}
                />
                <Input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
