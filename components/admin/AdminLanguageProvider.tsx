"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ADMIN_LANGUAGES, AdminLanguage, isAdminLanguage, translateAdminText } from "@/lib/admin-i18n";

type AdminLanguageContextType = {
  language: AdminLanguage;
  setLanguage: (language: AdminLanguage) => void;
  t: (text: string) => string;
};

const AdminLanguageContext = createContext<AdminLanguageContextType | undefined>(undefined);

export function AdminLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AdminLanguage>("en");

  useEffect(() => {
    const saved = localStorage.getItem("adminLanguage");
    if (isAdminLanguage(saved)) {
      setLanguageState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.body.classList.toggle("regional-lang", language !== "en");
  }, [language]);

  const setLanguage = (nextLanguage: AdminLanguage) => {
    setLanguageState(nextLanguage);
    localStorage.setItem("adminLanguage", nextLanguage);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (text: string) => translateAdminText(text, language),
    }),
    [language]
  );

  return (
    <AdminLanguageContext.Provider value={value}>
      {children}
      <AdminAutoTranslate />
    </AdminLanguageContext.Provider>
  );
}

export function useAdminLanguage() {
  const context = useContext(AdminLanguageContext);
  if (!context) {
    throw new Error("useAdminLanguage must be used within AdminLanguageProvider");
  }
  return context;
}

const textNodeOriginals = new WeakMap<Text, string>();

function AdminAutoTranslate() {
  const { language } = useAdminLanguage();

  useEffect(() => {
    const root = document.querySelector("[data-admin-translate-root]");
    if (!root) return;

    let translating = false;
    let raf = 0;

    const translateTextNode = (node: Text) => {
      const parent = node.parentElement;
      if (!parent) return;
      if (parent.closest("[data-admin-no-translate]")) return;
      if (["SCRIPT", "STYLE", "CODE", "PRE", "TEXTAREA"].includes(parent.tagName)) return;

      const current = node.nodeValue ?? "";
      const original = textNodeOriginals.get(node);

      if (!original) {
        textNodeOriginals.set(node, current);
      } else {
        const knownVersions = ADMIN_LANGUAGES.map((candidate) => translateAdminText(original, candidate.code));
        if (!knownVersions.includes(current)) {
          textNodeOriginals.set(node, current);
        }
      }

      const next = translateAdminText(textNodeOriginals.get(node) ?? "", language);
      if (node.nodeValue !== next) {
        node.nodeValue = next;
      }
    };

    const translateAttributes = (element: Element) => {
      if (element.closest("[data-admin-no-translate]")) return;

      for (const attr of ["placeholder", "title", "aria-label"] as const) {
        const current = element.getAttribute(attr);
        if (!current) continue;

        const dataKey = `adminOriginal${attr.replace(/(^|-)([a-z])/g, (_, __, letter: string) => letter.toUpperCase())}`;
        const htmlElement = element as HTMLElement;
        if (!htmlElement.dataset[dataKey]) {
          htmlElement.dataset[dataKey] = current;
        }

        const original = htmlElement.dataset[dataKey] ?? current;
        const next = translateAdminText(original, language);
        if (current !== next) {
          element.setAttribute(attr, next);
        }
      }
    };

    const translateTree = () => {
      translating = true;

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let current = walker.nextNode();
      while (current) {
        translateTextNode(current as Text);
        current = walker.nextNode();
      }

      root.querySelectorAll("*").forEach(translateAttributes);
      translating = false;
    };

    const scheduleTranslate = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(translateTree);
    };

    translateTree();

    const observer = new MutationObserver(() => {
      if (!translating) scheduleTranslate();
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "title", "aria-label"],
    });

    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [language]);

  return null;
}
