import React, { useState } from "react";
import { Text } from "@/components/ui/text";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { FormControl, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control";
import { Link, router } from "expo-router";
import { SafeAreaView, ScrollView, View, Image } from "react-native";
import { logInUser } from "@/services/authServices";
import { useUser } from "@/contexts/UserContext";
import LaunchButton from "@/components/buttons/LaunchButton";
import nebulogText from "@/assets/images/nebulog-text-logo-white.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useUser();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await logInUser({ email, password });
      // Navigate to home after successful login
      router.replace("/(app)/Home" as any);
    } catch (error) {
      console.error("Error logging in user: ", error);
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  // Temporary Quick Login
  // TODO: Remove this later
  const tempQuickLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      await logInUser({ email: "wolf@gmail.com", password: "123456" });
      // Navigate to home after successful login
      router.replace("/(app)/Home" as any);
    } catch (error) {
      console.error("Error logging in user: ", error);
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <ScrollView>
        {/* TODO: Remove this later */}
        <Button className="mt-4" onPress={tempQuickLogin} disabled={isLoading}>
          <ButtonText>{isLoading ? "Quick Login" : "Quick Login"}</ButtonText>
        </Button>
        {/* ---------------------------- */}
        <VStack className="flex-1 justify-center items-center px-6 py-8">
          {/* Logo */}
          <Image source={nebulogText} className="w-[150px] h-6 object-cover mb-12" />

          {/* Welcome Text */}
          <VStack className="items-center mb-8">
            <Heading className="text-typography-900 text-2xl font-bold mb-2">Welcome Back</Heading>
            <HStack className="">
              <Text className="text-typography-600">Don't have an account? </Text>
              <Link href="/Signup" asChild>
                <Text className="text-primary-600 font-bold">Join us</Text>
              </Link>
            </HStack>
          </VStack>

          {/* Error Message */}
          {error ? <Text className="text-red-400 text-center mb-4">{error}</Text> : null}

          {/* Login Form */}
          <VStack className="w-full gap-4 mb-24">
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

            {/* <Button className="mt-4" onPress={handleLogin} disabled={isLoading}>
              <ButtonText>{isLoading ? "Signing in..." : "Sign In"}</ButtonText>
            </Button> */}
          </VStack>
          <LaunchButton
            iconName="login"
            onLaunch={handleLogin}
            label="Hold to Log In"
            holdDuration={500}
            size={88}
          />
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
