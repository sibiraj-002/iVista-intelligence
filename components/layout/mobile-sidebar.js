"use client";

import { X } from "lucide-react";

import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export function MobileSidebar({ isOpen, onClose }) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-zinc-950/40 backdrop-blur-sm transition-opacity",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-72 transform bg-black shadow-2xl transition-transform duration-200 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Button
          aria-label="Close sidebar"
          className="absolute right-3 top-3 z-10 text-white hover:bg-white/10 hover:text-white"
          onClick={onClose}
          size="icon"
          variant="ghost"
        >
          <X className="h-5 w-5" />
        </Button>
        <Sidebar onNavigate={onClose} />
      </div>
    </div>
  );
}
