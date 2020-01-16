import React from "react";
import {
  Text,
  View,
  Platform,
  Button,
  StyleSheet,
  TouchableOpacity,
  TouchableNativeFeedback,
} from "react-native";

const Touchable = Platform.OS === "android"
  ? TouchableNativeFeedback
  : TouchableOpacity;

export default class Link extends React.Component {
  render() {
    const {
      onPress,
      title,
    } = this.props;
    const buttonStyles = [this.props.buttonStyle];
    const textStyles = [styles.text, this.props.textStyle];
    return (
      <Touchable accessibilityComponentType="button" onPress={onPress}>
        <View style={buttonStyles}>
          <Text style={textStyles}>{title}</Text>
        </View>
      </Touchable>
    );
  }
}

const styles = StyleSheet.create({
  button: Platform.select({
    ios: {},
    android: {},
  }),
  text: Platform.select({
    ios: {
      color: "#999",
      textAlign: "center",
      padding: 8,
      fontSize: 14,
    },
    android: {
      textAlign: "center",
      color: "white",
      padding: 8,
      fontWeight: "500",
    },
  }),
  buttonDisabled: Platform.select({
    ios: {},
    android: {},
  }),
  textDisabled: Platform.select({
    ios: {
      color: "#cdcdcd",
    },
    android: {
      color: "#a1a1a1",
    },
  }),
});
