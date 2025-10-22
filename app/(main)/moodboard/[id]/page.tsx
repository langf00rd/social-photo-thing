"use client";

import { Button } from "@/components/ui/button";
import { STORAGE_KEYS } from "@/lib/contants";
import { Moodboard } from "@/lib/types";
import { Plus, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function MoodboardPage() {
  const params = useParams();
  const [board, setBoard] = useState<Moodboard | null>(null);

  function handleRemoveImage(src: string, index: number) {
    setBoard((prevBoard) => {
      if (!prevBoard) return null;
      const images = [...prevBoard.images];
      if (images[index] === src) images.splice(index, 1);
      return {
        ...prevBoard,
        images,
      };
    });
  }

  function handleSaveChanges() {
    const storedBoards = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.moodboard) || "[]",
    );
    const newBoards = storedBoards.map((b: any) =>
      b.id === params.id ? board : b,
    );
    localStorage.setItem(STORAGE_KEYS.moodboard, JSON.stringify(newBoards));
    alert("saved");
  }

  function handleDeleteBoard() {
    const storedBoards = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.moodboard) || "[]",
    );
    const newBoards = storedBoards.filter((b: any) => b.id !== params.id);
    localStorage.setItem(STORAGE_KEYS.moodboard, JSON.stringify(newBoards));
    window.location.href = "/moodboard";
  }

  useEffect(() => {
    const storedBoards = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.moodboard) || "[]",
    );
    setBoard(storedBoards.find((board: Moodboard) => board.id === params.id));
  }, []);

  return (
    <div className="p-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl capitalize">
          <Link href={`/moodboard`} className="text-neutral-300">
            My Moodboards /{" "}
          </Link>
          {board?.name || "See Moodboard"}
        </h1>
        <div className="flex gap-2">
          <Button onClick={handleSaveChanges}>
            <Plus />
            Save changes
          </Button>
          <Button variant="destructive" onClick={handleDeleteBoard}>
            Delete
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {board?.images.map((image, index) => (
          <div className="relative group">
            <Button
              size="icon"
              variant="destructive"
              className="absolute size-4 top-2 right-2 group-hover:block hidden"
              onClick={() => handleRemoveImage(image, index)}
            >
              <XIcon />
            </Button>
            <Image
              key={index}
              src={image}
              alt={image}
              className="border h-full w-full object-contain"
              width={500}
              height={500}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
