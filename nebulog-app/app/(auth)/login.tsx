import React, { useState } from "react";
import { Text } from "@/components/ui/text";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { FormControl, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Image } from "react-native";
import { logInUser } from "@/services/authServices";
import { useUser } from "@/contexts/UserContext";
import LaunchButton from "@/components/buttons/LaunchButton";
import nebulogText from "@/assets/images/nebulog-text-logo-white.png";
import isEmail from "validator/lib/isEmail";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useUser();

  const handleLogin = async () => {
    // Check if email and password are filled
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    // Check if email is valid
    if (!isEmail(email)) {
      setError("The email you entered is not valid");
      return;
    }

    // Check if password is valid
    if (password.length < 6) {
      setError("Your password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await logInUser({ email, password });

      if (result.success && result.user) {
        // Navigate to home after successful login
        router.replace("/(app)/home" as any);
      } else {
        // Show error message from the service
        setError(result.error || "Login failed");
      }
    } catch (error) {
      console.error("Unexpected error during login: ", error);
      setError("An unexpected error occurred. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <ScrollView>
        <VStack className="flex-1 justify-center items-center px-6 py-8">
          {/* Logo */}
          <Image source={nebulogText} className="w-[150px] h-6 object-cover mb-12" />

          {/* Welcome Text */}
          <VStack className="items-center mb-8">
            <Heading className="text-typography-900 text-2xl font-bold mb-2">Welcome Back</Heading>
            <HStack className="">
              <Text className="text-typography-600">Don't have an account? </Text>
              <Link href="/signup" asChild>
                <Text className="text-primary-600 font-bold">Join us</Text>
              </Link>
            </HStack>
          </VStack>

          {/* Error Message */}
          {error ? <Text className="text-error-400 text-center mb-4">{error}</Text> : null}

          {/* Login Form */}
          <VStack className="w-full gap-4 mb-24">
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText className="text-typography-700 font-medium mb-1">
                  Email
                </FormControlLabelText>
              </FormControlLabel>
              <Input variant="outline">
                <InputField
                  placeholder="Enter your email"
                  value={email.toLowerCase().trim()}
                  onChangeText={(text) => setEmail(text.toLowerCase().trim())}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  inputMode="email"
                  maxLength={50}
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
                  inputMode="text"
                  maxLength={50}
                />
              </Input>
            </FormControl>

            {/* <Button className="mt-4" onPress={handleLogin} disabled={isLoading}>
              <ButtonText>{isLoading ? "Signing in..." : "Sign In"}</ButtonText>
            </Button> */}
          </VStack>
        </VStack>
      </ScrollView>
      <View className="m-4">
        <LaunchButton
          iconName="login"
          onLaunch={handleLogin}
          label="Hold to Log In"
          holdDuration={500}
          size={88}
        />
      </View>
    </SafeAreaView>
  );
}
