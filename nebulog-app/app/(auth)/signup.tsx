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
import { ScrollView, Image, View, KeyboardAvoidingView, Platform } from "react-native";
import { signUpUser } from "@/services/authServices";
import { useUser } from "@/contexts/UserContext";
import LaunchButton from "@/components/buttons/LaunchButton";
import nebulogText from "@/assets/images/nebulog-text-logo-white.png";
import isEmail from "validator/lib/isEmail";
import LeftwardSwipeBtn from "@/components/buttons/LeftwardSwipeBtn";
import LoadingScreen from "@/components/LoadingScreen";
import { isUsernameTaken } from "@/services/userServices";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useUser();

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (name.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }

    // Check if username is taken
    const isTaken = await isUsernameTaken(name);
    if (isTaken) {
      setError(`The username "${name}" is already taken. Please select a different one.`);
      return;
    }

    // Check if email is valid
    if (!isEmail(email)) {
      setError("The email you entered is not valid");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await signUpUser({ username: name, email, password });

      if (result.success && result.user) {
        // Navigate to home after successful signup (show loading screen for atleast 2 seconds)
        setTimeout(() => {
          router.replace("/(app)/home" as any);
        }, 2000);
      } else {
        // Show error message from the service
        setError(result.error || "Signup failed");
      }
    } catch (error) {
      console.error("Unexpected error during signup: ", error);
      setError("An unexpected error occurred. Please try again");
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000); // Show loading screen for atleast 2 seconds
    }
  };

  if (isLoading) {
    return (
      <LoadingScreen
        loadingText="Creating Your Account"
        showText={true}
        size={300}
        animationSource={require("@/assets/animations/astronaut-animation.json")}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <View className="m-4">
          <LeftwardSwipeBtn
            onSwipeComplete={() => router.dismissTo("/onboarding" as any)}
            iconName="arrow-back"
            touchMessage="Swipe to Go Back"
          />
        </View>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <VStack className="flex-1 justify-center items-center px-6 py-8">
            {/* Logo */}
            <Image source={nebulogText} className="w-[150px] h-6 object-cover mb-12" />

            {/* Welcome Text */}
            <VStack className="items-center mb-8">
              <Heading className="text-typography-900 text-2xl font-bold mb-2">
                Join Our Community!
              </Heading>
              <HStack className="">
                <Text className="text-typography-600">Already have an account? </Text>
                <Link href="/(auth)/login" asChild>
                  <Text className="text-primary-600 font-bold">Log in</Text>
                </Link>
              </HStack>
            </VStack>

            {/* Error Message */}
            {error ? <Text className="text-error-400 text-center mb-4">{error}</Text> : null}

            {/* Signup Form */}
            <VStack className="w-full gap-4 mb-24">
              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText className="text-typography-700 font-medium mb-1">
                    Username
                  </FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    placeholder="Enter a username"
                    value={name.toLowerCase().trim()}
                    onChangeText={(text) => setName(text.toLowerCase().trim())}
                    autoCapitalize="none"
                    inputMode="text"
                    maxLength={20}
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

              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText className="text-typography-700 font-medium mb-1">
                    Confirm Password
                  </FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    placeholder="Enter your password again"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    inputMode="text"
                    maxLength={50}
                  />
                </Input>
              </FormControl>
            </VStack>
          </VStack>
        </ScrollView>
        <View className="m-4">
          <LaunchButton
            iconName="person-add"
            onLaunch={handleSignup}
            label="Hold to Sign Up"
            holdDuration={500}
            size={88}
            fillColor="#34d399"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
