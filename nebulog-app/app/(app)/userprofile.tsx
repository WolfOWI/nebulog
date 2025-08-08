import React, { useEffect, useState } from "react";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import LeftwardSwipeBtn from "@/components/buttons/LeftwardSwipeBtn";
import CircleHoldBtn from "@/components/buttons/CircleHoldBtn";
import ProfileAvatar from "@/components/avatars/ProfileAvatar";
import { defaultProfileColour } from "@/constants/Colors";
import UserReflectionCard from "@/components/cards/UserReflectionCard";
import { Reflection, User } from "@/lib/types";
import { FlatList } from "react-native-gesture-handler";
import { getPublicReflectionsForUser } from "@/services/reflectionServices";
import { getUserById } from "@/services/userServices";
import { listenToUserTotalEchoes } from "@/services/echoService";
import { useUser } from "@/contexts/UserContext";

export default function UserProfile() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const params = useLocalSearchParams();
  const { user: currentUser, blockUserById, unblockUserById } = useUser();

  // Extract user ID from params
  const userId = params.userId as string;

  const handleClose = () => {
    router.back();
  };

  const handleBlockUser = async () => {
    if (!currentUser?.id || !userId) {
      console.log("No current user or target user ID found");
      return;
    }

    try {
      if (isBlocked) {
        await unblockUserById(userId);
        setIsBlocked(false);
        console.log("User unblocked");
      } else {
        await blockUserById(userId);
        setIsBlocked(true);
        console.log("User blocked");
      }
    } catch (error) {
      console.error("Error handling block/unblock:", error);
    }
  };

  const checkIfBlocked = () => {
    if (!currentUser?.id || !userId) return;

    const blockedUserIds = currentUser.blockedUserIds || {};
    setIsBlocked(blockedUserIds[userId] === true);
  };

  const handleGetUserData = async () => {
    if (!userId) {
      console.log("No user ID found");
      setLoading(false);
      return;
    }
    try {
      const userData = await getUserById(userId);
      setUserProfile(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetReflections = async () => {
    if (!userId) {
      console.log("No user ID found");
      return;
    }
    try {
      const userReflections = await getPublicReflectionsForUser(userId);

      // Sort reflections by createdAt in descending order
      const sortedReflections = userReflections.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setReflections(sortedReflections);
    } catch (error) {
      console.error("Error in handleGetReflections:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      handleGetUserData();
      handleGetReflections();
    }
  }, [userId]);

  useEffect(() => {
    checkIfBlocked();
  }, [currentUser, userId]);

  // Listen to real-time changes in the viewed user's total echoes
  useEffect(() => {
    if (!userId || !userProfile) return;

    const unsubscribe = listenToUserTotalEchoes(userId, (totalEchoes) => {
      setUserProfile((prev) => (prev ? { ...prev, totalEchoes } : null));
    });

    return unsubscribe;
  }, [userId, userProfile]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background-0">
        <View className="m-4">
          <LeftwardSwipeBtn
            onSwipeComplete={handleClose}
            iconName="close"
            touchMessage="Swipe to Close"
          />
        </View>
        <View className="flex-1 justify-center items-center">
          <Text className="text-typography-600">Loading user profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView className="flex-1 bg-background-0">
        <View className="m-4">
          <LeftwardSwipeBtn
            onSwipeComplete={handleClose}
            iconName="close"
            touchMessage="Swipe to Close"
          />
        </View>
        <View className="flex-1 justify-center items-center">
          <Text className="text-typography-600">User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <View className="m-4">
        <LeftwardSwipeBtn
          onSwipeComplete={handleClose}
          iconName="close"
          touchMessage="Swipe to Close"
        />
      </View>

      {/* Profile Header */}
      <VStack className="items-center mb-8">
        <ProfileAvatar
          bgColour={userProfile.profileColor || defaultProfileColour}
          icon={userProfile.profileIcon || "ufo-outline"}
        />
        <HStack className="items-center mt-3 mb-2 gap-3">
          <View className="w-12 h-12" />
          <Heading className="text-typography-900 text-2xl font-bold">
            {userProfile.username}
          </Heading>
          <CircleHoldBtn
            holdDuration={500}
            onHoldComplete={handleBlockUser}
            iconName={isBlocked ? "thumb-up" : "block"}
          />
        </HStack>
        {isBlocked && <Text className="text-red-500 font-bold text-center mb-2">BLOCKED</Text>}
        {userProfile.bio && (
          <Text className="text-typography-600 text-center mb-4">{userProfile.bio}</Text>
        )}
        <HStack className="justify-between items-center w-full mt-4 px-4">
          <VStack className="items-center w-1/3">
            <Text className="text-typography-900 text-center" size="2xl">
              {userProfile.streakCount}
            </Text>
            <Text className="text-typography-400 text-center" size="md">
              day streak
            </Text>
          </VStack>
          <VStack className="items-center w-1/3">
            <Text className="text-typography-900 text-center" size="2xl">
              {userProfile.totalReflections}
            </Text>
            <Text className="text-typography-400 text-center" size="md">
              reflections
            </Text>
          </VStack>
          <VStack className="items-center w-1/3">
            <Text className="text-typography-900 text-center" size="2xl">
              {userProfile.totalEchoes}
            </Text>
            <Text className="text-typography-400 text-center" size="md">
              echoes
            </Text>
          </VStack>
        </HStack>
      </VStack>
      <FlatList
        data={reflections}
        renderItem={({ item }) => <UserReflectionCard reflection={item} />}
        keyExtractor={(item) => item.id!}
        contentContainerStyle={{ paddingBottom: 100, marginHorizontal: 16, gap: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
