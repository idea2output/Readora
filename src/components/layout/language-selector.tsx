"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const TOP_10_LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "zh-CN", name: "中文 (Chinese)", flag: "🇨🇳" },
  { code: "ar", name: "العربية (Arabic)", flag: "🇸🇦" },
  { code: "hi", name: "हिन्दी (Hindi)", flag: "🇮🇳" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "ru", name: "Русский (Russian)", flag: "🇷🇺" },
  { code: "ja", name: "日本語 (Japanese)", flag: "🇯🇵" },
];

export function LanguageSelector() {
  const [selectedLang, setSelectedLang] = useState("en");

  // Load Google Translate script dynamically
  useEffect(() => {
    if (document.getElementById("google-translate-script")) return;

    const addScript = document.createElement("script");
    addScript.id = "google-translate-script";
    addScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    addScript.async = true;
    document.body.appendChild(addScript);

    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,es,fr,de,zh-CN,ar,hi,pt,ru,ja",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };
  }, []);

  const changeLanguage = (langCode: string) => {
    setSelectedLang(langCode);
    
    // Trigger Google Translate select change via cookie / iframe
    const selectElem = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (selectElem) {
      selectElem.value = langCode;
      selectElem.dispatchEvent(new Event("change"));
    } else {
      // Fallback via google translate cookie
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`;
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      window.location.reload();
    }
  };

  const currentLang = TOP_10_LANGUAGES.find((l) => l.code === selectedLang) || TOP_10_LANGUAGES[0];

  return (
    <div className="relative inline-block">
      {/* Hidden Google Translate element mount target */}
      <div id="google_translate_element" className="hidden opacity-0 pointer-events-none w-0 h-0 overflow-hidden" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 gap-1.5 px-2.5 font-semibold text-xs rounded-full border border-border/40 hover:bg-muted">
            <Globe className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">{currentLang.flag} {currentLang.name.split(" ")[0]}</span>
            <span className="sm:hidden">{currentLang.flag}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 rounded-2xl p-1.5 shadow-xl border">
          <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b mb-1">
            Translate Page (Top 10)
          </div>
          {TOP_10_LANGUAGES.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`rounded-xl text-xs font-semibold px-2.5 py-1.5 cursor-pointer flex items-center justify-between ${
                selectedLang === lang.code ? "bg-primary/10 text-primary font-bold" : ""
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
