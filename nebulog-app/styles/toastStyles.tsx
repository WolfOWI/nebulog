import React from "react";
import { BaseToast, ErrorToast, ToastConfig } from "react-native-toast-message";
import Toast from "react-native-toast-message";
import { View, Text } from "react-native";

export const toastConfig: ToastConfig = {
  /*
   * Overwrite 'success' type
   */
  success: (props) => (
    <View
      style={{
        width: "93%",
        paddingVertical: 24,
        paddingHorizontal: 24,
        marginTop: 16,
        backgroundColor: "#1e293b",
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      }}
    >
      <View>
        {props.text1 && (
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "#22c55e",
              marginBottom: 4,
              marginHorizontal: 0,
              paddingHorizontal: 0,
              width: "100%",
              flexWrap: "wrap",
            }}
          >
            {props.text1}
          </Text>
        )}
        {props.text2 && (
          <Text
            style={{
              fontSize: 16,
              color: "#64748b",
              marginHorizontal: 0,
              paddingHorizontal: 0,
              lineHeight: 22,
              flexShrink: 0,
              width: "100%",
              flexWrap: "wrap",
            }}
          >
            {props.text2}
          </Text>
        )}
      </View>
    </View>
  ),
  /*
   * Overwrite 'error' type - Custom implementation
   */
  error: (props) => (
    <View
      style={{
        width: "93%",
        paddingVertical: 24,
        paddingHorizontal: 24,
        marginTop: 16,
        backgroundColor: "#1e293b",
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      }}
    >
      <View>
        {props.text1 && (
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "#f87171",
              marginBottom: 4,
              marginHorizontal: 0,
              paddingHorizontal: 0,
              width: "100%",
              flexWrap: "wrap",
            }}
          >
            {props.text1}
          </Text>
        )}
        {props.text2 && (
          <Text
            style={{
              fontSize: 16,
              color: "#64748b",
              marginHorizontal: 0,
              paddingHorizontal: 0,
              lineHeight: 22,
              flexShrink: 0,
              width: "100%",
              flexWrap: "wrap",
            }}
          >
            {props.text2}
          </Text>
        )}
      </View>
    </View>
  ),
  /*
   * Overwrite 'info' type
   */
  info: (props) => (
    <View
      style={{
        width: "93%",
        paddingVertical: 24,
        paddingHorizontal: 24,
        marginTop: 16,
        backgroundColor: "#1e293b",
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      }}
    >
      <View>
        {props.text1 && (
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "#7dd3fc",
              marginBottom: 4,
              marginHorizontal: 0,
              paddingHorizontal: 0,
              width: "100%",
              flexWrap: "wrap",
            }}
          >
            {props.text1}
          </Text>
        )}
        {props.text2 && (
          <Text
            style={{
              fontSize: 16,
              color: "#64748b",
              marginHorizontal: 0,
              paddingHorizontal: 0,
              lineHeight: 22,
              flexShrink: 0,
              width: "100%",
              flexWrap: "wrap",
            }}
          >
            {props.text2}
          </Text>
        )}
      </View>
    </View>
  ),
  /*
   * Overwrite 'warning' type
   */
  warning: (props) => (
    <View
      style={{
        width: "93%",
        paddingVertical: 24,
        paddingHorizontal: 24,
        marginTop: 16,
        backgroundColor: "#1e293b",
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      }}
    >
      <View>
        {props.text1 && (
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: "#f59e0b",
              marginBottom: 4,
              marginHorizontal: 0,
              paddingHorizontal: 0,
              width: "100%",
              flexWrap: "wrap",
            }}
          >
            {props.text1}
          </Text>
        )}
        {props.text2 && (
          <Text
            style={{
              fontSize: 16,
              color: "#64748b",
              marginHorizontal: 0,
              paddingHorizontal: 0,
              lineHeight: 22,
              flexShrink: 0,
              width: "100%",
              flexWrap: "wrap",
            }}
          >
            {props.text2}
          </Text>
        )}
      </View>
    </View>
  ),
};
