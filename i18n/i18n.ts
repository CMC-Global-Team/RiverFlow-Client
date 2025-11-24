
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HOME_EN from "@/locales/en/home.json"
import HOME_VI from "@/locales/vi/home.json"
import ABOUT_EN from "@/locales/en/about.json"
import ABOUT_VI from "@/locales/vi/about.json"
import PRICING_EN from "@/locales/en/pricing.json"
import PRICING_VI from "@/locales/vi/pricing.json"
import OTHER_EN from "@/locales/en/other.json"
import OTHER_VI from "@/locales/vi/other.json"
import DASHBOARD_EN from "@/locales/en/dashboard.json";
import DASHBOARD_VI from "@/locales/vi/dashboard.json";
import CHANGE_PASSWORD_EN from "@/locales/en/changePassword.json";
import CHANGE_PASSWORD_VI from "@/locales/vi/changePassword.json";

export const locale = {
    en: "English",
    vi: "Tiếng Việt"
} as const


const resource = {
    en: {
        home: HOME_EN,
        about: ABOUT_EN,
        pricing: PRICING_EN,
        other: OTHER_EN,
        dashboard: DASHBOARD_EN,
        "change-password": CHANGE_PASSWORD_EN,
    },
    vi: {
        home: HOME_VI,
        about: ABOUT_VI,
        pricing: PRICING_VI,
        other: OTHER_VI,
        dashboard: DASHBOARD_VI,
        "change-password": CHANGE_PASSWORD_VI,
    }
} as const
const defaultNS = 'home'
i18n.use(initReactI18next).init({
    resources: resource,
    lng: "vi",
    ns: ["home", "about", "pricing", "other", "dashboard", "change-password"],
    defaultNS,
    fallbackLng: "vi",
    interpolation: {
        escapeValue: false
    }
});