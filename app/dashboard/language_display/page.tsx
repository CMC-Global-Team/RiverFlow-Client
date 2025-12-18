"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon, Monitor, Globe, CheckCircle, Info } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

import Sidebar from "@/components/dashboard/sidebar";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Label } from "@/components/ui/label";

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
];

function LanguageDisplayContent() {
  const { theme, setTheme } = useTheme();
  const { i18n, t } = useTranslation("dashboard");
  const [mounted, setMounted] = useState(false);

  const currentLang = languages.find((lang) =>
    i18n.language?.startsWith(lang.code)
  ) || languages[0];

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const themes = [
    { value: "light", label: t("settings.themes.light"), icon: Sun },
    { value: "dark", label: t("settings.themes.dark"), icon: Moon },
    { value: "system", label: t("settings.themes.system"), icon: Monitor },
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col ml-64">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto bg-background">
          <div className="w-full h-full px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

              {/* LEFT SIDEBAR - INFO */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                {/* HEADER */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
                  </div>
                  <p className="text-muted-foreground text-lg">
                    {t("settings.subtitle")}
                  </p>
                </div>

                {/* DISPLAY INFO */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">{t("settings.displaySettings")}</h3>
                  <div className="space-y-2">
                    <div className="flex gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-500" />
                      <span className="text-foreground">{t("settings.themeApplied")}</span>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-500" />
                      <span className="text-foreground">{t("settings.langImmediate")}</span>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-500" />
                      <span className="text-foreground">{t("settings.systemSync")}</span>
                    </div>
                  </div>
                </div>

                {/* INFO BOX */}
                <div className="p-4 bg-blue-500/10 border border-blue-200 dark:border-blue-900 rounded-xl">
                  <p className="text-xs text-blue-900 dark:text-blue-100 leading-relaxed">
                    <span className="font-semibold">💡 {t("settings.tip")}:</span> {t("settings.preferencesSaved")}
                  </p>
                </div>
              </div>

              {/* RIGHT SIDE - SETTINGS CARDS */}
              <div className="lg:col-span-2 space-y-6">

                {/* THEME CARD */}

                <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                        <Sun className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <Label className="text-lg font-bold">{t("settings.display")}</Label>
                        <p className="text-sm text-muted-foreground">{t("settings.chooseTheme")}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {themes.map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => setTheme(value)}
                          className={`flex flex-col items-center justify-center p-6 rounded-xl transition-all transform hover:scale-105 ${theme === value
                              ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-xl scale-80"
                              : "bg-muted text-foreground hover:bg-muted/80 border border-border scale-80"
                            }`}
                        >
                          <Icon className={`w-8 h-8 mb-3 ${theme === value ? "text-white" : "text-muted-foreground"}`} />
                          <span className="text-sm font-semibold">{label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="p-4 bg-muted rounded-md border border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium ">{t("settings.currentTheme")}:</span>
                        <span className="text-sm font-bold  capitalize">{themes.find(th => th.value === theme)?.label || theme}</span>
                      </div>
                    </div>
                  </div>
                </div>


                {/* LANGUAGE CARD */}
                <div className="bg-card border border-border rounded-2xl shadow-lg p-8">

                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <Label className="text-lg ">{t("settings.language")}</Label>
                        <p className="text-sm text-muted-foreground">{t("settings.selectLanguage")}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {languages.map(({ code, name, flag }) => (
                        <button
                          key={code}
                          onClick={() => handleLanguageChange(code)}
                          className={`w-full flex items-center justify-between px-4 py-4 rounded-md transition-all transform hover:scale-[1.02] ${currentLang.code === code
                              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-xs "
                              : "bg-muted text-foreground hover:bg-muted/80 border border-border"
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-3xl">{flag}</span>
                            <span className="font-semibold text-base">{name}</span>
                          </div>
                          {currentLang.code === code && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium opacity-75">{t("settings.active")}</span>
                              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="p-4 bg-muted rounded-xl border border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{t("settings.activeLanguage")}:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{currentLang.flag}</span>
                          <span className="text-sm font-bold text-foreground">{currentLang.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function LanguageDisplayPage() {
  return (
    <ProtectedRoute>
      <LanguageDisplayContent />
    </ProtectedRoute>
  );
}