const GOOGLE_FONT_MAPPING: Record<string, { family: string; url: string }> = {
  ur: {
    family: "Noto Nastaliq Urdu",
    url: "https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap",
  },
  ar: {
    family: "Cairo",
    url: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap",
  },
  hi: {
    family: "Noto Sans Devanagari",
    url: "https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&display=swap",
  },
  bn: {
    family: "Noto Sans Bengali",
    url: "https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;700&display=swap",
  },
  fa: {
    family: "Vazirmatn",
    url: "https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&display=swap",
  },
  zh: {
    family: "Noto Sans SC",
    url: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap",
  },
  ja: {
    family: "Noto Sans JP",
    url: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap",
  },
  ko: {
    family: "Noto Sans KR",
    url: "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap",
  },
  ru: {
    family: "Noto Sans",
    url: "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap",
  },
};

const loadedLanguages = new Set<string>();

export function ensureLanguageFontLoaded(langCode: string) {
  if (typeof window === "undefined" || !langCode) return;
  const code = langCode.toLowerCase().split("-")[0];

  if (loadedLanguages.has(code)) return;
  loadedLanguages.add(code);

  const fontConfig = GOOGLE_FONT_MAPPING[code];
  if (fontConfig) {
    const elementId = `auto-font-${code}`;
    if (!document.getElementById(elementId)) {
      const link = document.createElement("link");
      link.id = elementId;
      link.rel = "stylesheet";
      link.href = fontConfig.url;
      document.head.appendChild(link);
    }
  }
}
