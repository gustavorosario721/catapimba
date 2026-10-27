import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ColorFilter =
  "none" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";
type Preferences = {
  theme: "system" | "light" | "dark";
  calm: boolean;
  largeText: boolean;
  filter: ColorFilter;
};
const initial: Preferences = {
  theme: "system",
  calm: false,
  largeText: false,
  filter: "none",
};
const storageKey = "catapimba:accessibility:v1";
const Context = createContext<{
  preferences: Preferences;
  theme: "light" | "dark";
  reduceMotion: boolean;
  update: (v: Partial<Preferences>) => void;
  reset: () => void;
} | null>(null);
function read(): Preferences {
  try {
    const v = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    return {
      theme: ["system", "light", "dark"].includes(v.theme) ? v.theme : "system",
      calm: v.calm === true,
      largeText: v.largeText === true,
      filter: [
        "none",
        "protanopia",
        "deuteranopia",
        "tritanopia",
        "achromatopsia",
      ].includes(v.filter)
        ? v.filter
        : "none",
    };
  } catch {
    return initial;
  }
}
export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(read);
  const [dark, setDark] = useState(
    () => matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const [systemReduced, setSystemReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const color = matchMedia("(prefers-color-scheme: dark)"),
      motion = matchMedia("(prefers-reduced-motion: reduce)");
    const onColor = () => setDark(color.matches),
      onMotion = () => setSystemReduced(motion.matches);
    color.addEventListener("change", onColor);
    motion.addEventListener("change", onMotion);
    return () => {
      color.removeEventListener("change", onColor);
      motion.removeEventListener("change", onMotion);
    };
  }, []);
  const theme =
    preferences.theme === "system"
      ? dark
        ? "dark"
        : "light"
      : preferences.theme;
  const reduceMotion = systemReduced || preferences.calm;
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.theme = theme;
    html.classList.toggle("dark", theme === "dark");
    html.dataset.calm = String(preferences.calm);
    html.dataset.largeText = String(preferences.largeText);
    html.dataset.colorFilter = preferences.filter;
    html.dataset.reducedMotion = String(reduceMotion);
    try {
      localStorage.setItem(storageKey, JSON.stringify(preferences));
    } catch {
      /* Preferences remain usable without storage. */
    }
  }, [preferences, theme, reduceMotion]);
  return (
    <Context.Provider
      value={{
        preferences,
        theme,
        reduceMotion,
        update: (v) => setPreferences((p) => ({ ...p, ...v })),
        reset: () => setPreferences(initial),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAccessibility() {
  const value = useContext(Context);
  if (!value) throw new Error("AccessibilityProvider ausente");
  return value;
}
