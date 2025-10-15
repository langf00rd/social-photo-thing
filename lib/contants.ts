import Home from "@/app/page";
import { Grid, Paintbrush, Scissors } from "lucide-react";
import { LayoutPreset } from "./types";

export const PAGES = [
  {
    label: "Home",
    description: "Home",
    route: "/",
    icon: Home,
  },
  {
    label: "Photo Splitter",
    route: "/splitter",
    icon: Scissors,
    description: "Split photo",
  },
  {
    label: "Color Extractor",
    route: "/color-extractor",
    icon: Paintbrush,
    description: "Extract Colors from photo",
  },
  {
    label: "Collage Maker",
    description: "Create collage",
    route: "/collage",
    icon: Grid,
  },
];

/**
 * 1920 = 1080p
 * 2048 = 2k
 * 3840 = 4k
 * 7680 = 8k
 */
export const CANVAS_SIZE = 2160;

export const PRESETS: LayoutPreset[] = [
  {
    id: "single",
    name: "1 photo",
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
  {
    id: "golden-ratio",
    name: "Golden Ratio",
    slots: 2,
    divisions: [
      { x: 0, y: 0, width: 0.618, height: 1 },
      { x: 0.618, y: 0, width: 0.382, height: 1 },
    ],
  },
  // {
  //   id: "magazine-spread",
  //   name: "Magazine Spread",
  //   slots: 3,
  //   divisions: [
  //     { x: 0, y: 0, width: 0.65, height: 0.65 },
  //     { x: 0.65, y: 0, width: 0.35, height: 0.5 },
  //     { x: 0, y: 0.65, width: 1, height: 0.35 },
  //   ],
  // },
  // {
  //   id: "polaroid-stack",
  //   name: "Polaroid Stack",
  //   slots: 4,
  //   divisions: [
  //     { x: 0.05, y: 0.05, width: 0.45, height: 0.45 },
  //     { x: 0.5, y: 0.15, width: 0.45, height: 0.45 },
  //     { x: 0.15, y: 0.5, width: 0.45, height: 0.45 },
  //     { x: 0.55, y: 0.55, width: 0.4, height: 0.4 },
  //   ],
  // },
  {
    id: "film-strip",
    name: "Film Strip",
    slots: 3,
    divisions: [
      { x: 0, y: 0, width: 1, height: 0.33 },
      { x: 0, y: 0.33, width: 1, height: 0.33 },
      { x: 0, y: 0.66, width: 1, height: 0.34 },
    ],
  },
  {
    id: "center-focus",
    name: "Center Focus",
    slots: 5,
    divisions: [
      { x: 0, y: 0, width: 0.33, height: 0.33 },
      { x: 0.67, y: 0, width: 0.33, height: 0.33 },
      { x: 0.33, y: 0.33, width: 0.34, height: 0.34 },
      { x: 0, y: 0.67, width: 0.33, height: 0.33 },
      { x: 0.67, y: 0.67, width: 0.33, height: 0.33 },
    ],
  },
  {
    id: "asym-5",
    name: "Asymmetrical 5",
    slots: 5,
    divisions: [
      { x: 0, y: 0, width: 0.6, height: 0.5 },
      { x: 0.6, y: 0, width: 0.4, height: 0.3 },
      { x: 0.6, y: 0.3, width: 0.4, height: 0.2 },
      { x: 0, y: 0.5, width: 0.3, height: 0.5 },
      { x: 0.3, y: 0.5, width: 0.7, height: 0.5 },
    ],
  },
  {
    id: "centered-5",
    name: "Centered 5",
    slots: 5,
    divisions: [
      { x: 0, y: 0, width: 0.45, height: 0.45 },
      { x: 0.55, y: 0, width: 0.45, height: 0.45 },
      { x: 0, y: 0.55, width: 0.45, height: 0.45 },
      { x: 0.55, y: 0.55, width: 0.45, height: 0.45 },
      { x: 0.275, y: 0.275, width: 0.45, height: 0.45 },
    ],
  },
];
