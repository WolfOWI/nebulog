import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="myprofile"
        options={{
          title: "My Profile",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="editprofile"
        options={{
          title: "Edit Profile",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profileiconselect"
        options={{
          title: "Profile Icon Select",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profilecolourpick"
        options={{
          title: "Profile Colour Pick",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="thoughtlaunch"
        options={{
          title: "Thought Launch",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="locationsearch"
        options={{
          title: "Location Search",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="editreflection"
        options={{
          title: "Edit Reflection",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="userprofile"
        options={{
          title: "User Profile",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
