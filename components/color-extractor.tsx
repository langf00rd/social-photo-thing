"use client";

import { Button } from "@/components/ui/button";
import { ColorSwatch } from "@/lib/types";
import { Check, Copy, Upload } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";

export function ColorExtractor() {
  const [image, setImage] = useState<string | null>(null);
  const [colors, setColors] = useState<ColorSwatch[]>([]);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImage(event.target?.result as string);
        extractColors(img);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const extractColors = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const maxSize = 400;
    const scale = Math.min(maxSize / img.width, maxSize / img.height);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // collect all colors (sample every 2nd pixel for performance)
    const allColors: { r: number; g: number; b: number }[] = [];
    for (let i = 0; i < pixels.length; i += 8) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];

      // skip transparent pixels
      if (a < 128) continue;

      // skip very dark and very light colors (near black/white)
      const brightness = (r + g + b) / 3;
      if (brightness < 20 || brightness > 235) continue;

      allColors.push({ r, g, b });
    }

    if (allColors.length === 0) {
      setColors([]);
      return;
    }

    // k-means clustering to find dominant colors
    const k = 12; // extract more colors initially
    const clusters = kMeansClustering(allColors, k, 10);

    // calculate color frequencies
    const colorCounts = clusters.map((cluster) => ({
      color: cluster.centroid,
      count: cluster.points.length,
    }));

    // sort by frequency
    colorCounts.sort((a, b) => b.count - a.count);

    // filter out similar colors and keep top 8 distinct colors
    const distinctColors: typeof colorCounts = [];
    for (const colorCount of colorCounts) {
      const isSimilar = distinctColors.some((existing) => {
        const distance = colorDistance(colorCount.color, existing.color);
        return distance < 40; // threshold for color similarity
      });

      if (!isSimilar) {
        distinctColors.push(colorCount);
      }

      if (distinctColors.length >= 8) break;
    }

    const totalPixels = distinctColors.reduce((sum, c) => sum + c.count, 0);

    const extractedColors: ColorSwatch[] = distinctColors.map(
      ({ color, count }) => {
        const r = Math.round(color.r);
        const g = Math.round(color.g);
        const b = Math.round(color.b);
        const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
        return {
          hex,
          rgb: { r, g, b },
          percentage: Math.round((count / totalPixels) * 100),
        };
      },
    );

    setColors(extractedColors);
  };

  // k-means clustering algorithm
  const kMeansClustering = (
    colors: { r: number; g: number; b: number }[],
    k: number,
    maxIterations: number,
  ) => {
    // initialize centroids randomly
    const centroids: { r: number; g: number; b: number }[] = [];
    const step = Math.floor(colors.length / k);
    for (let i = 0; i < k; i++) {
      centroids.push({ ...colors[i * step] });
    }

    let iterations = 0;
    let changed = true;

    while (changed && iterations < maxIterations) {
      // assign points to nearest centroid
      const clusters: {
        centroid: { r: number; g: number; b: number };
        points: typeof colors;
      }[] = centroids.map((centroid) => ({
        centroid,
        points: [],
      }));

      for (const color of colors) {
        let minDistance = Number.POSITIVE_INFINITY;
        let closestCluster = 0;

        for (let i = 0; i < centroids.length; i++) {
          const distance = colorDistance(color, centroids[i]);
          if (distance < minDistance) {
            minDistance = distance;
            closestCluster = i;
          }
        }

        clusters[closestCluster].points.push(color);
      }

      // update centroids
      changed = false;
      for (let i = 0; i < clusters.length; i++) {
        if (clusters[i].points.length === 0) continue;

        const newCentroid = {
          r:
            clusters[i].points.reduce((sum, c) => sum + c.r, 0) /
            clusters[i].points.length,
          g:
            clusters[i].points.reduce((sum, c) => sum + c.g, 0) /
            clusters[i].points.length,
          b:
            clusters[i].points.reduce((sum, c) => sum + c.b, 0) /
            clusters[i].points.length,
        };

        if (colorDistance(newCentroid, centroids[i]) > 1) {
          changed = true;
          centroids[i] = newCentroid;
          clusters[i].centroid = newCentroid;
        }
      }

      iterations++;
    }

    return centroids.map((centroid, i) => ({
      centroid,
      points: colors.filter((color) => {
        let minDistance = Number.POSITIVE_INFINITY;
        let closestCluster = 0;
        for (let j = 0; j < centroids.length; j++) {
          const distance = colorDistance(color, centroids[j]);
          if (distance < minDistance) {
            minDistance = distance;
            closestCluster = j;
          }
        }
        return closestCluster === i;
      }),
    }));
  };

  // calculate euclidean distance between two colors
  const colorDistance = (
    c1: { r: number; g: number; b: number },
    c2: { r: number; g: number; b: number },
  ) => {
    return Math.sqrt(
      Math.pow(c1.r - c2.r, 2) +
        Math.pow(c1.g - c2.g, 2) +
        Math.pow(c1.b - c2.b, 2),
    );
  };

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        {!image ? (
          <div className="w-screen h-screen flex items-center justify-center">
            <Button onClick={() => fileInputRef.current?.click()}>
              Choose photo
            </Button>
          </div>
        ) : (
          <div className="w-full h-screen border flex-row-reverse flex gap-6">
            <div className="flex-2">
              <img
                src={image || "/placeholder.svg"}
                className="w-full h-full object-cover"
                alt="..."
              />
            </div>
            {colors.length > 0 && (
              <div className="flex-1 flex-col gap-8 p-8 flex justify-center">
                {image && (
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-fit"
                  >
                    <Upload />
                    Change photo
                  </Button>
                )}
                <div className="grid md:grid-cols-4 gap-10">
                  {colors.map((color, index) => (
                    <div key={index} className="space-y-2">
                      <div
                        className="aspect-square"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => copyToClipboard(color.hex)}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                            {color.hex}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(color.hex)}
                          >
                            {copiedColor === color.hex ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {color.percentage}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}
