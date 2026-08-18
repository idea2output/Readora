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
  const scriptLoadedRef = useRef(false);

  // Helper to completely erase google translate cookies
  const clearTranslateCookie = () => {
    if (typeof window === "undefined") return;
    const domain = window.location.hostname;
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain}`;
  };

  // 1. Initial sync with explicit user preference in localStorage
  useEffect(() => {
    try {
      const savedAdminLangs = localStorage.getItem("enabled_website_languages");
      if (savedAdminLangs) {
        const parsed = JSON.parse(savedAdminLangs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEnabledCodes(parsed);
        }
      }

      const explicitUserLang = localStorage.getItem("user_selected_language");
      if (explicitUserLang && explicitUserLang !== "en") {
        setSelectedLang(explicitUserLang);
      } else {
        // Enforce English as default and delete leftover auto-translate cookies
        setSelectedLang("en");
        clearTranslateCookie();
      }
    } catch (_) {}
  }, []);

  const visibleLanguages = TOP_10_LANGUAGES.filter(l => enabledCodes.includes(l.code));

  // 2. Load Google Translate script only when user explicitly chose a non-English language
  useEffect(() => {
    const userLang = localStorage.getItem("user_selected_language");
    if (!userLang || userLang === "en") {
      return;
    }

    if (scriptLoadedRef.current || document.getElementById("google-translate-script")) return;
    scriptLoadedRef.current = true;

    const addScript = document.createElement("script");
    addScript.id = "google-translate-script";
    addScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    addScript.async = true;
    document.body.appendChild(addScript);

    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: TOP_10_LANGUAGES.map(l => l.code).join(","),
          autoDisplay: false,
        },
        "google_translate_element"
      );

      document.cookie = `googtrans=/en/${userLang}; path=/;`;
      document.cookie = `googtrans=/en/${userLang}; path=/; domain=${window.location.hostname}`;

      const triggerCombo = () => {
        const selectElem = document.querySelector(".goog-te-combo") as HTMLSelectElement;
        if (selectElem) {
          selectElem.value = userLang;
          selectElem.dispatchEvent(new Event("change"));
        }
      };

      setTimeout(triggerCombo, 300);
      setTimeout(triggerCombo, 800);
      setTimeout(triggerCombo, 1500);
    };
  }, [selectedLang]);

  // 3. Continuously clean up Google Translate banner/iframe styling
  useEffect(() => {
    const removeGoogleBanner = () => {
      const banner = document.querySelector(".goog-te-banner-frame") as HTMLElement;
      if (banner) {
        banner.style.setProperty("display", "none", "important");
        banner.style.setProperty("visibility", "hidden", "important");
        banner.style.setProperty("height", "0px", "important");
      }
      if (document.body.style.top !== "0px") {
        document.body.style.setProperty("top", "0px", "important");
      }
    };

    const interval = setInterval(removeGoogleBanner, 300);
    return () => clearInterval(interval);
  }, []);

  // 4. Close dropdown on click outside
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
    setIsOpen(false);
    
    if (langCode === "en") {
      setSelectedLang("en");
      localStorage.setItem("user_selected_language", "en");
      clearTranslateCookie();

      const selectElem = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (selectElem) {
        selectElem.value = "en";
        selectElem.dispatchEvent(new Event("change"));
      }
      window.location.reload();
      return;
    }

    setSelectedLang(langCode);
    localStorage.setItem("user_selected_language", langCode);

    if (!document.getElementById("google-translate-script")) {
      const addScript = document.createElement("script");
      addScript.id = "google-translate-script";
      addScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      addScript.async = true;
      document.body.appendChild(addScript);

      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: TOP_10_LANGUAGES.map(l => l.code).join(","),
            autoDisplay: false,
          },
          "google_translate_element"
        );

        setTimeout(() => {
          document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`;
          document.cookie = `googtrans=/en/${langCode}; path=/;`;
          const selectElem = document.querySelector(".goog-te-combo") as HTMLSelectElement;
          if (selectElem) {
            selectElem.value = langCode;
            selectElem.dispatchEvent(new Event("change"));
          } else {
            window.location.reload();
          }
        }, 300);
      };
    } else {
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`;
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      const selectElem = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (selectElem) {
        selectElem.value = langCode;
        selectElem.dispatchEvent(new Event("change"));
      } else {
        window.location.reload();
      }
    }
  };

  const currentLang = visibleLanguages.find((l) => l.code === selectedLang) || visibleLanguages[0] || TOP_10_LANGUAGES[0];

  if (visibleLanguages.length === 0) return null;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
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
