"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGitHubSignIn } from "@/hooks/auth/useGitHubSignIn";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

function GitHubCallbackContent() {
    const { t } = useTranslation("other");
    const router = useRouter();
    const searchParams = useSearchParams();
    const { signInWithGitHub, isLoading, error } = useGitHubSignIn();
    const { toast } = useToast();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const hasProcessed = useRef(false);

    useEffect(() => {
        const processGitHubCallback = async () => {
            if (hasProcessed.current) return;

            const code = searchParams.get("code");
            const errorParam = searchParams.get("error");

            if (errorParam) {
                hasProcessed.current = true;
                setStatus("error");
                toast({
                    variant: "destructive",
                    title: t("login.failedTitle"),
                    description: t("login.githubFailed") || "GitHub authentication was cancelled or failed",
                });
                setTimeout(() => router.push("/"), 2000);
                return;
            }

            if (!code) {
                hasProcessed.current = true;
                setStatus("error");
                toast({
                    variant: "destructive",
                    title: t("login.failedTitle"),
                    description: "No authorization code received from GitHub",
                });
                setTimeout(() => router.push("/"), 2000);
                return;
            }

            hasProcessed.current = true;

            try {
                const response = await signInWithGitHub(code);
                if (response) {
                    setStatus("success");
                    toast({
                        title: t("login.successTitle"),
                        description: t("login.successDesc", { name: response.fullName }),
                    });
                    const redirectPath = response.role === "ADMIN" ? "/admin" : "/dashboard";
                    setTimeout(() => router.push(redirectPath), 1000);
                } else {
                    setStatus("error");
                    setTimeout(() => router.push("/"), 2000);
                }
            } catch (err) {
                setStatus("error");
                console.error("GitHub login error:", err);
                setTimeout(() => router.push("/"), 2000);
            }
        };

        processGitHubCallback();
    }, [searchParams, signInWithGitHub, router, toast, t]);

    useEffect(() => {
        if (error) {
            toast({
                variant: "destructive",
                title: t("login.failedTitle"),
                description: error.message || t("login.githubFailed") || "GitHub login failed",
            });
        }
    }, [error, toast, t]);

    return (
        <div className="text-center space-y-4">
            {status === "loading" && (
                <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                    <p className="text-muted-foreground">
                        {isLoading ? "Signing in with GitHub..." : "Processing GitHub authentication..."}
                    </p>
                </>
            )}
            {status === "success" && (
                <>
                    <div className="h-12 w-12 rounded-full bg-green-100 mx-auto flex items-center justify-center">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-muted-foreground">Login successful! Redirecting...</p>
                </>
            )}
            {status === "error" && (
                <>
                    <div className="h-12 w-12 rounded-full bg-red-100 mx-auto flex items-center justify-center">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <p className="text-muted-foreground">Authentication failed. Redirecting...</p>
                </>
            )}
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
        </div>
    );
}

export default function GitHubCallbackPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Suspense fallback={<LoadingFallback />}>
                <GitHubCallbackContent />
            </Suspense>
        </div>
    );
}
