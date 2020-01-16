import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ListView,
  RefreshControl,
  SegmentedControlIOS,
  StatusBar,
  Linking,
  AsyncStorage,
} from "react-native";
import { Facebook } from "expo";
import QuipCity from "../quipcity.js";
import CurrentRouteEmitter from "../util/CurrentRouteEmitter.js";

import Notification from "../components/Notification.js";
import shallowEqual from "../util/shallowEqual.js";
import colors from "../constants/colors.js";

export default class ProfileFollowingScreen extends React.Component {
  constructor(props) {
    super(props);

    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => {
        return !shallowEqual(r1, r2);
      },
    });

    this.state = {
      selectedIndex: 0,
      rows: this.ds.cloneWithRows([]),
      rowData: [],
      refreshing: false,
    };
  }
  _componentIsVisible() {
    this._getData(this.state.selectedIndex);
  }
  _onRefresh() {
    this._getData(this.state.selectedIndex);
  }
  componentDidMount() {
    this._componentIsVisible();
  }
  _renderFollow(follow) {
    return (
      <View
        style={{
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: colors.lightGreen,
        }}
      >
        <Notification
          notification={notification}
          feedType={this.state.selectedIndex ? "you" : "following"}
          navigation={this.props.navigation}
        />
      </View>
    );
  }
  _getData(selectedIndex) {
    let key;
    if (selectedIndex === 0) {
      key = "notifications_following";
    } else {
      key = "notifications_you";
    }
    this.setState({
      refreshing: true,
    });

    QuipCity[key]().then(notifications => {
      this.setState({
        rows: this.state.rows.cloneWithRows(notifications),
        rowData: notifications,
        refreshing: false,
      });
    });
  }
  componentWillUnmount() {}
  render() {
    console.log(this.state.selectedIndex);
    return (
      <View style={{ flex: 1 }}>
        <ListView
          ref="listview"
          style={{ flex: 1, backgroundColor: 'white' }}
          enableEmptySections={true}
          dataSource={this.state.rows}
          initialListSize={10} //https://github.com/facebook/react-native/issues/1831
          renderRow={this._renderNotification}
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
