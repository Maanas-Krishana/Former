"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ToastVariant = "info" | "success" | "warning" | "destructive";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
}

interface ToastOptions {
  title?: string;
  message: string;
  variant?: ToastVariant;
}

interface ModalContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  toast: (options: ToastOptions | string, variant?: ToastVariant) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  // Confirm Modal state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    variant: "danger" | "default";
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "Cancel",
    variant: "default",
    resolve: null,
  });

  // Toast state
  const [toasts, setToasts] = useState<
    { id: string; title?: string; message: string; variant: ToastVariant }[]
  >([]);

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title || "Confirmation",
        message: options.message,
        confirmText: options.confirmText || "OK",
        cancelText: options.cancelText || "Cancel",
        variant: options.variant || (options.message.toLowerCase().includes("delete") ? "danger" : "default"),
        resolve,
      });
    });
  };

  const handleConfirmResponse = (value: boolean) => {
    if (confirmState.resolve) {
      confirmState.resolve(value);
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  };

  const toast = (options: ToastOptions | string, variant: ToastVariant = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    const toastObj =
      typeof options === "string"
        ? { id, message: options, variant }
        : { id, title: options.title, message: options.message, variant: options.variant || variant };

    setToasts((prev) => [...prev, toastObj]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  return (
    <ModalContext.Provider value={{ confirm, toast }}>
      {children}

      {/* Styled Custom Confirm Dialog */}
      {confirmState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start space-x-3">
              <div
                className={`p-2.5 rounded-xl flex items-center justify-center ${
                  confirmState.variant === "danger"
                    ? "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400"
                    : "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1 pt-0.5">
                <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                  {confirmState.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {confirmState.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                variant="outline"
                onClick={() => handleConfirmResponse(false)}
                className="border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl"
              >
                {confirmState.cancelText}
              </Button>
              <Button
                onClick={() => handleConfirmResponse(true)}
                className={`rounded-xl text-white font-medium shadow-sm ${
                  confirmState.variant === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {confirmState.confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Styled Toasts Container */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center space-x-3 p-4 bg-white dark:bg-zinc-900 border dark:border-zinc-800 shadow-xl rounded-xl text-sm animate-in slide-in-from-bottom-5 duration-200"
          >
            {t.variant === "success" && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
            {t.variant === "destructive" && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
            {t.variant === "warning" && <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />}
            {t.variant === "info" && <Info className="w-5 h-5 text-indigo-500 flex-shrink-0" />}
            <div className="flex-1">
              {t.title && <div className="font-semibold text-gray-900 dark:text-white">{t.title}</div>}
              <div className="text-gray-600 dark:text-gray-300">{t.message}</div>
            </div>
          </div>
        ))}
      </div>
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
