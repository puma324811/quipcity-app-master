import React from "react";
import {
  Text,
  Alert,
  Image,
  View,
  Share,
  Platform,
  TouchableNativeFeedback,
  TouchableOpacity,
  Button,
} from "react-native";

import Link from "./Link.js";
import QuipCity from "../quipcity.js";
import ProfilePhoto from "./ProfilePhoto.js";
import colors from "../constants/colors.js";
import moment from "moment";

const Touchable = Platform.OS === "android"
  ? TouchableNativeFeedback
  : TouchableOpacity;

export default class Quip extends React.Component {
  constructor(props) {
    super(props);
    this._renderCommentLink = this._renderCommentLink.bind(this);
    this._renderGarbage = this._renderGarbage.bind(this);
    this.state = props.quip;

    this.state.lastPress = 0;
  }

  _onVote() {
    QuipCity.vote(this.state.id);
    this.setState({
      i_voted: 1,
      vote_count: this.state.vote_count + 1,
    });
  }

  _onUnVote() {
    QuipCity.unvote(this.state.id);
    this.setState({
      i_voted: 0,
      vote_count: this.state.vote_count - 1,
    });
  }
  _renderGarbage() {
    if (this.props.showDelete) {
      return (
        <View
          style={{
            padding: 0,
          }}
        >
          <Touchable
            style={{
              flexDirection: "row",
              padding: 8,
              paddingTop: 8,
            }}
            onPress={() => {
              Alert.alert(
                "Delete Quip",
                "Are you sure you want to delete this Quip?",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      this.props.onDeleteQuip(this.props.quip);
                    },
                  },
                  {
                    text: "Cancel",
                    onPress: () => {},
                    style: "cancel",
                  },
                ],
                { cancelable: true }
              );
            }}
          >
            <Image source={require("../images/garbage.png")} />
          </Touchable>
        </View>
      );
    }
  }
  _renderCommentLink() {
    if (this.props.noComments === true) {
      return;
    }
    return (
      <View
        style={{
          padding: 0,
        }}
      >
        <Touchable
          style={{
            flexDirection: "row",
            padding: 8,
          }}
          onPress={() => {
            this.props.onCommentClick(this.props.quip);
          }}
        >
          <Image source={require("../images/comments.png")} />
          <Text
            style={{
              paddingLeft: 5,
              color: "#999",
              fontSize: 13,
              paddingTop: 2,
            }}
          >
            {`${this.props.quip.comment_count} comments`}
          </Text>
        </Touchable>
      </View>
    );
  }
  componentWillReceiveProps(props) {
    this.setState(props.quip);
  }
  render() {
    const quip = this.props.quip;

    let duration = moment.duration(moment.utc().diff(moment.utc(quip.created_at)));
    let hours = Math.floor(duration.asHours());
    let ts;
    if (hours < 48) {
      quip.username = null;
      quip.picture = null;
      ts = `${hours}h`;
    } else {
      ts = moment.utc(quip.created_at).fromNow(true);
    }

    return (
      <View
        style={[
          {
            borderBottomWidth: 1,
            borderBottomColor: colors.lightGreen,
          },
          this.props.containerStyle,
        ]}
      >
        <View
          style={{
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 20,
            paddingBottom: 10,
            flexDirection: "column",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              paddingBottom: 8,
              borderWidth: 0,
              borderColor: "black",
            }}
          >
            <Touchable
              style={{ flexDirection: "row", flex: 1 }}
              onPress={() => {
                if (quip.username) {
                  this.props.onUsernameClick(quip.username);
                } else {
                  Alert.alert(
                    "Quips are anonymous for the first 48 hours.  Read more on how it works in your profile About section."
                  );
                }
              }}
            >
              <ProfilePhoto
                user={{ picture: quip.picture }}
                style={{ height: 20, width: 20 }}
              />
              <Text
                style={{
                  flex: 1,
                  height: 20,
                  fontSize: 13,
                  borderWidth: 0,
                  borderColor: "black",
                  marginTop: 4,
                  marginLeft: 2,
                  color: "#999",
                }}
              >
                {" "}{quip.username || "anonymous"}
              </Text>
            </Touchable>
            <Text
              style={{
                color: "#999",
                marginTop: 4,
                fontSize: 13,
              }}
            >
              {ts}
            </Text>
          </View>
          <View>
            <View style={{}}>
              <Text
                style={{ fontSize: 17 }}
                selectable={true}
                onPress={() => {
                  var delta = new Date().getTime() - this.state.lastPress;

                  if (delta < 200) {
                    this.state.i_voted == 0 ? this._onVote() : this._onUnVote();
                  }

                  this.setState({
                    lastPress: new Date().getTime(),
                  });
                }}
              >
                {quip.body}
              </Text>
            </View>
          </View>
          <View
            style={{
              paddingTop: 10,
              paddingBottom: 0,
              borderColor: "black",
              borderWidth: 0,
              flexDirection: "row",
            }}
          >
            <Touchable
              style={{
                flexDirection: "row",
                paddingTop: 8,
                paddingBottom: 8,
              }}
              onPress={() => {
                this.state.i_voted == 0 ? this._onVote() : this._onUnVote();
              }}
            >
              <Image
                source={
                  this.state.i_voted == 0
                    ? require("../images/heart-empty.png")
                    : require("../images/heart-full.png")
                }
              />
              <Text style={{ fontSize: 13, paddingLeft: 5, paddingTop: 2 }}>
                {this.state.vote_count}
              </Text>
            </Touchable>
            {this._renderCommentLink()}
            <View
              style={{
                padding: 0,
              }}
            >
              <Touchable
                style={{
                  flexDirection: "row",
                  padding: 8,
                  paddingTop: 10,
                }}
                onPress={() => {
                  Share.share({
                    message: quip.body,
                  });
                }}
              >
                <Image source={require("../images/share.png")} />
              </Touchable>
            </View>
            {this._renderGarbage()}
          </View>
        </View>
      </View>
    );
  }
}
