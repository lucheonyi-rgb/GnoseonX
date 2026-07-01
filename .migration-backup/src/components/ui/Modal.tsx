"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NeuButton } from "./NeuButton";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-[95vw] max-h-[95vh]",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className={`relative w-full ${sizes[size]} bg-surface-100 rounded-3xl shadow-neu-convex p-6 z-10 overflow-auto max-h-[90vh]`}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
          >
            {/* ASCII corner decorations */}
            <span className="absolute top-2 left-3 font-mono text-[10px] text-violet-300/20 select-none">
              ╔═
            </span>
            <span className="absolute top-2 right-3 font-mono text-[10px] text-violet-300/20 select-none">
              ═╗
            </span>
            <span className="absolute bottom-2 left-3 font-mono text-[10px] text-violet-300/20 select-none">
              ╚═
            </span>
            <span className="absolute bottom-2 right-3 font-mono text-[10px] text-violet-300/20 select-none">
              ═╝
            </span>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-mono text-lg font-bold text-surface-500">
                  <span className="text-violet-300">▸</span> {title}
                </h2>
                <NeuButton variant="ghost" size="icon" onClick={onClose}>
                  <X size={18} />
                </NeuButton>
              </div>
            )}

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
