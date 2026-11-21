"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageIcon } from "@/components/icons";

type ProductImage = {
  id: string;
  url: string;
  isPrimary: boolean;
};

export default function ProductGallery({
  title,
  images,
}: {
  title: string;
  images: ProductImage[];
}) {
  const [selectedId, setSelectedId] = useState(
    images.find((image) => image.isPrimary)?.id ?? images[0]?.id ?? null,
  );
  const currentIndex = images.findIndex((image) => image.id === selectedId);
  const currentImage = images[currentIndex];

  return (
    <div className="min-w-0">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[28px] border border-line bg-surface p-5 sm:rounded-[32px] sm:p-8">
        {currentImage ? (
          <Image
            alt={images.length > 1 ? `${title}, foto ${currentIndex + 1} dari ${images.length}` : title}
            className="h-full w-full object-contain"
            height={900}
            priority
            sizes="(max-width: 1024px) 100vw, 52vw"
            src={currentImage.url}
            unoptimized
            width={900}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl bg-canvas text-muted">
            <ImageIcon className="h-12 w-12" />
            <span className="mt-3 text-sm font-medium">Foto belum tersedia</span>
          </div>
        )}
        {images.length > 1 && (
          <span
            aria-hidden="true"
            className="absolute bottom-4 right-4 rounded-full bg-ink/80 px-3 py-1.5 text-xs font-semibold tabular-nums text-white"
          >
            {currentIndex + 1} / {images.length}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <ul aria-label="Pilih foto produk" className="mt-4 flex flex-wrap gap-3">
          {images.map((image, index) => (
            <li key={image.id}>
              <button
                aria-label={`Tampilkan foto ${index + 1}`}
                aria-pressed={image.id === selectedId}
                className={`relative h-20 w-20 overflow-hidden rounded-xl border bg-surface p-1.5 transition-colors sm:h-24 sm:w-24 ${
                  image.id === selectedId
                    ? "border-brand ring-2 ring-brand/20"
                    : "border-line hover:border-line-strong"
                }`}
                onClick={() => setSelectedId(image.id)}
                type="button"
              >
                <Image
                  alt=""
                  className="h-full w-full object-contain"
                  height={96}
                  sizes="96px"
                  src={image.url}
                  unoptimized
                  width={96}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
