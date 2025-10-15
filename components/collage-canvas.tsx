"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CANVAS_SIZE, PRESETS } from "@/lib/contants";
import { ImageSlot, LayoutPreset } from "@/lib/types";
import { Download, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { ActionFAB } from "./fab";
import { Slider } from "./ui/slider";

export function CollageCanvas() {
  const [images, setImages] = useState<ImageSlot[]>([]);
  const [gapSize, setGapSize] = useState(20);
  const [padding, setPadding] = useState(10);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<LayoutPreset>(
    PRESETS[0],
  );

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
        // clicked inside this slot
        setSelectedSlot(i);
        clickedInside = true;
        break;
      }
    }

    // if click was outside all slots — remove highlight
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
    <div className="px-44">
      <ActionFAB>
        <Button onClick={handleExport}>
          <Download />
          Export
        </Button>
      </ActionFAB>
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
        <div className="flex-1 p-14 border-r space-y-10">
          <div className="space-y-2">
            <Label>Layout</Label>
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
            <Label>Photos</Label>
            <div className="gap-2 grid grid-cols-3">
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
                        className="flex items-center text-destructive gap-1"
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
            <Label>Customize</Label>
            <div className="space-y-1">
              <p className="font-medium text-neutral-500 text-sm">Gap</p>
              <Slider
                min={0}
                max={100}
                step={10}
                defaultValue={[gapSize]}
                onValueChange={(a) => setGapSize(Number(a))}
                className="w-full"
              />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-neutral-500 text-sm">Padding</p>
              <Slider
                min={0}
                max={50} // <= smaller range so padding never kills the grid
                step={5}
                value={[padding]}
                onValueChange={(value) => setPadding(value[0])}
                className="w-full"
              />

              {/*<Slider
                min={0}
                max={100}
                step={10}
                defaultValue={[padding]}
                onValueChange={setPadding}
                className="w-full"
              />*/}
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
