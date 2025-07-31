import React, { useEffect } from "react";
import { config } from "./config";
import { View, ViewProps } from "react-native";
import { OverlayProvider } from "@gluestack-ui/overlay";
import { ToastProvider } from "@gluestack-ui/toast";
import { useColorScheme } from "nativewind";
import { ModeType } from "./types";

// React 19 compatibility - suppress useInsertionEffect warnings
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === "string" && args[0].includes("useInsertionEffect")) {
    return;
  }
  originalConsoleError.apply(console, args);
};

export function GluestackUIProvider({
  mode = "light",
  ...props
}: {
  mode?: ModeType;
  children?: React.ReactNode;
  style?: ViewProps["style"];
}) {
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <View
      style={[
        config[colorScheme!],
        // eslint-disable-next-line react-native/no-inline-styles
        { flex: 1, height: "100%", width: "100%" },
        props.style,
      ]}
    >
      <OverlayProvider>
        <ToastProvider>{props.children}</ToastProvider>
      </OverlayProvider>
    </View>
  );
}
