import { View, Text } from "react-native";
import React from "react";
import { getMoodIcon } from "@/constants/moodIcons";
import { getIconColourFromBgColour } from "@/utils/colourUtility";
import { defaultProfileColour } from "@/constants/Colors";

interface ProfileAvatarProps {
  bgColour?: string;
  icon?: string;
}

const ProfileAvatar = ({ bgColour, icon }: ProfileAvatarProps) => {
  return (
    <View
      className="flex items-center justify-center w-24 h-24 rounded-full"
      style={{ backgroundColor: bgColour || defaultProfileColour }}
    >
      {getMoodIcon(icon || "default", {
        width: 48,
        height: 48,
        fill: getIconColourFromBgColour(bgColour || defaultProfileColour),
      })}
    </View>
  );
};

export default ProfileAvatar;
