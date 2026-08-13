"use client";

import { useState, useEffect, useRef } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export const TOP_10_LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "zh-CN", name: "中文", flag: "🇨🇳" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
];

export function LanguageSelector() {
  const [selectedLang, setSelectedLang] = useState("en");
  const [enabledCodes, setEnabledCodes] = useState<string[]>(TOP_10_LANGUAGES.map(l => l.code));
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load enabled languages from Admin settings / localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("enabled_website_languages");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEnabledCodes(parsed);
        }
      }
    } catch (_) {}
  }, []);

  // Filter languages to only display admin-enabled languages
  const visibleLanguages = TOP_10_LANGUAGES.filter(l => enabledCodes.includes(l.code));

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
          includedLanguages: visibleLanguages.map(l => l.code).join(","),
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };
  }, [visibleLanguages]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (langCode: string) => {
    setSelectedLang(langCode);
    setIsOpen(false);
    
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

  const currentLang = visibleLanguages.find((l) => l.code === selectedLang) || visibleLanguages[0] || TOP_10_LANGUAGES[0];

  if (visibleLanguages.length === 0) return null;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Hidden Google Translate element mount target */}
      <div id="google_translate_element" className="hidden opacity-0 pointer-events-none w-0 h-0 overflow-hidden" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 gap-1.5 px-2.5 font-semibold text-xs rounded-full border border-border/60 hover:bg-muted transition-all"
      >
        <Globe className="w-4 h-4 text-primary" />
        <span className="hidden sm:inline">{currentLang.flag} {currentLang.name}</span>
        <span className="sm:hidden">{currentLang.flag}</span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl p-1.5 bg-popover text-popover-foreground border shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b mb-1">
            Website Languages
          </div>
          <div className="max-h-64 overflow-y-auto space-y-0.5">
            {visibleLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full rounded-xl text-xs font-semibold px-3 py-2 text-left transition-colors flex items-center justify-between hover:bg-accent hover:text-accent-foreground ${
                  selectedLang === lang.code ? "bg-primary/10 text-primary font-bold" : ""
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
