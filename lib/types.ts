export type LayoutPreset = {
  id: string;
  name: string;
  slots: number;
  divisions: { x: number; y: number; width: number; height: number }[];
};

export type ImageSlot = {
  file: File | null;
  img: HTMLImageElement | null;
  scale: number;
  offsetX: number;
  offsetY: number;
};

export interface ColorSwatch {
  hex: string;
  rgb: { r: number; g: number; b: number };
  percentage: number;
}


export interface CaptionTextElement {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  fontUrl: string
  fontFamily: string
  color: string
}
