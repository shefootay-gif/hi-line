import React, { useRef, useState } from "react";
import { Link } from "react-router";
import { Play, Volume2, VolumeX, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";

interface VideoAd {
  id: string;
  videoUrl: string;
  productSlug: string;
  productNameEn: string;
  productNameAr: string;
  price: string;
}

const mockVideos: VideoAd[] = [
  {
    id: "v1",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // Mock video
    productSlug: "fresh-ocean-deodorant",
    productNameEn: "Fresh Ocean Deodorant",
    productNameAr: "مزيل عرق فريش أوشن",
    price: "120.00",
  },
  {
    id: "v2",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    productSlug: "oud-majesty-deodorant",
    productNameEn: "Oud Majesty Deodorant",
    productNameAr: "مزيل عرق عود ماجيستي",
    price: "150.00",
  },
];

export default function VideoShopping() {
  const { lang, isRTL } = useLanguage();
  const t = useTranslations(lang);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`py-16 bg-[#fcf8ff] ${isRTL ? "font-[Cairo]" : "font-[Inter]"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-[#4B1C71] mb-8 text-center">
          {lang === "ar" ? "شاهد وتسوق" : "Watch & Shop"}
        </h2>

        <div 
          ref={containerRef}
          className="flex overflow-x-auto gap-4 pb-8 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {mockVideos.map((video) => (
            <VideoCard key={video.id} video={video} lang={lang} t={t} />
          ))}
        </div>
      </div>
    </div>
  );
}

function VideoCard({ video, lang, t }: { video: VideoAd; lang: string; t: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div 
      className="relative flex-none w-[280px] h-[500px] rounded-2xl overflow-hidden snap-center bg-black cursor-pointer group"
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
        loop
        playsInline
        muted={isMuted}
      />
      
      {/* Play/Pause overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {!isPlaying && (
          <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        )}
      </div>

      {/* Mute toggle */}
      <button 
        onClick={toggleMute}
        className="absolute top-4 right-4 p-2 bg-black/40 rounded-full backdrop-blur-sm text-white hover:bg-black/60 transition"
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      {/* Product Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <h3 className="text-white font-semibold text-lg mb-1 drop-shadow-md">
          {lang === "ar" ? video.productNameAr : video.productNameEn}
        </h3>
        <p className="text-white/90 text-sm font-medium mb-4 drop-shadow-md">
          {parseFloat(video.price).toFixed(0)} {t.currency}
        </p>
        <Link
          to={`/shop/${video.productSlug}`}
          onClick={(e) => e.stopPropagation()}
          className="w-full py-3 bg-[#B57EDC] hover:bg-[#9b62c3] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105"
        >
          <ShoppingCart className="w-5 h-5" />
          {lang === "ar" ? "تسوق الآن" : "Shop Now"}
        </Link>
      </div>
    </div>
  );
}
