import { View } from "react-native";
import React from "react";
import { getIconColourFromBgColour } from "@/utils/colourUtility";
import { defaultProfileColour } from "@/constants/Colors";
import { ProfileIcon } from "@/components/building-blocks/ProfileIcon";

interface ProfileAvatarProps {
  bgColour?: string;
  icon?: string;
  iconSize?: number;
}

const ProfileAvatar = ({ bgColour, icon, iconSize = 48 }: ProfileAvatarProps) => {
  const iconColor = getIconColourFromBgColour(bgColour || defaultProfileColour);
  const iconName = icon || "ufo-outline";

  return (
    <View
      className="flex items-center justify-center w-24 h-24 rounded-full"
      style={{ backgroundColor: bgColour || defaultProfileColour }}
    >
      <ProfileIcon name={iconName} size={iconSize} color={iconColor} />
    </View>
  );
};

export default ProfileAvatar;
