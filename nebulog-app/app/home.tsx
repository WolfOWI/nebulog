import React from "react";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Link } from "expo-router";
import { SafeAreaView, ScrollView } from "react-native";

export default function Home() {
  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <ScrollView>
        <VStack className="flex-1 px-6">
          {/* Header */}
          <HStack className="justify-end items-center mb-8 gap-4">
            <Link href="/location" asChild>
              <Button variant="outline" size="sm">
                <ButtonText>📍 Location</ButtonText>
              </Button>
            </Link>
            <Link href="/profile" asChild>
              <Button variant="outline" size="sm">
                <ButtonText>Profile</ButtonText>
              </Button>
            </Link>
            <Link href="/" asChild>
              <Button variant="outline" size="sm">
                <ButtonText>Log Out</ButtonText>
              </Button>
            </Link>
          </HStack>

          <VStack className="items-center mb-8">
            <Heading className="text-typography-900 text-3xl font-bold mb-2">Home</Heading>
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
