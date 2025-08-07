import { View } from "react-native";
import React from "react";
import { getIcon } from "@/constants/customIcons";
import { HStack } from "../ui/hstack";
import { Text } from "../ui/text";

interface EchoCounterProps {
  echoCount: number;
  isLiked: boolean;
}

const EchoCounter = ({ echoCount, isLiked }: EchoCounterProps) => {
  return (
    <HStack
      className={`flex-row items-center py-2 ps-4 pe-2 gap-2 rounded-full ${
        isLiked && "bg-slate-50"
      }`}
    >
      <Text className={`${isLiked ? "text-typography-50" : "text-typography-900"}`} size="md">
        {echoCount || "0"}
      </Text>
      {getIcon("echo", {
        fill: isLiked ? "#0f172a" : "#F8FAFC",
        width: 16,
        height: 16,
      })}
    </HStack>
  );
};

export default EchoCounter;
