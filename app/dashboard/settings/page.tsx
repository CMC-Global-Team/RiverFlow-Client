"use client";

import { useTranslation } from "react-i18next";
export default function SettingsPage() {
  const { t } = useTranslation("settings");
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">{t("settings")}</h1>
      <p className="text-muted-foreground">{t("accountSettingsDescription")}</p>
    </div>
  );
}
