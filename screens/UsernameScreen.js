import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ListView,
  StatusBar,
  TextInput,
  Linking,
  AsyncStorage,
} from "react-native";
import { Facebook } from "expo";
import QuipCity from "../quipcity.js";
import CurrentRouteEmitter from "../util/CurrentRouteEmitter.js";
import Link from "../components/Link.js";

export default class UsernameScreen extends React.Component {
  constructor(props) {
    super(props);

    this._updateUser = this._updateUser.bind(this);

    this.state = {
      username: "",
      error: "",
    };
  }
  _componentIsVisible() {
    this.refs.input.focus();
  }
  componentDidMount() {
    this._componentIsVisible();
  }
  componentWillUnmount() {}
  _updateUser() {
    QuipCity.update_user({ username: this.state.username })
      .then(() => {
        this.props.navigation.navigate("App");
      })
      .catch(() => {
        this.setState({
          error: "That username is taken. Please try again.",
        });
      });
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={{ color: "red" }}>{this.state.error}</Text>
        <Text>Set Your Username</Text>
        <View
          style={{
            height: 55,
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: "#274D00",
            marginBottom: 200,
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
              placeholder="..."
              value={this.state.username}
              ref="input"
              multiline={true}
              onChangeText={username =>
                this.setState({ username: username.toLowerCase() })}
            />
          </View>
          <View>
            <Link
              title={"Submit"}
              buttonStyle={{
                backgroundColor: "#274D00",
                borderRadius: 5,
                borderWidth: 1,
                borderColor: "#274D00",
                width: 78,
                overflow: "hidden",
                height: 37,
                margin: 10,
              }}
              textStyle={{
                color: "white",
              }}
              onPress={this._updateUser}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
