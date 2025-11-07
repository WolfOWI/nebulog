import React, { createContext, useContext, useState, useCallback } from "react";
import CustomToast from "@/components/CustomToast";

interface ToastData {
  id: string;
  type: "success" | "error" | "info" | "warning";
  text1: string;
  text2?: string;
  visibilityTime: number;
}

interface ToastContextType {
  showToast: (data: {
    type: "success" | "error" | "info" | "warning";
    text1: string;
    text2?: string;
    visibilityTime?: number;
  }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = useCallback(
    (data: {
      type: "success" | "error" | "info" | "warning";
      text1: string;
      text2?: string;
      visibilityTime?: number;
    }) => {
      const toastData: ToastData = {
        id: Date.now().toString(),
        type: data.type,
        text1: data.text1,
        text2: data.text2,
        visibilityTime: data.visibilityTime || 4000,
      };
      setToast(toastData);
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <CustomToast toast={toast} onHide={hideToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};
