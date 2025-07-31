export default {
  expo: {
    name: "nebulog",
    slug: "nebulog",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/nebulog-main-icon.png",
    scheme: "myapp",
    userInterfaceStyle: "dark",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      icon: "./assets/images/nebulog-ios-notif-icon.png",
      splash: {
        image: "./assets/images/nebulog-splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#0F172B",
      },
      config: {
        googleMapsApiKey: process.env.GOOGLE_PLATFORM_API_KEY,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/nebulog-adaptive-icon.png",
        backgroundColor: "#0F172B",
      },
      icon: "./assets/images/nebulog-android-notif-icon.png",
      splash: {
        image: "./assets/images/nebulog-splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#0F172B",
      },
      navigationBarColor: "transparent",
      navigationBarStyle: "dark",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_PLATFORM_API_KEY,
        },
      },
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/nebulog-splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#0F172B",
        },
      ],
      "expo-font",
      "expo-web-browser",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow $(PRODUCT_NAME) to use your location to show it on the map.",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      GOOGLE_PLATFORM_API_KEY: process.env.GOOGLE_PLATFORM_API_KEY,
    },
  },
};
