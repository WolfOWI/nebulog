import React, { useState } from "react";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { router } from "expo-router";
import { SafeAreaView, ScrollView } from "react-native";

export default function Profile() {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [bio, setBio] = useState(
    "Live is like a box of chocolates. You never know what you're gonna get."
  );

  const handleBack = () => {
    router.push("/home");
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <ScrollView>
        <VStack className="flex-1 px-6">
          {/* Header */}
          <HStack className="justify-between items-center mb-8">
            <Button variant="outline" size="sm" onPress={handleBack}>
              <ButtonText>← Back</ButtonText>
            </Button>
          </HStack>

          {/* Profile Header */}
          <VStack className="items-center mb-8">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage
                source={{
                  uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                }}
              />
            </Avatar>
            <Heading className="text-typography-900 text-2xl font-bold mb-2">{name}</Heading>
            <Text className="text-typography-600 text-center">{bio}</Text>
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
