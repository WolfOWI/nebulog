import React, { useState } from "react";
import { Text } from "@/components/ui/text";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { FormControl, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control";
import { Link, router } from "expo-router";
import { SafeAreaView, ScrollView } from "react-native";
import Logo from "@/assets/Icons/Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleLogin = async () => {
    // if (!email || !password) {
    //   // TODO: Add login error messages
    //   return;
    // }

    setIsLoading(true);
    // TODO: Add auth
    setTimeout(() => {
      setIsLoading(false);
      router.push("/(app)/home");
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <ScrollView>
        <VStack className="flex-1 justify-center items-center px-6 py-8">
          {/* Logo */}
          <VStack className="items-center mb-8">
            <Logo />
          </VStack>

          {/* Welcome Text */}
          <VStack className="items-center mb-8">
            <Heading className="text-typography-900 text-2xl font-bold mb-2">Welcome Back</Heading>
            <Text className="text-typography-600 text-center">
              Sign in to your account to continue
            </Text>
          </VStack>

          {/* Login Form */}
          <VStack className="w-full max-w-sm space-y-4">
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText className="text-typography-700 font-medium mb-1">
                  Email
                </FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Input>
            </FormControl>

            <FormControl>
              <FormControlLabel>
                <FormControlLabelText className="text-typography-700 font-medium mb-1">
                  Password
                </FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </Input>
            </FormControl>

            <Button className="mt-4" onPress={handleLogin} disabled={isLoading}>
              <ButtonText>{isLoading ? "Signing in..." : "Sign In"}</ButtonText>
            </Button>
          </VStack>

          {/* Sign Up Link */}
          <HStack className="mt-6">
            <Text className="text-typography-600">Don't have an account? </Text>
            <Link href="/signup" asChild>
              <Text className="text-primary-600 font-medium">Sign up</Text>
            </Link>
          </HStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
