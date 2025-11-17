"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

import Sidebar from "@/components/dashboard/sidebar";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { changePassword } from "@/services/auth/changePassword.service";

// VALIDATION SCHEMA
const ChangePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Please enter your current password"),
        newPassword: z.string().min(6, "New password must be at least 6 characters"),
        confirmPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type FormType = z.infer<typeof ChangePasswordSchema>;

function ChangePasswordContent() {
    const [successModal, setSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormType>({
        resolver: zodResolver(ChangePasswordSchema),
    });

    const onSubmit = async (data: FormType) => {
        try {
            await changePassword(data);

            toast.success("Password changed successfully!");
            reset();
            setSuccessModal(true);
        } catch (err: any) {
            const msg = err.message || "Failed to change password";
            setErrorMsg(msg);
            setErrorModal(true);
            toast.error(msg);
        }
    };

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />

            <div className="flex-1 flex flex-col ml-64">
                <DashboardHeader />

                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 md:p-12 max-w-2xl">

                        {/* HEADER */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Lock className="w-6 h-6 text-primary" />
                                </div>
                                <h1 className="text-3xl font-bold">Change Password</h1>
                            </div>
                            <p className="text-muted-foreground text-base ml-11">
                                Update your account password to keep your account secure.
                            </p>
                        </div>

                        {/* FORM CARD */}
                        <div className="bg-card border border-border rounded-2xl shadow-sm p-8 space-y-7">

                            {/* CURRENT PASSWORD */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold">Current Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showCurrentPassword ? "text" : "password"}
                                        placeholder="Enter your current password"
                                        className="pr-10 h-10"
                                        {...register("currentPassword")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.currentPassword && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.currentPassword.message}
                                    </p>
                                )}
                            </div>

                            {/* NEW PASSWORD */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold">New Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="Enter your new password (min. 6 characters)"
                                        className="pr-10 h-10"
                                        {...register("newPassword")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.newPassword && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.newPassword.message}
                                    </p>
                                )}
                            </div>

                            {/* CONFIRM NEW PASSWORD */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold">Confirm New Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm your new password"
                                        className="pr-10 h-10"
                                        {...register("confirmPassword")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            {/* SUBMIT BUTTON */}
                            <div className="pt-4">
                                <Button
                                    disabled={isSubmitting}
                                    onClick={handleSubmit(onSubmit)}
                                    className="w-full h-10 font-semibold"
                                >
                                    {isSubmitting ? "Updating..." : "Update Password"}
                                </Button>
                            </div>
                        </div>

                        {/* INFO BOX */}
                        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-200 dark:border-blue-900 rounded-xl">
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                <span className="font-semibold">💡 Tip:</span> Use a strong password with a mix of uppercase, lowercase, numbers, and special characters for better security.
                            </p>
                        </div>
                    </div>
                </main>
            </div>

            {/* SUCCESS MODAL */}
            <Dialog open={successModal} onOpenChange={setSuccessModal}>
                <DialogContent className="w-[420px] rounded-2xl">
                    <DialogHeader>
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-green-500/10 rounded-full">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-xl font-semibold">
                            Password Updated Successfully
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="text-center text-muted-foreground">
                        Your password has been changed successfully. Your account is now more secure.
                    </DialogDescription>
                    <DialogFooter className="gap-3">
                        <Button onClick={() => setSuccessModal(false)} className="w-full">
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ERROR MODAL */}
            <Dialog open={errorModal} onOpenChange={setErrorModal}>
                <DialogContent className="w-[420px] rounded-2xl">
                    <DialogHeader>
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-red-500/10 rounded-full">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-xl font-semibold text-red-600">
                            Failed to Update Password
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="text-center text-red-600/80">
                        {errorMsg}
                    </DialogDescription>
                    <DialogFooter className="gap-3">
                        <Button variant="outline" onClick={() => setErrorModal(false)} className="w-full">
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function ChangePasswordPage() {
    return (
        <ProtectedRoute>
            <ChangePasswordContent />
        </ProtectedRoute>
    );
}
