import React from "react";
import {
  StyleSheet,
  Text,
  ActionSheetIOS,
  View,
  TouchableOpacity,
  Platform,
  Image,
  RefreshControl,
  TouchableNativeFeedback,
  Button,
  ListView,
  StatusBar,
  Linking,
  AsyncStorage,
  ActivityIndicator,
} from "react-native";

import { Facebook, Constants } from "expo";
import QuipCity from "../quipcity.js";
import CurrentRouteEmitter from "../util/CurrentRouteEmitter.js";
import Quip from "../components/Quip.js";
import Link from "../components/Link.js";
import { NavigationActions } from "react-navigation";
import TimerMixin from "react-timer-mixin";
import reactMixin from "react-mixin";
import colors from "../constants/colors";
import checkPushNotifications from "../util/checkPushNotifications.js";

import shallowEqual from "../util/shallowEqual.js";

const Touchable = Platform.OS === "android"
  ? TouchableNativeFeedback
  : TouchableOpacity;

const filters = [
  "Top - 48 Hrs",
  "Hot",
  "New Quips",
  "Recently Revealed",
  "Top All Time",
];

export default class FeedScreen extends React.Component {
  static navigationOptions = {
    title: "QuipCity",
    headerBackTitle: "Feed",
    headerTitle: (
      <Image
        style={{ width: 85, height: 30 }}
        source={require("../images/logo.png")}
      />
    ),
    headerStyle: {
      borderBottomColor: colors.green,
      borderBottomWidth: 1,
      backgroundColor: 'white',
    },
  };

  static mixins = [TimerMixin];

  constructor(props) {
    super(props);

    this._componentIsVisible = this._componentIsVisible.bind(this);
    this._renderQuip = this._renderQuip.bind(this);
    this._onCommentClick = this._onCommentClick.bind(this);
    this._onUsernameClick = this._onUsernameClick.bind(this);
    this._getFeed = this._getFeed.bind(this);
    this._changeFilter = this._changeFilter.bind(this);
    this._abortToSignup = this._abortToSignup.bind(this);
    this._showFilters = this._showFilters.bind(this);

    let params = props.navigation.state.params || {};

    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => {
        return true;
      },
    });

    this.state = {
      isReady: false,
      feed: [],
      rows: this.ds.cloneWithRows([]),
      refreshing: true,
      filter: filters[params.filter || 0],
    };
  }
  componentWillReceiveProps(props) {
    let params = props.navigation.state.params;
    if (params) {
      if (
        params.filter >= 0 &&
        params.filter <= 3 &&
        params.filter != this.state.filter
      ) {
        this._changeFilter(params.filter);
      }
    }
  }
  _showFilters() {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: filters,
      },
      buttonIndex => {
        this._changeFilter(buttonIndex);
      }
    );
  }
  _changeFilter(buttonIndex) {
    this.setState({
      filter: filters[buttonIndex],
      refreshing: true,
      feed: [],
      rows: this.state.rows.cloneWithRows([]),
    });
    this._getFeed(buttonIndex);
  }
  componentDidMount() {
    this._mounted = true;
    this._componentIsVisible();
  }
  _abortToSignup() {
    this.setTimeout(() => {
      this.props.navigation.navigate("Signup");
    }, 100);
  }
  componentWillUnmount() {
    this._mounted = false;
  }
  _getFeed(filterIndex) {
    filter = this.state.filter;
    if (filterIndex >= 0 && filterIndex < filters.length) {
      filter = filters[filterIndex];
    }
    this.setState({ refreshing: true });
    return QuipCity.feed(this.state.filter).then(feed => {
      this.setState({
        rows: this.state.rows.cloneWithRows(feed),
        feed: feed,
        refreshing: false,
      });
    });
  }
  _onCommentClick(quip) {
    this.props.navigation.navigate("FeedQuip", { quip: quip, tab: "Feed" });
  }
  _onUsernameClick(username) {
    this.props.navigation.navigate("FeedProfile", {
      username: username,
      tab: "Feed",
    });
  }
  _componentIsVisible() {
    QuipCity.user()
      .then(user => {
        if (!user.username) {
          this.props.navigation.navigate("Username");
        } else {
          this._getFeed();
          checkPushNotifications();
        }
        this.setState({isReady: true})
      })
      .catch(error => {
        if (error.status === 400) {
          this._abortToSignup();
        }
      });
  }
  _renderQuip(quip) {
    return (
      <Quip
        quip={quip}
        onCommentClick={this._onCommentClick}
        onUsernameClick={this._onUsernameClick}
      />
    );
  }

  render() {
    if (!this.state.isReady) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'white' }}>
          <ActivityIndicator size="large" />
        </View>
      )
    }
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            height: 30,
            backgroundColor: colors.green,
            borderBottomWidth: 1,
            borderBottomColor: colors.green,
          }}
        >
          <Touchable
            accessibilityComponentType="button"
            onPress={this._showFilters}
          >
            <View style={{ flexDirection: "row", padding: 8 }}>
              <Text style={{ color: "white" }}>{this.state.filter}</Text>
              <Image
                source={require("../images/down-arrow.png")}
                style={{ tintColor: "white" }}
              />
            </View>
          </Touchable>
        </View>
        <ListView
          style={{ flex: 1, backgroundColor: "white" }}
          enableEmptySections={true}
          dataSource={this.state.rows}
          removeClippedSubviews={false} //https://github.com/facebook/react-native/issues/1831
          initialListSize={10}
          renderRow={this._renderQuip}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._getFeed}
            />
          }
        />
      </View>
    );
  }
}

reactMixin(FeedScreen.prototype, TimerMixin);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
