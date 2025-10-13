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
