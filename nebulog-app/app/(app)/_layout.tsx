import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="Home"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MyProfile"
        options={{
          title: "My Profile",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EditProfile"
        options={{
          title: "Edit Profile",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ProfileIconSelect"
        options={{
          title: "Profile Icon Select",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ProfileColourPick"
        options={{
          title: "Profile Colour Pick",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
