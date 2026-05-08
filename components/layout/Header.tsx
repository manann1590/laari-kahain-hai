"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPinned } from "lucide-react";

export function Header() {
  return (
    <>
      <div className="h-1 ticket-edge" aria-hidden="true" />

      <header className="sticky top-1 z-30 border-b border-civic-line bg-white/95 shadow-card backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl min-w-0 items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <Link href="/map" className="flex min-w-0 shrink-0 items-center gap-2.5">
            <span className="flex h-11 w-36 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-civic-line bg-white px-2 shadow-card sm:w-44">
              <Image
                src="/brand/foodradar-logo.png"
                alt="FoodRadar"
                width={900}
                height={238}
                className="h-full w-full object-contain"
              />
            </span>
            <span className="hidden min-w-0 leading-none xl:block">
              <span className="block truncate text-sm font-black">
                <span className="text-civic-orange">Food</span>
                <span className="text-civic-text">Radar</span>
              </span>
              <span className="hidden text-[10px] font-semibold text-civic-muted sm:block">
                Find Food. Live Now.
              </span>
            </span>
          </Link>

          <div className="hidden min-w-0 items-center gap-2 rounded-lg border border-civic-line bg-civic-bg px-3 py-2 text-sm font-bold text-civic-text sm:flex">
            <MapPinned className="h-4 w-4 shrink-0 text-civic-orange" aria-hidden="true" />
            <span className="truncate">Ahmedabad live food map</span>
          </div>
        </div>
      </header>
    </>
  );
}
