import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeKey } from "@/types";
import { applyTheme } from "@/styles/themes";

function getDefaultTheme(): ThemeKey {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "midnight";
  }
  return "arctic";
}

export type FontFamily =
  | "system"
  | "quicksand"
  | "pacifico"
  | "caveat"
  | "amatic"
  | "orbitron"
  | "spacemono"
  | "syne"
  | "fraunces"
  | "bebas";

interface UIState {
  theme: ThemeKey;
  notificationsEnabled: boolean;
  fontFamily: FontFamily;
  setTheme: (key: ThemeKey) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setFontFamily: (family: FontFamily) => void;
}

const fontFamilyMap: Record<FontFamily, string> = {
  system:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  quicksand: "'Quicksand', sans-serif",
  pacifico: "'Pacifico', cursive",
  caveat: "'Caveat', cursive",
  amatic: "'Amatic SC', cursive",
  orbitron: "'Orbitron', sans-serif",
  spacemono: "'Space Mono', monospace",
  syne: "'Syne', sans-serif",
  fraunces: "'Fraunces', serif",
  bebas: "'Bebas Neue', sans-serif",
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: getDefaultTheme(),
      notificationsEnabled: true,
      fontFamily: "system",
      setTheme(key) {
        applyTheme(key);
        set({ theme: key });
      },
      setNotificationsEnabled(enabled) {
        set({ notificationsEnabled: enabled });
      },
      setFontFamily(family) {
        document.documentElement.style.setProperty(
          "--font-family",
          fontFamilyMap[family],
        );
        set({ fontFamily: family });
      },
    }),
    {
      name: "echo-ui",
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
          if (state.fontFamily) {
            document.documentElement.style.setProperty(
              "--font-family",
              fontFamilyMap[state.fontFamily],
            );
          }
        }
      },
    },
  ),
);
