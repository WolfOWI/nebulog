import { View } from "react-native";
import React from "react";
import { getIconColourFromBgColour } from "@/utils/colourUtility";
import { defaultProfileColour } from "@/constants/Colors";
import { ProfileIcon } from "@/components/building-blocks/ProfileIcon";

interface ProfileAvatarProps {
  bgColour?: string;
  icon?: string;
  iconSize?: number;
  size?: number;
}

const ProfileAvatar = ({ bgColour, icon, iconSize = 40, size = 72 }: ProfileAvatarProps) => {
  const iconColor = getIconColourFromBgColour(bgColour || defaultProfileColour);
  const iconName = icon || "ufo-outline";

  return (
    <View
      className={`flex items-center justify-center rounded-full`}
      style={{ backgroundColor: bgColour || defaultProfileColour, width: size, height: size }}
    >
      <ProfileIcon name={iconName} size={iconSize} color={iconColor} />
    </View>
  );
};

export default ProfileAvatar;
