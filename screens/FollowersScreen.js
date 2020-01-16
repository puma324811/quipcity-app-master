import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  ListView,
  RefreshControl,
  SegmentedControlIOS,
  StatusBar,
  Platform,
  TouchableNativeFeedback,
  TouchableOpacity,
  Linking,
  AsyncStorage,
} from "react-native";
import { Facebook } from "expo";
import QuipCity from "../quipcity.js";
import UserCache from "../util/UserCache.js";
import CurrentRouteEmitter from "../util/CurrentRouteEmitter.js";
import ProfilePhoto from "../components/ProfilePhoto.js";

import FollowButton from "../components/FollowButton.js";
import shallowEqual from "../util/shallowEqual.js";
import colors from "../constants/colors.js";

const Touchable = Platform.OS === "android"
  ? TouchableNativeFeedback
  : TouchableOpacity;

export default class FollowersScreen extends React.Component {
  static navigationOptions = props => {
    return {
      headerTitle: props.navigation.state.params.type,
    };
  };
  constructor(props) {
    super(props);

    this._renderUser = this._renderUser.bind(this);
    this._onRefresh = this._onRefresh.bind(this);
    this._getData = this._getData.bind(this);
    this._onPress = this._onPress.bind(this);
    this._changeIFollow = this._changeIFollow.bind(this);

    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => {
        return true;
        // return r1.i_follow != r2.i_follow;
        // return !shallowEqual(r1, r2);
      },
    });

    this.tab = props.navigation.state.params.tab;
    this.username = props.navigation.state.params.username;
    this.type = props.navigation.state.params.type;

    this.state = {
      selectedIndex: 0,
      rows: this.ds.cloneWithRows([]),
      rowData: [],
      refreshing: false,
    };
  }
  _componentIsVisible() {
    this._getData();
  }
  _onRefresh() {
    this._getData();
  }
  componentDidMount() {
    this._componentIsVisible();
  }
  _changeIFollow(id, i_follow) {
    for (let i = 0; i < this.state.rowData.length; i++) {
      let row = this.state.rowData[i];
      console.log(row);
      if (row.id === id) {
        row.i_follow = i_follow;
        console.log(this.state.rowData);
        this.setState({
          rowData: this.state.rowData,
          rows: this.state.rows.cloneWithRows(this.state.rowData),
        });
        break;
      }
    }
  }
  _onPress(user) {
    if (user.i_follow) {
      return () => {
        Alert.alert(
          "Unfollow",
          "Are you sure you want to unfollow " + user.username,
          [
            {
              text: "OK",
              onPress: () => {
                QuipCity.unfollow(
                  this.type == "following" ? user.following_id : user.user_id
                ).then(() => {
                  this._changeIFollow(user.id, false);
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
      return () => {
        QuipCity.follow(
          this.type == "following" ? user.following_id : user.user_id
        ).then(() => {
          this._changeIFollow(user.id, true);
        });
      };
    }
  }
  _renderFollowButton(user) {
    if (user.username !== UserCache.get().username) {
      return (
        <FollowButton
          active={!user.i_follow}
          text={user.i_follow ? "Following" : "Follow"}
          onPress={this._onPress(user)}
        />
      );
    }
  }
  _renderUser(user) {
    return (
      <View
        style={{
          padding: 10,
          paddingLeft: 20,
          paddingRight: 20,
          borderBottomWidth: 1,
          borderBottomColor: colors.lightGreen,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Touchable
            onPress={() => {
              this.props.navigation.navigate(`${this.tab}Profile`, {
                username: user.username,
                tab: this.tab,
              });
            }}
            style={{
              flexDirection: "row",
            }}
          >
            <ProfilePhoto
              user={user}
              style={{ height: 25, width: 25, marginRight: 10, marginTop: 5 }}
            />
            <View>
              <Text style={{ fontWeight: "bold" }}>{user.username}</Text>
              <Text style={{ color: colors.grey }}>{user.name}</Text>
            </View>
          </Touchable>
        </View>
        <View>
          {this._renderFollowButton(user)}
        </View>
      </View>
    );
  }
  _getData() {
    this.setState({
      refreshing: true,
    });

    QuipCity[this.type](this.username).then(users => {
      this.setState({
        rows: this.state.rows.cloneWithRows(users),
        rowData: users,
        refreshing: false,
      });
    });
  }
  componentWillUnmount() {}
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <ListView
          ref="listview"
          style={{ flex: 1 }}
          enableEmptySections={true}
          dataSource={this.state.rows}
          removeClippedSubviews={false} //https://github.com/facebook/react-native/issues/1831
          initialListSize={10}
          renderRow={this._renderUser}
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
