"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CaptionTextElement } from "@/lib/types";
import { Download, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ActionFAB } from "./fab";
import { Slider } from "./ui/slider";
import { Textarea } from "./ui/textarea";

export function Caption() {
  const [image, setImage] = useState<string | null>(null);
  const [textElements, setTextElements] = useState<CaptionTextElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newText, setNewText] = useState("");
  const [fontSize, setFontSize] = useState(100);
  const [fontUrl, setFontUrl] = useState("");
  const [fontFamily, setFontFamily] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const loadedFonts = useRef<Set<string>>(new Set());
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  /* ---- load font ---- */
  const loadGoogleFont = async (url: string) => {
    if (loadedFonts.current.has(url)) return;
    try {
      const link = document.createElement("link");
      link.href = url;
      link.rel = "stylesheet";
      document.head.appendChild(link);
      loadedFonts.current.add(url);
    } catch (error) {
      console.error("Failed to load font:", error);
    }
  };

  const selectTextElement = (id: string) => {
    setSelectedId(id);
    const element = textElements.find((el) => el.id === id);
    if (element) {
      setNewText(element.text);
      setFontSize(element.fontSize);
      setFontFamily(element.fontFamily);
      setFontUrl(element.fontUrl);
      setTextColor(element.color);
    }
  };

  /* ---- sync changes ---- */
  useEffect(() => {
    if (!selectedId) return;
    const updateSelectedElement = async () => {
      if (fontUrl && !loadedFonts.current.has(fontUrl)) {
        await loadGoogleFont(fontUrl);
      }
      updateTextElement(selectedId, {
        fontSize,
        fontUrl,
        fontFamily,
        color: textColor,
      });
    };
    updateSelectedElement();
  }, [fontSize, fontUrl, fontFamily, textColor, selectedId]);

  useEffect(() => {
    if (!selectedId || !newText.trim()) return;
    updateTextElement(selectedId, { text: newText });
  }, [newText, selectedId]);

  const handleAddOrUpdateText = async () => {
    if (!newText.trim()) return;
    if (fontUrl) await loadGoogleFont(fontUrl);
    if (!selectedId) {
      const id = Date.now().toString();
      const newElement: CaptionTextElement = {
        id,
        text: newText,
        x: 50,
        y: 50,
        fontSize,
        fontUrl,
        fontFamily,
        color: textColor,
      };
      setTextElements([...textElements, newElement]);
      setNewText("");
      setFontUrl("");
      setFontFamily("Arial");
      setTextColor("#000000");
      setFontSize(48);
    }
  };

  const updateTextElement = (
    id: string,
    updates: Partial<CaptionTextElement>,
  ) => {
    setTextElements(
      textElements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    );
  };

  const deleteTextElement = (id: string) => {
    setTextElements(textElements.filter((el) => el.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setNewText("");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setImage(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const drawTextElements = (
    ctx: CanvasRenderingContext2D,
    elements: CaptionTextElement[],
    selectedId: string | null,
    canvasWidth: number,
  ) => {
    elements.forEach((element) => {
      const fontStyle = `${element.fontSize}px "${element.fontFamily}"`;
      ctx.font = fontStyle;
      ctx.fillStyle = element.color;
      ctx.textBaseline = "top";

      const maxWidth = canvasWidth - 40;
      const words = element.text.split(" ");
      let line = "";
      let lineY = element.y;
      const lines: string[] = [];

      for (const word of words) {
        const testLine = line + (line ? " " : "") + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) lines.push(line);

      lines.forEach((l, i) =>
        ctx.fillText(l, element.x, element.y + i * (element.fontSize + 10)),
      );

      if (element.id === selectedId) {
        const lineHeights = lines.length * (element.fontSize + 10);
        const maxLineWidth = Math.max(
          ...lines.map((l) => ctx.measureText(l).width),
        );

        ctx.strokeStyle = "#00d4ff";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          element.x - 5,
          element.y - 5,
          maxLineWidth + 10,
          lineHeights + 5,
        );
      }
    });
  };

  /* ---- render canvas ---- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const { width, height } = img;
      setImageDimensions({ width, height });

      canvas.width = width;
      canvas.height = height;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      drawTextElements(ctx, textElements, selectedId, width);
    };
    img.src = image;
  }, [image, textElements, selectedId]);

  /* ---- handle dragging ---- */
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;

    let clicked = false;
    for (const element of textElements) {
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.font = `${element.fontSize}px "${element.fontFamily}"`;
      const textWidth = ctx.measureText(element.text).width;
      const textHeight = element.fontSize + 10;

      if (
        canvasX >= element.x - 5 &&
        canvasX <= element.x + textWidth + 5 &&
        canvasY >= element.y - 5 &&
        canvasY <= element.y + textHeight + 5
      ) {
        selectTextElement(element.id);
        setDraggingId(element.id);
        setDragOffset({
          x: canvasX - element.x,
          y: canvasY - element.y,
        });
        clicked = true;
        break;
      }
    }

    if (!clicked) {
      setSelectedId(null);
      setNewText("");
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;

    updateTextElement(draggingId, {
      x: Math.max(0, canvasX - dragOffset.x),
      y: Math.max(0, canvasY - dragOffset.y),
    });
  };

  const handleCanvasMouseUp = () => setDraggingId(null);

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || !image) return;

    const prevSelected = selectedId;
    setSelectedId(null);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = imageDimensions.width;
      canvas.height = imageDimensions.height;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawTextElements(ctx, textElements, null, canvas.width);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `CAPTION-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        setSelectedId(prevSelected);
      }, "image/png");
    };
    img.src = image;
  };

  if (!image)
    return (
      <div className="flex items-center justify-center h-screen">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <Button onClick={() => fileInputRef.current?.click()}>
          Choose photo
        </Button>
      </div>
    );

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <ActionFAB>
        <div className="flex gap-2">
          <Button onClick={handleExport} disabled={!image}>
            <Download />
            Export
          </Button>
          {image && (
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
            >
              Change photo
            </Button>
          )}
        </div>
      </ActionFAB>

      {!image && (
        <div className="flex items-center justify-center h-screen">
          <Button onClick={() => fileInputRef.current?.click()}>
            Change photo
          </Button>
        </div>
      )}

      <div className="flex flex-row-reverse h-screen">
        <div className="flex-1 space-y-6">
          <div className="h-[10px] p-8 pb-0">
            {newText && (
              <Button size="sm" onClick={handleAddOrUpdateText}>
                <Plus />
                Add Text
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="p-8">
              <div className="space-y-8">
                <div className="space-y-2">
                  <Textarea
                    ref={textInputRef}
                    id="text-input"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Enter text..."
                    autoFocus
                  />
                </div>

                <div
                  className={`space-y-8 transition-opacity ${!newText ? "opacity-30 pointer-events-none" : ""}`}
                >
                  <div className="space-y-2">
                    <Label htmlFor="font-size">Font Size</Label>
                    <Slider
                      id="font-size"
                      min={12}
                      max={300}
                      defaultValue={[fontSize]}
                      onValueChange={(a) => setFontSize(Number(a))}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-family">Font Family</Label>
                    <Input
                      id="font-family"
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      placeholder="e.g., Arial, Georgia, Playfair Display"
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-url">Google Font URL (optional)</Label>
                    <Input
                      id="font-url"
                      value={fontUrl}
                      onChange={(e) => setFontUrl(e.target.value)}
                      placeholder="https://fonts.googleapis.com/css2?family=..."
                      className="text-sm"
                    />
                    <p className="text-xs text-neutral-400 mt-1">
                      Paste the full{" "}
                      <Link
                        href="https://fonts.google.com/"
                        className="underline"
                        target="_blank"
                      >
                        Google Fonts
                      </Link>{" "}
                      URL. Font family name must match the font name.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text-color">Text Color</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="text-color"
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <Input
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="text-sm flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {textElements.length > 0 && (
              <div className="space-y-2 p-8 border-t">
                <h3 className="font-medium">Stack</h3>
                <div className="space-y-2 overflow-y-auto">
                  {textElements.map((element) => (
                    <div
                      key={element.id}
                      onClick={() => selectTextElement(element.id)}
                      className={`px-2 cursor-pointer text-sm truncate transition-colors ${
                        selectedId === element.id
                          ? "bg-accent/10 border-2 border-accent/10"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate flex-1">{element.text}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTextElement(element.id);
                          }}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex-[3] flex items-center border-r justify-center">
          <canvas
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "100vh",
              objectFit: "contain",
            }}
          />
        </div>
      </div>
    </>
  );
}
