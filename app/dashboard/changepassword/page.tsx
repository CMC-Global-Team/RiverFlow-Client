"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
                    <div className="p-6 md:p-8 max-w-3xl">

                        {/* HEADER */}
                        <h1 className="text-3xl font-bold mb-3">Change Password</h1>
                        <p className="text-muted-foreground mb-8">
                            Update your account password securely.
                        </p>

                        {/* FORM CARD */}
                        <div className="bg-card border rounded-xl shadow-sm p-6 space-y-6">

                            {/* CURRENT PASSWORD */}
                            <div className="space-y-2">
                                <Label>Current Password</Label>
                                <Input
                                    type="password"
                                    placeholder="Enter current password"
                                    {...register("currentPassword")}
                                />
                                {errors.currentPassword && (
                                    <p className="text-red-500 text-sm">
                                        {errors.currentPassword.message}
                                    </p>
                                )}
                            </div>

                            {/* NEW PASSWORD */}
                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <Input
                                    type="password"
                                    placeholder="Enter new password"
                                    {...register("newPassword")}
                                />
                                {errors.newPassword && (
                                    <p className="text-red-500 text-sm">
                                        {errors.newPassword.message}
                                    </p>
                                )}
                            </div>

                            {/* CONFIRM NEW PASSWORD */}
                            <div className="space-y-2">
                                <Label>Confirm New Password</Label>
                                <Input
                                    type="password"
                                    placeholder="Confirm new password"
                                    {...register("confirmPassword")}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-sm">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            {/* SUBMIT BUTTON */}
                            <Button disabled={isSubmitting} onClick={handleSubmit(onSubmit)} className="w-40">
                                {isSubmitting ? "Saving..." : "Change Password"}
                            </Button>
                        </div>
                    </div>
                </main>
            </div>

            {/* SUCCESS MODAL */}
            <Dialog open={successModal} onOpenChange={setSuccessModal}>
                <DialogContent className="w-[380px] rounded-xl text-center py-6">
                    <DialogTitle className="text-xl font-semibold mb-2">Success!</DialogTitle>
                    <DialogDescription className="text-muted-foreground mb-6">
                        Your password has been updated successfully.
                    </DialogDescription>
                    <DialogFooter>
                        <Button onClick={() => setSuccessModal(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ERROR MODAL */}
            <Dialog open={errorModal} onOpenChange={setErrorModal}>
                <DialogContent className="w-[380px] rounded-xl text-center py-6">
                    <DialogTitle className="text-xl font-semibold text-red-600 mb-2">
                        Failed to Change Password
                    </DialogTitle>
                    <DialogDescription className="text-red-500 mb-6">
                        {errorMsg}
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="destructive" onClick={() => setErrorModal(false)}>
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
