import { Clock, Grid, Scissors } from "lucide-react";

export const PAGES = [
  {
    label: "Collage",
    description: "Create a collage",
    route: "/collage",
    icon: Grid,
  },
  {
    label: "Splitter",
    route: "/splitter",
    icon: Scissors,
    description: "Split an image",
  },
  {
    label: "Scheduler",
    route: "#",
    icon: Clock,
    description: "Schedule a post",
    enabled: false,
  },
];

export const CANVAS_SIZE = 2160;
