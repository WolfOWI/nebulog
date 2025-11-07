import React from "react";
import { BaseToast, ToastConfig } from "react-native-toast-message";

export const toastConfig: ToastConfig = {
  /*
   * Overwrite 'success' type
   */
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#22c55e",
        borderLeftWidth: 5,
      }}
      contentContainerStyle={{
        width: "93%",
        paddingVertical: 24,
        paddingHorizontal: 24,
        backgroundColor: "#1e293b",
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "500",
        color: "#22c55e",
        marginBottom: 4,
      }}
      text2Style={{
        fontSize: 16,
        color: "#64748b",
        lineHeight: 22,
      }}
    />
  ),
  /*
   * Overwrite 'error' type - Custom implementation
   */
  error: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#f87171",
        borderLeftWidth: 5,
      }}
      contentContainerStyle={{
        width: "93%",
        paddingVertical: 24,
        paddingHorizontal: 24,
        backgroundColor: "#1e293b",
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "500",
        color: "#f87171",
        marginBottom: 4,
      }}
      text2Style={{
        fontSize: 16,
        color: "#64748b",
        lineHeight: 22,
      }}
    />
  ),
  /*
   * Overwrite 'info' type
   */
  info: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#7dd3fc",
        borderLeftWidth: 5,
      }}
      contentContainerStyle={{
        width: "93%",
        paddingVertical: 24,
        paddingHorizontal: 24,
        backgroundColor: "#1e293b",
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "500",
        color: "#7dd3fc",
        marginBottom: 4,
      }}
      text2Style={{
        fontSize: 16,
        color: "#64748b",
        lineHeight: 22,
      }}
    />
  ),
  /*
   * Overwrite 'warning' type
   */
  warning: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#f59e0b",
        borderLeftWidth: 5,
      }}
      contentContainerStyle={{
        width: "93%",
        paddingVertical: 24,
        paddingHorizontal: 24,
        backgroundColor: "#1e293b",
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "500",
        color: "#f59e0b",
        marginBottom: 4,
      }}
      text2Style={{
        fontSize: 16,
        color: "#64748b",
        lineHeight: 22,
      }}
    />
  ),
};
