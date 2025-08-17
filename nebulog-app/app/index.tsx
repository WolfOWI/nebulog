import { useEffect } from "react";
import { router } from "expo-router";
import { useUser } from "@/contexts/UserContext";
import LoadingScreen from "@/components/LoadingScreen";

export default function Index() {
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) return;

    if (user) {
      // User is authenticated, redirect to home
      router.replace("/(app)/home" as any);
    } else {
      // User is not authenticated, redirect to onboarding
      router.replace("/onboarding" as any);
    }
  }, [user, loading]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <LoadingScreen
        loadingText="Loading"
        size={300}
        animationSource={require("@/assets/animations/astronaut-animation.json")}
      />
    );
  }

  return null;
}
