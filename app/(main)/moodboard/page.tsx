"use client";

import CardStack from "@/components/card-stack";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { STORAGE_KEYS } from "@/lib/contants";
import { Moodboard } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { DownloadIcon, Loader2, Plus, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MoodboardPage() {
  const [boards, setBoards] = useState<Moodboard[]>([]);

  useEffect(() => {
    const storedBoards = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.moodboard) || "[]",
    );
    setBoards(storedBoards);
  }, []);

  return (
    <div className="p-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">My Moodboards</h1>
        <div className="flex gap-4">
          <ImportFromPinterestDialog />
          <CreateMoodboardDialog />
        </div>
      </div>
      {boards.length === 0 && (
        <p className="text-center py-32 text-neutral-400">No boards found.</p>
      )}
      <div className="grid gap-10 grid-cols-4">
        {boards.map((board, index) => (
          <Link key={index} href={`/moodboard/${board.id}`}>
            <CardStack title={board.name} images={board.images} />
          </Link>
        ))}
      </div>
    </div>
  );
}

function CreateMoodboardDialog() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>
          <Plus />
          New board
        </Button>
      </DialogTrigger>
      <DialogContent className="space-y-4">
        <DialogTitle>Create a moodboard</DialogTitle>
        <form className="space-y-8">
          <fieldset className="space-y-2">
            <Label>Name</Label>
            <Input placeholder="Adwoa's Photoshoot" />
          </fieldset>
          <fieldset className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="" />
          </fieldset>
          <DialogFooter>
            <Button variant="ghost">Cancel</Button>
            <Button>
              <Plus />
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ImportFromPinterestDialog() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [images, setImages] = useState<{ title: string; url: string }[]>([]);

  async function handleImportFromPinterest() {
    try {
      setIsFetching(true);
      const response = await fetch("/api/pinterest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url }),
      });
      if (!response.ok) {
        alert("Failed to import from Pinterest");
        setIsFetching(false);
        return;
      }
      const data = await response.json();
      setImages(data.images);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  }

  function handleRemoveImage(url: string) {
    setImages((prevImages) => prevImages.filter((image) => image.url !== url));
  }

  function handleCreateBoard() {
    // push to existing moodboard with new images and names
    localStorage.setItem(
      STORAGE_KEYS.moodboard,
      JSON.stringify([
        ...JSON.parse(localStorage.getItem(STORAGE_KEYS.moodboard) || "[]"),
        {
          name,
          images: images.map((image) => image.url),
          created_at: new Date().toISOString(),
          id: generateId(),
        },
      ]),
    );
    window.location.reload();
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="outline">
          <Plus />
          Import from Pinterest
        </Button>
      </DialogTrigger>
      <DialogContent className="space-y-4">
        <DialogTitle>Import moodboard from Pinterest</DialogTitle>
        <fieldset className="space-y-2">
          <Label>Name</Label>
          <Input
            placeholder="Adwoa's Photoshoot"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </fieldset>
        <fieldset className="space-y-2">
          <Label>Board URL</Label>
          <Input
            placeholder="https://www.pinterest.com/jack/demo/"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </fieldset>
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 max-h-[500px] overflow-scroll">
            {images.map((image) => (
              <div className="relative">
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute size-4 top-2 right-2"
                  onClick={() => handleRemoveImage(image.url)}
                >
                  <XIcon />
                </Button>
                <Image
                  key={image.url}
                  className="border h-full w-full object-contain"
                  src={image.url}
                  alt={"..."}
                  width={100}
                  height={100}
                />
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button
            disabled={isFetching}
            variant={images.length > 0 ? "ghost" : "default"}
            onClick={handleImportFromPinterest}
          >
            {isFetching ? (
              <Loader2 className="animate-spin" />
            ) : (
              <DownloadIcon />
            )}
            Import
          </Button>
          {images.length > 0 && !isFetching && (
            <Button onClick={handleCreateBoard}>Create</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
