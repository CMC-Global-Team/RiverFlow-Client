
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
import CHANGE_PASSWORD_EN from "@/locales/en/change-password.json";
import CHANGE_PASSWORD_VI from "@/locales/vi/change-password.json";
import MINDMAPS_EN from "@/locales/en/mindmaps.json"
import MINDMAPS_VI from "@/locales/vi/mindmaps.json"
import SETTINGS_EN from "@/locales/en/settings.json";
import SETTINGS_VI from "@/locales/vi/settings.json";
import DASHBOARD_HEADER_EN from "@/locales/en/dashboardHeader.json";
import DASHBOARD_HEADER_VI from "@/locales/vi/dashboardHeader.json";
import MINDMAPCARD_EN from "@/locales/en/mindmapsCard.json";
import MINDMAPCARD_VI from "@/locales/vi/mindmapsCard.json";
import SIDE_BAR_EN from "@/locales/en/sideBar.json";
import SIDE_BAR_VI from "@/locales/vi/sideBar.json";
import TEMPLATE_MODAL_EN from "@/locales/en/templateModal.json";
import TEMPLATE_MODAL_VI from "@/locales/vi/templateModal.json";
import FILTER_BAR_EN from "@/locales/en/filterBar.json";
import FILTER_BAR_VI from "@/locales/vi/filterBar.json";
import VIEW_TOGGLE_EN from "@/locales/en/viewToggle.json";
import VIEW_TOGGLE_VI from "@/locales/vi/viewToggle.json";
import DELETE_CONFIRM_DIALOG_EN from "@/locales/en/deleteConfirmDialog.json";
import DELETE_CONFIRM_DIALOG_VI from "@/locales/vi/deleteConfirmDialog.json";
import ADMIN_SIDEBAR_EN from "@/locales/en/adminSideBar.json";
import ADMIN_SIDEBAR_VI from "@/locales/vi/adminSideBar.json";

import HEADER_EN from "@/locales/en/header.json";
import HEADER_VI from "@/locales/vi/header.json";
import SHARE_MODAL_EN from "@/locales/en/shareModal.json";
import SHARE_MODAL_VI from "@/locales/vi/shareModal.json";
import EDITOR_EN from "@/locales/en/editor.json";
import EDITOR_VI from "@/locales/vi/editor.json";
import ADMIN_EN from "@/locales/en/admin.json";
import ADMIN_VI from "@/locales/vi/admin.json";
import PUBLIC_MINDMAP_EN from "@/locales/en/publicMindmap.json";
import PUBLIC_MINDMAP_VI from "@/locales/vi/publicMindmap.json";
import AUTH_EN from "@/locales/en/auth.json";
import AUTH_VI from "@/locales/vi/auth.json";
import AI_EN from "@/locales/en/ai.json";
import AI_VI from "@/locales/vi/ai.json";
import PROFILE_EN from "@/locales/en/profile.json";
import PROFILE_VI from "@/locales/vi/profile.json";
import NOTIFICATIONS_EN from "@/locales/en/notifications.json";
import NOTIFICATIONS_VI from "@/locales/vi/notifications.json";
import CHEATSHEET_EN from "@/locales/en/cheatSheet.json";
import CHEATSHEET_VI from "@/locales/vi/cheatSheet.json";
import TUTORIAL_EN from "@/locales/en/tutorial.json";
import TUTORIAL_VI from "@/locales/vi/tutorial.json";
import EMBED_MODAL_EN from "@/locales/en/embedModal.json";
import EMBED_MODAL_VI from "@/locales/vi/embedModal.json";

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
        mindmaps: MINDMAPS_EN,
        settings: SETTINGS_EN,
        dashboardHeader: DASHBOARD_HEADER_EN,
        mindmapsCard: MINDMAPCARD_EN,
        sideBar: SIDE_BAR_EN,
        templateModal: TEMPLATE_MODAL_EN,
        filterBar: FILTER_BAR_EN,
        viewToggle: VIEW_TOGGLE_EN,
        deleteConfirmDialog: DELETE_CONFIRM_DIALOG_EN,
        adminSideBar: ADMIN_SIDEBAR_EN,

        header: HEADER_EN,
        shareModal: SHARE_MODAL_EN,
        editor: EDITOR_EN,
        admin: ADMIN_EN,
        publicMindmap: PUBLIC_MINDMAP_EN,
        auth: AUTH_EN,
        ai: AI_EN,
        profile: PROFILE_EN,
        notifications: NOTIFICATIONS_EN,
        cheatSheet: CHEATSHEET_EN,
        tutorial: TUTORIAL_EN,
        embedModal: EMBED_MODAL_EN,
    },
    vi: {
        home: HOME_VI,
        about: ABOUT_VI,
        pricing: PRICING_VI,
        other: OTHER_VI,
        dashboard: DASHBOARD_VI,
        "change-password": CHANGE_PASSWORD_VI,
        mindmaps: MINDMAPS_VI,
        settings: SETTINGS_VI,
        dashboardHeader: DASHBOARD_HEADER_VI,
        mindmapsCard: MINDMAPCARD_VI,
        sideBar: SIDE_BAR_VI,
        templateModal: TEMPLATE_MODAL_VI,
        filterBar: FILTER_BAR_VI,
        viewToggle: VIEW_TOGGLE_VI,
        deleteConfirmDialog: DELETE_CONFIRM_DIALOG_VI,
        adminSideBar: ADMIN_SIDEBAR_VI,

        header: HEADER_VI,
        shareModal: SHARE_MODAL_VI,
        editor: EDITOR_VI,
        admin: ADMIN_VI,
        publicMindmap: PUBLIC_MINDMAP_VI,
        auth: AUTH_VI,
        ai: AI_VI,
        profile: PROFILE_VI,
        notifications: NOTIFICATIONS_VI,
        cheatSheet: CHEATSHEET_VI,
        tutorial: TUTORIAL_VI,
        embedModal: EMBED_MODAL_VI,
    }
} as const
const defaultNS = 'home'
i18n.use(initReactI18next).init({
    resources: resource,
    lng: "vi",
    ns: ["home",
        "about",
        "pricing",
        "other",
        "dashboard",
        "dashboardHeader",
        "change-password",
        "mindmaps",
        "settings",
        "mindmapsCard",
        "sideBar",
        "templateModal",
        "filterBar",
        "viewToggle",
        "deleteConfirmDialog",
        "adminSideBar",

        "header",
        "shareModal",
        "editor",
        "admin",
        "publicMindmap",
        "auth",
        "ai",
        "profile",
        "notifications",
        "cheatSheet",
        "tutorial",
        "embedModal"
    ],
    defaultNS,
    fallbackLng: "vi",
    interpolation: {
        escapeValue: false
    }
});
