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

export default class NotificationsScreen extends React.Component {
  constructor(props) {
    super(props);

    this._renderNotification = this._renderNotification.bind(this);
    this._onRefresh = this._onRefresh.bind(this);
    this._segmentChange = this._segmentChange.bind(this);

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
  _segmentChange(event) {
    let index = event.nativeEvent.selectedSegmentIndex;
    this.setState({ selectedIndex: index });
    this._getData(index);
  }
  _renderNotification(notification) {
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
        <View
          style={{
            borderBottomWidth: 1,
            borderColor: colors.green,
            backgroundColor: 'white',
          }}
        >
          <SegmentedControlIOS
            values={["Following", "You"]}
            tintColor="#274D00"
            style={{
              margin: 50,
              marginTop: 30,
              marginBottom: 10,
            }}
            selectedIndex={this.state.selectedIndex}
            onChange={this._segmentChange}
          />
        </View>
        <ListView
          ref="listview"
          style={{ flex: 1, backgroundColor: 'white' }}
          enableEmptySections={true}
          dataSource={this.state.rows}
          removeClippedSubviews={false} //https://github.com/facebook/react-native/issues/1831
          initialListSize={10}
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
