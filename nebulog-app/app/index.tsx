import { useEffect } from "react";
import { router } from "expo-router";

export default function Index() {
  useEffect(() => {
    // TODO: Add authentication check here
    // For now, redirect to login
    router.replace("/(auth)/login");
  }, []);

  return null;
}
