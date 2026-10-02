"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import GlorysInfo from "@/components/ui/glorys-info";

interface MediaAbout {
  overview: string;
  conclusion: string;
}

interface MediaContent {
  src: string;
  poster?: string;
  background: string;
  title: string;
  date: string;
  scrollToExpand: string;
  about: MediaAbout;
}

interface MediaContentCollection {
  [key: string]: MediaContent;
}

const sampleMediaContent: MediaContentCollection = {
  video: {
    src: "/img_0411.mp4",
    background: "/img_0411.mp4",
    title: "Ocean Embed",
    date: "",
    scrollToExpand: "",
    about: {
      overview:
        "This is a demonstration of the ScrollExpandMedia component with a video. As you scroll, the video expands to fill more of the screen, creating an immersive experience. This component is perfect for showcasing video content in a modern, interactive way.",
      conclusion:
        "The ScrollExpandMedia component provides a unique way to engage users with your content through interactive scrolling. Try switching between video and image modes to see different implementations.",
    },
  },
  image: {
    src: "https://cdn.21st.dev/assets/mirror/ad/adc771c0e00a1084360e689009e485c7990c973d0fe12ffc8fd5b2b8a6029af2.jpg",
    background: "",
    title: "Ocean Embed",
    date: "",
    scrollToExpand: "",
    about: {
      overview:
        "This is a demonstration of the ScrollExpandMedia component with an image. The same smooth expansion effect works beautifully with static images, allowing you to create engaging visual experiences without video content.",
      conclusion:
        "The ScrollExpandMedia component works equally well with images and videos. This flexibility allows you to choose the media type that best suits your content while maintaining the same engaging user experience.",
    },
  },
};



export default function Demo() {
  const [mediaType, setMediaType] = useState("video");
  const currentMedia = sampleMediaContent[mediaType];

  useEffect(() => {
    window.scrollTo(0, 0);

    const resetEvent = new Event("resetSection");
    window.dispatchEvent(resetEvent);
  }, [mediaType]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#050505' }}>

      <ScrollExpandMedia
        mediaType={mediaType as "video" | "image"}
        mediaSrc={currentMedia.src}
        posterSrc={mediaType === "video" ? currentMedia.poster : undefined}
        bgImageSrc={currentMedia.background}
        title={currentMedia.title}
        firstSubtitle="SMART INDIA HACKATHON 2026"
        secondSubtitle="SUBSURFACE INTELLIGENCE"
        date={currentMedia.date}
        scrollToExpand={currentMedia.scrollToExpand}
      >
        <GlorysInfo />
      </ScrollExpandMedia>
    </div>
  );
}
