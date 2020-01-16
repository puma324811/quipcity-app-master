import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ListView,
  StatusBar,
  Linking,
  AsyncStorage
} from "react-native";
import { Facebook } from "expo";
import QuipCity from "../quipcity.js";
import CurrentRouteEmitter from "../util/CurrentRouteEmitter.js";
import UserCache from "../util/UserCache.js";
import colors from "../constants/colors.js";
import SettingsList from "react-native-settings-list";

const ABOUT_TEXT =
  "QuipCity is a place where anyone " +
  "can submit their humorous thoughts or jokes, called " +
  "Quips. These Quips will be judged by the other users " +
  "in the form of “Likes”. In order to avoid favoritism " +
  "to your friends or frequent users, for the first 48 hours " +
  "you will not know who posted the Quip. This allows " +
  "the Quip to be strictly judged on its quality. After a Quip " +
  "hits the 48 hour mark the user who posted it will be revealed.";

export default class SettingsScreen extends React.Component {
  static navigationOptions = props => {
    return {
      headerTitle: "About",
      headerStyle: {
        borderBottomColor: colors.green,
        borderBottomWidth: 1,
        backgroundColor: "white",
      }
    };
  };
  constructor(props) {
    super(props);
    this.state = {};
  }
  _componentIsVisible() {}
  componentDidMount() {
    this._componentIsVisible();
  }
  componentWillUnmount() {}
  render() {
    return (
      <View style={{ backgroundColor: "white", flex: 1 }}>
        <View style={{ backgroundColor: "white", flex: 1 }}>
          <SettingsList borderColor="#c8c7cc">
            <SettingsList.Header headerStyle={{ marginTop: 15 }} />
            <SettingsList.Header
              headerText={ABOUT_TEXT}
              headerStyle={{ padding: 10 }}
            />
          </SettingsList>
        </View>
      </View>
    );
  }
}
