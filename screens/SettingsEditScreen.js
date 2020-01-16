import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  Button,
  ListView,
  StatusBar,
  Linking,
  AsyncStorage
} from "react-native";
import { Facebook } from "expo";
import QuipCity from "../quipcity.js";
import Link from "../components/Link.js";
import UserCache from "../util/UserCache.js";
import colors from "../constants/colors.js";

export default class SettingsScreen extends React.Component {
  static navigationOptions = params => ({
    headerTitle: "Edit Profile",
    headerStyle: {
      borderBottomColor: colors.green,
      borderBottomWidth: 1,
      backgroundColor: 'white',
    }
  });
  constructor(props) {
    super(props);
    this.state = {
      user: UserCache.get(),
      buttonText: "Save",
      error: ""
    };
  }
  _componentIsVisible() {}
  componentDidMount() {
    this._componentIsVisible();
  }
  componentWillUnmount() {}
  _renderInput(name, label) {
    return (
      <View
        key={name}
        style={{
          paddingLeft: 5,
          borderTopWidth: 1,
          borderTopColor: "#c8c7cc",
          flexDirection: "row"
        }}
      >
        <View style={{ padding: 0 }}>
          <Text
            style={{
              minWidth: 90,
              height: 40,
              fontWeight: "bold",
              padding: 12
            }}
          >
            {label}
          </Text>
        </View>
        <TextInput
          style={{ height: 40, padding: 10, flex: 1, fontSize: 15 }}
          multiline={name == "description"}
          value={this.state.user[name]}
          onChangeText={text => {
            if (name === "username") {
              text = text.toLowerCase();
            }
            this.state.user[name] = text;
            this.setState({ user: this.state.user });
          }}
        />
      </View>
    );
  }
  render() {
    return (
      <View style={{ backgroundColor: "white", flex: 1 }}>
        <View
          style={{
            backgroundColor: "white",
            borderBottomColor: "#c8c7cc",
            borderBottomWidth: 1,
            marginTop: 30
          }}
        >
          <View
            style={{ padding: 5, paddingLeft: 10, backgroundColor: "white" }}
          >
            <Text>
              {this.state.error}
            </Text>
          </View>
          {[
            ["username", "Username"],
            ["name", "Name"],
            ["description", "Bio"]
          ].map(thing => {
            return this._renderInput(thing[0], thing[1]);
          })}
        </View>
        <Link
          title={this.state.buttonText}
          buttonStyle={{
            backgroundColor: colors.green,
            borderRadius: 5,
            borderWidth: 1,
            borderColor: colors.green,
            overflow: "hidden",
            height: 37,
            margin: 10
          }}
          textStyle={{
            color: "white"
          }}
          onPress={() => {
            QuipCity.update_user(this.state.user)
              .then(() => {
                Alert.alert(
                  'Settings Saved',
                )
                this.setState({ error: "" });
              })
              .catch(errors => {
                messages = JSON.parse(errors._bodyInit);
                let error;
                for (var key in messages) {
                  error = `${messages[key]}`;
                }
                this.setState({ error: error });
              });
          }}
        />

      </View>
    );
  }
}
