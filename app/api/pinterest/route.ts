import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Extract username and board name from the Pinterest URL
    const urlMatch = url.match(/pinterest\.com\/([^/]+)\/([^/]+)/);
    if (!urlMatch) {
      return NextResponse.json(
        { error: "Invalid Pinterest board URL format" },
        { status: 400 },
      );
    }

    const [, username, boardName] = urlMatch;
    const boardUrl = `https://www.pinterest.com/${username}/${boardName}/`;

    const response = await fetch(boardUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            "Failed to fetch Pinterest board. Make sure the URL is correct and public.",
        },
        { status: 400 },
      );
    }

    const html = await response.text();

    const images: Array<{ url: string; title?: string }> = [];
    const seenUrls = new Set<string>();

    // Match multiple image file types
    const imgRegex = /https:\/\/i\.pinimg\.com\/[^"]+\.(?:jpg|jpeg|png|webp)/g;
    const matches = html.match(imgRegex) || [];

    for (const match of matches) {
      let imgUrl = match;

      // Filter out low-value assets
      if (
        imgUrl.includes("tracking") ||
        imgUrl.includes("badge") ||
        seenUrls.has(imgUrl)
      )
        continue;

      seenUrls.add(imgUrl);

      // Rewrite to higher resolution (736x is the largest public variant)
      const highResUrl = imgUrl.replace(/\/\d+x\//, "/736x/");

      // Optionally verify the URL exists
      try {
        const head = await fetch(highResUrl, { method: "HEAD" });
        if (head.ok) {
          images.push({ url: highResUrl, title: "Pinterest Image" });
        } else {
          // fallback to original URL if 736x doesn't exist
          images.push({ url: imgUrl, title: "Pinterest Image" });
        }
      } catch {
        images.push({ url: imgUrl, title: "Pinterest Image" });
      }
    }

    if (images.length === 0) {
      return NextResponse.json(
        {
          error:
            "No images found. Try a different board or check if it's public.",
        },
        { status: 400 },
      );
    }

    // Limit to 50 images max for safety
    return NextResponse.json({ images: images.slice(0, 50) });
  } catch (error) {
    console.error("[Pinterest scrape error]:", error);
    return NextResponse.json(
      { error: "Failed to scrape Pinterest board. Please try again." },
      { status: 500 },
    );
  }
}
