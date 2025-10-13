import { Grid, Scissors } from "lucide-react";

export const PAGES = [
  {
    label: "Home",
    description: "Home",
    route: "/",
    icon: Grid,
  },
  {
    label: "Splitter",
    route: "/splitter",
    icon: Scissors,
    description: "Split photo",
  },
  {
    label: "Collage",
    description: "Create collage",
    route: "/collage",
    icon: Grid,
  },
];

export const CANVAS_SIZE = 2160;
