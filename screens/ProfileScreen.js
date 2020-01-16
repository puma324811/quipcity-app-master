import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Alert,
  RefreshControl,
  Button,
  Platform,
  TouchableNativeFeedback,
  TouchableOpacity,
  ListView,
  StatusBar,
  Linking,
  AsyncStorage,
} from "react-native";
import { Facebook } from "expo";
import QuipCity from "../quipcity.js";
import CurrentRouteEmitter from "../util/CurrentRouteEmitter.js";
import ProfilePhoto from "../components/ProfilePhoto.js";
import Quip from "../components/Quip.js";
import UserCache from "../util/UserCache.js";
import style from "../style/profile.js";
import colors from "../constants/colors";
import FollowButton from "../components/FollowButton.js";

const Touchable = Platform.OS === "android"
  ? TouchableNativeFeedback
  : TouchableOpacity;

let openSettings = () => {};

export default class ProfileScreen extends React.Component {
  static navigationOptions = props => {
    let rightButton;
    let state = props.navigation.state;
    if (state.routeName == "Profile") {
      rightButton = (
        <Touchable
          onPress={() => {
            openSettings();
          }}
        >
          <Image
            style={{
              marginRight: 5,
              width: 25,
              height: 25,
            }}
            source={require("../images/cog.png")}
          />
        </Touchable>
      );
    }
    let username;
    if (state.params) {
      username = state.params.username;
    }
    let title = username || "Profile";
    return {
      headerBackTitle: title,
      title: title,
      headerRight: rightButton,
      headerStyle: {
        borderBottomColor: colors.green,
        borderBottomWidth: 1,
        backgroundColor: 'white',
      },
    };
  };
  constructor(props) {
    super(props);

    this._componentIsVisible = this._componentIsVisible.bind(this);
    this._onCommentClick = this._onCommentClick.bind(this);
    this._onUsernameClick = this._onUsernameClick.bind(this);
    this._onDeleteQuip = this._onDeleteQuip.bind(this);
    this._renderHeader = this._renderHeader.bind(this);
    this._renderStatsRow = this._renderStatsRow.bind(this);
    this._getData = this._getData.bind(this);
    this._renderTabButtons = this._renderTabButtons.bind(this);
    this._renderFollowButton = this._renderFollowButton.bind(this);
    this._changeTab = this._changeTab.bind(this);
    this._renderQuip = this._renderQuip.bind(this);
    this._onRefresh = this._onRefresh.bind(this);

    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => {
        return true;
      },
    });

    this.state = {
      user: {
        username: "",
        description: "",
        picture: "",
      },
      tab: "cal",
      rows: this.ds.cloneWithRows([]),
      rawData: this.props.quips,
      refreshing: true,
    };
    if (props.navigation.state.params) {
      this.tab = props.navigation.state.params.tab;
      this.username = props.navigation.state.params.username;
    }
    this.tab = this.tab || "Profile";
  }
  componentDidMount() {
    this._componentIsVisible();
  }
  componentWillUnmount() {}
  componentWillReceiveProps(props) {
    console.log("DFGHJK", props.navigation);
    let params = props.navigation.state.params;
    if (params) {
      if (params.settings === true) {
        props.navigation.setParams({ settings: false });
        props.navigation.navigate("Settings");
      }
    }
  }
  _renderStatsRow(label, themValue, meValue) {
    let cellStyle = {
      borderWidth: 1,
      borderColor: colors.lightGreen,
      flex: 1,
      padding: 5,
      borderTopWidth: 0,
      borderRightWidth: 0,
    };
    let textStyle = {
      textAlign: "center",
    };
    return (
      <View
        style={{
          flexDirection: "row",
          borderRightWidth: 1,
          borderColor: colors.lightGreen,
        }}
      >
        <View style={[cellStyle, { flex: 2 }]}>
          <Text
            style={{
              fontWeight: "bold",
            }}
          >
            {label}
          </Text>
        </View>
        <View
          style={[
            cellStyle,
            "undefined" === typeof themValue ? { borderLeftWidth: 0 } : {},
          ]}
        >
          <Text style={textStyle}>{themValue}</Text>
        </View>
        <View style={cellStyle}>
          <Text
            style={[textStyle, meValue === "Me" ? { fontWeight: "bold" } : {}]}
          >
            {meValue}
          </Text>
        </View>
      </View>
    );
  }
  _renderQuip(quip) {
    if (this.state.tab === "stats" && quip.me) {
      let them = quip.them || {};
      return (
        <View>
          {this._renderStatsRow("", them.quip_count ? "" : undefined, "Me")}
          {this._renderStatsRow(
            "Quip Count",
            them.quip_count,
            quip.me.quip_count
          )}
          {this._renderStatsRow(
            "Avg Likes Per Quip",
            them.likes_per_quip,
            quip.me.likes_per_quip
          )}
          {this._renderStatsRow(
            "Total Likes",
            them.total_likes,
            quip.me.total_likes
          )}
          {this._renderStatsRow(
            "Highest Rated Quip",
            them.highest_rated_quip_vote_count,
            quip.me.highest_rated_quip_vote_count
          )}
          {this._renderStatsRow(
            "Lowest Rated Quip",
            them.lowest_rated_quip_vote_count,
            quip.me.lowest_rated_quip_vote_count
          )}
          {this._renderStatsRow(
            "Followers",
            them.followers_count,
            quip.me.followers_count
          )}
          {this._renderStatsRow(
            "Following",
            them.followers_count,
            quip.me.following_count
          )}
        </View>
      );
    }
    return (
      <Quip
        quip={quip}
        onCommentClick={this._onCommentClick}
        onUsernameClick={this._onUsernameClick}
        showDelete={!Boolean(this.username)}
        onDeleteQuip={this._onDeleteQuip}
      />
    );
  }
  _changeTab(name) {
    this.setState({
      tab: name,
    });
    this._getData(name);
  }
  _componentIsVisible() {
    openSettings = () => {
      this.props.navigation.navigate("Settings");
    };
    this._getData(this.state.tab);
  }
  _onRefresh() {
    this._getData(this.state.tab);
  }
  _getData(tabName) {
    this.setState({ refreshing: true });

    if (this.username) {
      QuipCity.user_user(this.username).then(user => {
        this.setState({
          user: user,
        });
      });
    } else {
      QuipCity.user().then(user => {
        this.setState({
          user: user,
        });
      });
    }

    if (tabName === "stats") {
      return QuipCity.stats(this.username).then(stats => {
        this.setState({
          rows: this.state.rows.cloneWithRows([stats]),
          rowData: [stats],
          refreshing: false,
        });
      });
    } else if (this.username) {
      return QuipCity.user_quips(
        this.username,
        tabName == "order-desc" ? "votes-desc" : null
      ).then(quips => {
        this.setState({
          rows: this.state.rows.cloneWithRows(quips),
          rowData: quips,
          refreshing: false,
        });
      });
    } else {
      return QuipCity.quips(
        tabName == "order-desc" ? "votes-desc" : null
      ).then(quips => {
        this.setState({
          rows: this.state.rows.cloneWithRows(quips),
          rowData: quips,
          refreshing: false,
        });
      });
    }
  }
  _renderFollowButton() {
    let text;
    let active;
    let onPress;
    if (!this.state.user.id) {
      text = "Loading...";
      active = false;
      onPress = () => {};
    } else if (!this.username || this.username == UserCache.get().username) {
      text = "Edit Profile";
      active = false;
      onPress = () => {
        this.props.navigation.navigate("SettingsEdit");
      };
    } else {
      if (this.state.user.i_follow) {
        text = "Following";
        active = false;
        onPress = () => {
          Alert.alert(
            "Unfollow",
            "Are you sure you want to unfollow " + this.username,
            [
              {
                text: "OK",
                onPress: () => {
                  QuipCity.unfollow(this.state.user.id).then(() => {
                    this.state.user.i_follow = false;
                    this.state.user.followers -= 1;
                    this.setState({ user: this.state.user });
                  });
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
        };
      } else {
        text = "Follow";
        active = true;
        onPress = () => {
          QuipCity.follow(this.state.user.id).then(() => {
            this.state.user.i_follow = true;
            this.state.user.followers += 1;
            this.setState({ user: this.state.user });
          });
        };
      }
    }
    return <FollowButton text={text} active={active} onPress={onPress} />;
  }
  _renderTabButtons() {
    let tabs = [
      {
        name: "cal",
        icon: require("../images/cal.png"),
      },
      {
        name: "order-desc",
        icon: require("../images/order-desc.png"),
      },
      {
        name: "stats",
        icon: require("../images/stats.png"),
      },
    ];
    return tabs.map(tab => (
      <Touchable
        key={tab.name}
        style={{
          flex: 1,
          alignItems: "center",
        }}
        onPress={() => {
          this._changeTab(tab.name);
        }}
      >
        <Image
          style={{
            tintColor: this.state.tab == tab.name ? colors.green : colors.grey,
          }}
          source={tab.icon}
        />
      </Touchable>
    ));
  }
  _renderHeader() {
    let description;
    if (this.state.user.description) {
      description = <Text>{this.state.user.description}</Text>;
    }
    return (
      <View>
        <View
          style={{
            borderBottomColor: "#274D00",
            borderBottomWidth: 1,
            flexDirection: "column",
            padding: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingBottom: 10,
            }}
          >
            <ProfilePhoto user={this.state.user} />
            <View>
              <View
                style={{
                  flexDirection: "row",
                  paddingBottom: 5,
                }}
              >
                <View style={style.profileStat.view}>
                  <Text style={style.profileStat.number}>
                    {this.state.user.quips}
                  </Text>
                  <Text style={style.profileStat.label}>quips</Text>
                </View>
                <View style={style.profileStat.view}>
                  <Touchable
                    onPress={() => {
                      this.props.navigation.navigate(
                        `${this.tab || "Profile"}Followers`,
                        {
                          type: "followers",
                          username: this.username,
                          tab: this.tab,
                        }
                      );
                    }}
                  >
                    <Text style={style.profileStat.number}>
                      {this.state.user.followers}
                    </Text>
                    <Text style={style.profileStat.label}>followers</Text>
                  </Touchable>
                </View>
                <View style={style.profileStat.view}>
                  <Touchable
                    onPress={() => {
                      this.props.navigation.navigate(
                        `${this.tab || "Profile"}Followers`,
                        {
                          type: "following",
                          username: this.username,
                          tab: this.tab,
                        }
                      );
                    }}
                  >
                    <Text style={style.profileStat.number}>
                      {this.state.user.following}
                    </Text>
                    <Text style={style.profileStat.label}>following</Text>
                  </Touchable>
                </View>
              </View>
              <View>
                {this._renderFollowButton()}
              </View>
            </View>
          </View>
          <View>
            <Text>{this.state.user.name}</Text>
            {description}
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingBottom: 5,
            paddingTop: 5,
            borderBottomWidth: 1,
            borderBottomColor: colors.green,
          }}
        >
          {this._renderTabButtons()}
        </View>
      </View>
    );
  }
  _onCommentClick(quip) {
    this.props.navigation.navigate(`${this.tab || "Profile"}Quip`, {
      quip: quip,
      tab: this.tab,
    });
  }
  _onUsernameClick(username) {
    this.props.navigation.navigate(`${this.tab || "Profile"}Profile`, {
      username: username,
      tab: this.tab,
    });
  }
  _onDeleteQuip(quip) {
    QuipCity.delete_quip(quip.id).then(() => {
      this._getData();
    });
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <ListView
          style={{ flex: 1, backgroundColor: 'white' }}
          enableEmptySections={true}
          dataSource={this.state.rows}
          initialListSize={10}
          renderRow={this._renderQuip}
          renderHeader={this._renderHeader}
          removeClippedSubviews={false} //https://github.com/facebook/react-native/issues/1831
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          }
        />
      </View>
    );
  }
}
