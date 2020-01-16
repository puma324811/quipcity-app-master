import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  ListView,
  StatusBar,
  Linking,
  TouchableNativeFeedback,
  TouchableOpacity,
  Platform,
  AsyncStorage,
} from "react-native";
import { Facebook } from "expo";
import QuipCity from "../quipcity.js";
import CurrentRouteEmitter from "../util/CurrentRouteEmitter.js";
import ProfilePhoto from "../components/ProfilePhoto.js";
import Link from "../components/Link.js";
import Quip from "../components/Quip.js";
import colors from "../constants/colors.js";

import { KeyboardAwareView } from "react-native-keyboard-aware-view";

const Touchable = Platform.OS === "android"
  ? TouchableNativeFeedback
  : TouchableOpacity;

export default class QuipScreen extends React.Component {
  static navigationOptions = {
    title: "Quip",
    headerBackTitle: "Quip",
    headerStyle: {
      borderBottomColor: colors.green,
      borderBottomWidth: 1,
      backgroundColor: 'white',
    },
  };

  constructor(props) {
    super(props);

    console.log(props);

    this._updateComments = this._updateComments.bind(this);
    this._renderHeader = this._renderHeader.bind(this);
    this._createComment = this._createComment.bind(this);
    this._renderComment = this._renderComment.bind(this);
    this._componentIsVisible = this._componentIsVisible.bind(this);

    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => {
        r1.id !== r2.id;
      },
    });

    this.quip = props.navigation.state.params.quip;
    this.tab = props.navigation.state.params.tab;
    if (!this.quip.id) {
      // 404
    }
    this.state = {
      commentText: "",
      rawComments: [],
      comments: this.ds.cloneWithRows([]),
      quip: this.quip,
    };
  }
  _componentIsVisible() {
    if (!this.state.quip.vote_count) {
      QuipCity.quip(this.state.quip.id).then(quip => {
        this.setState({ quip: quip });
      });
    }
    QuipCity.comments(this.state.quip.id).then(comments => {
      console.log(comments);
      this._updateComments(comments);
    });
  }
  componentDidMount() {
    this._mounted = true;
    this._componentIsVisible();
  }
  _renderComment(comment) {
    return (
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <View
          style={{
            width: 55,
            height: 55,
          }}
        >
          <Touchable
            onPress={() => {
              this.props.navigation.navigate(this.tab + "Profile", {
                tab: this.tab,
                username: comment.username,
              });
            }}
          >
            <ProfilePhoto
              user={{ picture: comment.picture }}
              style={{ width: 25, height: 25, margin: 20 }}
            />
          </Touchable>
        </View>
        <View
          style={{
            flex: 1,
            borderBottomWidth: 1,
            borderBottomColor: colors.lightGreen,
            padding: 18,
            paddingLeft: 5,
            paddingRight: 5,
            flexDirection: "row",
          }}
        >
          <Text>
            <Text
              style={{ fontWeight: "bold" }}
              onPress={() => {
                this.props.navigation.navigate(this.tab + "Profile", {
                  tab: this.tab,
                  username: comment.username,
                });
              }}
            >
              {comment.username}
            </Text>
            {" " + comment.body}
          </Text>
        </View>
      </View>
    );
  }
  _updateComments(comments) {
    this.setState({
      rawComments: comments,
      comments: this.ds.cloneWithRows(comments),
    });
  }
  _createComment() {
    if (this.state.commentText) {
      this.setState({ commentText: "" });
      QuipCity.comment(
        this.state.quip.id,
        this.state.commentText
      ).then(comment => {
        this.refs.input.blur();
        this.state.rawComments.push(comment);
        this._updateComments(this.state.rawComments);
      });      
    }
  }
  _renderHeader() {
    return (
      <Quip
        containerStyle={{ borderBottomColor: colors.green }}
        quip={this.state.quip}
        singleView={true}
        noComments={true}
      />
    );
  }
  componentWillUnmount() {
    this.refs.input.blur();
    this._mounted = false;
  }
  render() {
    return (
      <View
        style={{
          flex: 1,
        }}
      >
        <KeyboardAwareView animated={true}>
          <ListView
            style={{ flex: 6, backgroundColor: 'white' }}
            enableEmptySections={true}
            dataSource={this.state.comments}
            removeClippedSubviews={false} //https://github.com/facebook/react-native/issues/1831
            initialListSize={10}
            renderRow={this._renderComment}
            renderHeader={this._renderHeader}
          />
          <View
            style={{
              height: 55,
              flexDirection: "row",
              borderTopWidth: 1,
              borderTopColor: colors.green,
              backgroundColor: "white",
            }}
          >
            <View style={{ flex: 1 }}>
              <TextInput
                style={{
                  height: 40,
                  padding: 12,
                  fontSize: 16,
                  flex: 1,
                }}
                placeholder="Add a comment..."
                value={this.state.commentText}
                ref="input"
                multiline={true}
                onChangeText={commentText => this.setState({ commentText })}
              />
            </View>
            <View>
              <Link
                title={"Post"}
                buttonStyle={{
                  backgroundColor: colors.green,
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: colors.green,
                  width: 78,
                  overflow: "hidden",
                  height: 37,
                  margin: 10,
                }}
                textStyle={{
                  color: "white",
                }}
                onPress={this._createComment}
              />
            </View>
          </View>
        </KeyboardAwareView>
      </View>
    );
  }
}
