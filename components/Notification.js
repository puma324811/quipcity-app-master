import React from "react";
import {
  View,
  Text,
  Platform,
  TouchableNativeFeedback,
  TouchableOpacity
} from "react-native";
import moment from "moment";

import ProfilePhoto from "../components/ProfilePhoto.js";
import FollowButton from "../components/FollowButton.js";
import colors from "../constants/colors.js";

const Touchable = Platform.OS === "android"
  ? TouchableNativeFeedback
  : TouchableOpacity;

const TEXTS = {
  "following-vote": "liked a quip",
  "following-comment": "left a comment",
  "following-quip": "had a quip hit 48 hours",
  "you-vote": "liked your quip",
  "you-follow": "started following you",
  "you-comment": "commented on your quip"
};

export default class Notification extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentWillReceiveProps() {}
  _renderBody(key) {
    if (key === "you-follow") {
      return;
    } else {
      let fontSize = 17;
      if (key === "following-comment" || key === "you-comment") {
        fontSize = 14;
      }
      return (
        <View style={{ marginTop: 10 }}>
          <Text
            style={{ fontSize: fontSize }}
            selectable={true}
            onPress={() => {
              this.props.navigation.navigate("FollowingQuip", {
                quip: { id: this.props.notification.quip_id },
                tab: "Following"
              });
            }}
          >
            {this.props.notification.body}
          </Text>
        </View>
      );
    }
  }
  render() {
    let key = this.props.feedType + "-" + this.props.notification.type;
    let date = moment.utc(this.props.notification.created_at).fromNow(true)
    return (
      <View>
        <View style={{ flexDirection: "row" }}>
          <Touchable
            onPress={() => {
              this.props.navigation.navigate("FollowingProfile", {
                username: this.props.notification.username,
                tab: "Following"
              });
            }}
          >
            <ProfilePhoto
              style={{ width: 25, height: 25, marginRight: 10 }}
              user={this.props.notification}
            />
          </Touchable>
          <Text style={{ color: colors.grey, paddingTop: 5 }}>
            <Text
              style={{ fontWeight: "bold", color: "black" }}
              onPress={() => {
                this.props.navigation.navigate("FollowingProfile", {
                  username: this.props.notification.username,
                  tab: "Following"
                });
              }}
            >
              {this.props.notification.username + " "}
            </Text>
            {TEXTS[key] + " "}
            {date}
          </Text>
        </View>
        {this._renderBody(key)}
      </View>
    );
  }
}
