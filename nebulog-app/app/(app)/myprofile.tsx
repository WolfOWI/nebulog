import React, { useEffect, useState } from "react";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { logOutUser } from "@/services/authServices";
import { useUser } from "@/contexts/UserContext";
import LeftwardSwipeBtn from "@/components/buttons/LeftwardSwipeBtn";
import CircleHoldBtn from "@/components/buttons/CircleHoldBtn";
import ProfileAvatar from "@/components/avatars/ProfileAvatar";
import { defaultProfileColour } from "@/constants/Colors";
import MyReflectionCard from "@/components/cards/MyReflectionCard";
import { Reflection } from "@/lib/types";
import { FlatList } from "react-native-gesture-handler";
import { deleteReflection, getReflectionsForUser } from "@/services/reflectionServices";

export default function MyProfile() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const { user, updateUserContext } = useUser();

  const fakeReflection = {
    authorId: "KPH6Xrv2rvViazAD4ttushuGHRq1",
    createdAt: "2025-07-30T18:24:59.817Z",
    echoCount: 0,
    location: {
      formattedAddress: "15 Royal Chalice Cres, Mooikloof, Pretoria, 0081, South Africa",
      lat: -25.8429741,
      long: 28.342731,
      placeId:
        "Ej4xNSBSb3lhbCBDaGFsaWNlIENyZXMsIE1vb2lrbG9vZiwgUHJldG9yaWEsIDAwODEsIFNvdXRoIEFmcmljYSIwEi4KFAoSCUFM-LccXZUeEV_SrfYGX50CEA8qFAoSCTXfcO0CXZUeEQ1R-2YuzlI4",
      placeName: "15 Royal Chalice Cres",
    },
    mood: "grief",
    text: "What is life's meaning?",
    visibility: "public",
  };

  const handleClose = () => {
    router.back();
  };

  const handleEdit = () => {
    try {
      router.push("/editprofile" as any);
    } catch (error) {
      console.error("Error in handleEdit:", error);
    }
  };

  const handleGetReflections = async () => {
    if (!user?.id) {
      console.log("No logged in user found");
      return;
    }
    try {
      const userReflections = await getReflectionsForUser(user.id);

      // Sort reflections by createdAt in descending order
      const sortedReflections = userReflections.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setReflections(sortedReflections);
    } catch (error) {
      console.error("Error in handleGetReflections:", error);
    }
  };

  // TODO: Store reflections in context
  useEffect(() => {
    if (user) {
      handleGetReflections();
    }
  }, [user]);

  const handleDelete = async (reflectionId: string) => {
    if (!reflectionId) {
      throw new Error("Reflection ID not found");
    }

    try {
      if (!user?.id) {
        throw new Error("User ID not found");
      }

      await deleteReflection(reflectionId, user.id);

      // Refresh the reflections list after successful deletion
      await handleGetReflections();

      // Update user context
      updateUserContext({
        totalReflections: user.totalReflections - 1,
      });

      // TODO: Add toast notification for success
    } catch (error) {
      console.error("Error deleting reflection:", error);
      // TODO: Add toast notification for error
    }
  };

  if (!user) {
    return null;
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
        <ProfileAvatar bgColour={user.profileColor} icon={user.profileIcon || "ufo-outline"} />
        <HStack className="items-center mt-3 mb-2 gap-3">
          <View className="w-12 h-12" />
          <Heading className="text-typography-900 text-2xl font-bold">{user.username}</Heading>
          <CircleHoldBtn holdDuration={500} onHoldComplete={handleEdit} iconName="more-horiz" />
        </HStack>
        {user.bio && <Text className="text-typography-600 text-center mb-4">{user.bio}</Text>}
        <HStack className="justify-between items-center w-full mt-4 px-4">
          <VStack className="items-center w-1/3">
            <Text className="text-typography-900 text-center" size="2xl">
              {user.streakCount}
            </Text>
            <Text className="text-typography-400 text-center" size="md">
              day streak
            </Text>
          </VStack>
          <VStack className="items-center w-1/3">
            <Text className="text-typography-900 text-center" size="2xl">
              {user.totalReflections}
            </Text>
            <Text className="text-typography-400 text-center" size="md">
              reflections
            </Text>
          </VStack>
          <VStack className="items-center w-1/3">
            <Text className="text-typography-900 text-center" size="2xl">
              {user.totalEchoes}
            </Text>
            <Text className="text-typography-400 text-center" size="md">
              echoes
            </Text>
          </VStack>
        </HStack>
      </VStack>
      <FlatList
        data={reflections}
        renderItem={({ item }) => <MyReflectionCard reflection={item} onDelete={handleDelete} />}
        keyExtractor={(item) => item.id!}
        contentContainerStyle={{ paddingBottom: 100, marginHorizontal: 16, gap: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
