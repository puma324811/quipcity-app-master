import React from "react";
import { Image } from "react-native";

export default class ProfilePhoto extends React.Component {
  render() {
    let src;
    if (this.props.user.picture && this.props.user.picture.length) {
      src = { uri: this.props.user.picture };
    } else {
      src = require("../images/anon.png");
    }
    return (
      <Image
        style={[{ width: 50, height: 50 }, this.props.style]}
        source={src}
      />
    );
  }
}
