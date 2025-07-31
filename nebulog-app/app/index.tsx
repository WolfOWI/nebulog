import { useEffect } from "react";
import { router } from "expo-router";
import { useUser } from "@/contexts/UserContext";
import { View, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

export default function Index() {
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) return; // Don't navigate while loading

    if (user) {
      // User is authenticated, redirect to home
      router.replace("/(app)/home" as any);
    } else {
      // User is not authenticated, redirect to login
      router.replace("/(auth)/login" as any);
    }
  }, [user, loading]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background-0">
        <VStack className="items-center space-y-4">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="text-typography-600">Loading...</Text>
        </VStack>
      </View>
    );
  }

  return null;
}
