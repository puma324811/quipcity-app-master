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

import colors from "../constants/colors.js";

const Touchable = Platform.OS === "android"
  ? TouchableNativeFeedback
  : TouchableOpacity;

export default class FollowButton extends React.Component {
  render() {
    const {
      onPress,
      text,
      active,
    } = this.props;
    let buttonStyles = [styles.button];
    let textStyles = [styles.text];
    if (active) {
      buttonStyles.push(styles.buttonActive);
      textStyles.push(styles.textActive);
    }
    return (
      <Touchable accessibilityComponentType="button" onPress={onPress}>
        <View style={buttonStyles}>
          <Text style={textStyles}>{text}</Text>
        </View>
      </Touchable>
    );
  }
}

const styles = {
  button: {
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 5,
    paddingRight: 20,
    paddingLeft: 20,
    paddingTop: 5,
    paddingBottom: 5,
  },
  buttonActive: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  text: {
    textAlign: "center",
  },
  textActive: {
    color: "white",
  },
};
