import React, { useEffect, useState } from "react";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Pressable, FlatList, RefreshControl } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useUser } from "@/contexts/UserContext";
import LeftwardSwipeBtn from "@/components/buttons/LeftwardSwipeBtn";
import CircleHoldBtn from "@/components/buttons/CircleHoldBtn";
import ProfileAvatar from "@/components/avatars/ProfileAvatar";
import { defaultProfileColour } from "@/constants/Colors";
import MyReflectionCard from "@/components/cards/MyReflectionCard";
import BlockedUserCard from "@/components/cards/BlockedUserCard";
import { Reflection, User } from "@/lib/types";
import {
  deleteReflection,
  getReflectionsForUser,
  getEchoedReflectionsForUser,
} from "@/services/reflectionServices";
import { getBlockedUsers, unblockUser } from "@/services/userServices";
import UserReflectionCard from "@/components/cards/UserReflectionCard";
import EchoedReflectionCard from "@/components/cards/EchoedReflectionCard";
import { useToast } from "@/contexts/ToastContext";
import { unlikeReflection } from "@/services/echoService";

type TabType = "reflections" | "echoed" | "blocked";

export default function MyProfile() {
  const { showToast } = useToast();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [echoedReflections, setEchoedReflections] = useState<Reflection[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("reflections");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user, updateUserContext } = useUser();

  const handleClose = () => {
    router.dismissAll();
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

  const handleGetEchoedReflections = async () => {
    if (!user?.id) {
      console.log("No logged in user found");
      return;
    }
    try {
      const echoedRefs = await getEchoedReflectionsForUser(user.id);

      // Filter out reflections from blocked users
      const blockedUserIds = user.blockedUserIds || {};
      const filteredEchoedRefs = echoedRefs.filter(
        (reflection) => !blockedUserIds[reflection.authorId]
      );

      setEchoedReflections(filteredEchoedRefs);
    } catch (error) {
      console.error("Error in handleGetEchoedReflections:", error);
    }
  };

  const handleGetBlockedUsers = async () => {
    if (!user?.id) {
      console.log("No logged in user found");
      return;
    }
    try {
      const blockedUsersList = await getBlockedUsers(user.id);
      setBlockedUsers(blockedUsersList);
    } catch (error) {
      console.error("Error in handleGetBlockedUsers:", error);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsLoading(true);

    // Load data for the selected tab
    switch (tab) {
      case "reflections":
        handleGetReflections();
        break;
      case "echoed":
        handleGetEchoedReflections();
        break;
      case "blocked":
        handleGetBlockedUsers();
        break;
    }

    setIsLoading(false);
  };

  const handleUnblockUser = async (userId: string) => {
    if (!user?.id) {
      console.log("No logged in user found");
      return;
    }

    try {
      await unblockUser(user.id, userId);

      // Remove the unblocked user from the list
      setBlockedUsers((prev) => prev.filter((user) => user.id !== userId));

      // Update user context to reflect the change
      const updatedBlockedUserIds = { ...user.blockedUserIds };
      delete updatedBlockedUserIds[userId];

      updateUserContext({
        blockedUserIds: updatedBlockedUserIds,
      });

      // Refresh echoed reflections to show newly unblocked user's reflections
      if (activeTab === "echoed") {
        await handleGetEchoedReflections();
      }

      console.log(`User ${userId} unblocked successfully`);
    } catch (error) {
      console.error("Error unblocking user:", error);
    }
  };

  const handleViewBlockedUserProfile = (userId: string) => {
    try {
      router.push(`/userprofile?userId=${userId}` as any);
    } catch (error) {
      console.error("Error navigating to user profile:", error);
    }
  };

  const showErrorToast = (title: string, message: string) => {
    showToast({
      type: "error",
      text1: title,
      text2: message,
      visibilityTime: 4000,
    });
  };

  const showSuccessToast = (title: string, message: string) => {
    showToast({
      type: "success",
      text1: title,
      text2: message,
      visibilityTime: 4000,
    });
  };

  useEffect(() => {
    if (user) {
      handleGetReflections();
    }
  }, [user]);

  const handleUnlikeReflection = async (reflectionId: string, reflectionAuthorId: string) => {
    if (!user?.id) {
      console.log("No logged in user found");
      return;
    }

    try {
      // console.log("Unliking reflection", reflectionId, reflectionAuthorId);
      await unlikeReflection(user.id, reflectionId, reflectionAuthorId);

      // Refresh echoed reflections to show newly unliked reflection
      if (activeTab === "echoed") {
        await handleGetEchoedReflections();
      }
      showSuccessToast("Thought Unechoed", "Thought removed from your echoed thoughts.");

      // console.log(`Reflection ${reflectionId} unliked successfully`);
    } catch (error) {
      console.error("Error unliking reflection:", error);
      showErrorToast(
        "Error Unechoing Thought",
        "Failed to remove thought from your echoed thoughts. Please try again."
      );
    }
  };

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

      showSuccessToast("Reflection Deleted", "Your reflection has been successfully deleted.");
    } catch (error) {
      console.error("Error deleting reflection:", error);
      showErrorToast("Error Deleting Reflection", "Failed to delete reflection. Please try again.");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      switch (activeTab) {
        case "reflections":
          await handleGetReflections();
          break;
        case "echoed":
          await handleGetEchoedReflections();
          break;
        case "blocked":
          await handleGetBlockedUsers();
          break;
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderTabButton = (tab: TabType, label: string, icon: string) => (
    <Pressable
      onPress={() => handleTabChange(tab)}
      className={`flex-1 py-3 px-4 rounded-lg ${activeTab === tab && "bg-slate-800"}`}
    >
      <HStack className="items-center justify-center gap-2">
        <MaterialIcons
          name={icon as any}
          size={20}
          color={activeTab === tab ? user?.profileColor : "#6b7280"}
        />
        <Text
          className={`${activeTab === tab ? "text-typography-900" : "text-typography-600"}`}
          size="sm"
        >
          {label}
        </Text>
      </HStack>
    </Pressable>
  );

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center">
          <Text className="text-typography-400">Loading...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case "reflections":
        return (
          <FlatList
            data={reflections}
            renderItem={({ item }) => (
              <MyReflectionCard reflection={item} onDelete={handleDelete} />
            )}
            keyExtractor={(item) => item.id!}
            contentContainerStyle={{ paddingBottom: 100, marginHorizontal: 16, gap: 16 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-20">
                <MaterialIcons name="article" size={64} color="#475569" />
                <Text className="text-typography-600 text-center">No reflections yet</Text>
              </View>
            }
          />
        );

      case "echoed":
        return (
          <FlatList
            data={echoedReflections}
            renderItem={({ item }) => (
              <EchoedReflectionCard reflection={item} onUnlike={handleUnlikeReflection} />
            )}
            keyExtractor={(item) => item.id!}
            contentContainerStyle={{ paddingBottom: 100, marginHorizontal: 16, gap: 16 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-20">
                <MaterialIcons name="favorite" size={64} color="#475569" />
                <Text className="text-typography-600 text-center">No Echoed Reflections Yet</Text>
              </View>
            }
          />
        );

      case "blocked":
        return (
          <FlatList
            data={blockedUsers}
            renderItem={({ item }) => (
              <BlockedUserCard
                blockedUser={item}
                onUnblock={handleUnblockUser}
                onViewProfile={handleViewBlockedUserProfile}
              />
            )}
            keyExtractor={(item) => item.id!}
            contentContainerStyle={{ paddingBottom: 100, marginHorizontal: 16, gap: 16 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-20">
                <Text className="text-typography-400 text-center">No Blocked Users</Text>
              </View>
            }
          />
        );

      default:
        return null;
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
      <VStack className="items-center mb-8 mx-4">
        <ProfileAvatar bgColour={user.profileColor} icon={user.profileIcon || "ufo-outline"} />
        <HStack className="items-center mt-3 mb-2 gap-3">
          <View className="w-12 h-12" />
          <Heading className="text-typography-900 text-2xl font-bold">{user.username}</Heading>
          <CircleHoldBtn holdDuration={500} onHoldComplete={handleEdit} iconName="more-horiz" />
        </HStack>
        {user.bio && <Text className="text-typography-600 text-center mb-4 mx-4">{user.bio}</Text>}
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

      {/* Tabs */}
      <HStack className="mx-4 mb-4 gap-2">
        {renderTabButton("reflections", "Reflections", "article")}
        {renderTabButton("echoed", "Echoed", "favorite")}
        {renderTabButton("blocked", "Blocked", "block")}
      </HStack>

      {/* Tab Content */}
      <View className="flex-1">{renderTabContent()}</View>
    </SafeAreaView>
  );
}
