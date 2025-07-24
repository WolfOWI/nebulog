import React, { useState } from "react";
import { Text } from "@/components/ui/text";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { FormControl, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control";
import { router } from "expo-router";
import { SafeAreaView, ScrollView } from "react-native";
import Logo from "@/assets/Icons/Logo";
import { signUpUser } from "@/services/authServices";
import { useUser } from "@/contexts/UserContext";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useUser();

  const handleSignup = async () => {
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await signUpUser({ username: name, email, password });
      // Navigate to home after successful signup
      router.replace("/(app)/home");
    } catch (error) {
      console.error("Error creating user: ", error);
      setError("Error creating account. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
            <Heading className="text-typography-900 text-2xl font-bold mb-2">
              Create Account
            </Heading>
            <Text className="text-typography-600 text-center">
              Sign up to get started with your account
            </Text>
          </VStack>

          {/* Error Message */}
          {error ? <Text className="text-red-500 text-center mb-4">{error}</Text> : null}

          {/* Signup Form */}
          <VStack className="w-full max-w-sm space-y-4">
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText className="text-typography-700 font-medium mb-1">
                  Username
                </FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder="Enter your username"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="none"
                />
              </Input>
            </FormControl>

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

            <FormControl>
              <FormControlLabel>
                <FormControlLabelText className="text-typography-700 font-medium mb-1">
                  Confirm Password
                </FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </Input>
            </FormControl>

            <Button className="mt-4" onPress={handleSignup} disabled={isLoading}>
              <ButtonText>{isLoading ? "Creating account..." : "Sign Up"}</ButtonText>
            </Button>
          </VStack>

          {/* Login Link */}
          <HStack className="mt-6">
            <Text className="text-typography-600">Already have an account? </Text>
            <Text className="text-primary-600 font-medium" onPress={() => router.back()}>
              Sign in
            </Text>
          </HStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
