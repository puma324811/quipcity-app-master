import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  Linking,
  TextInput,
  AsyncStorage,
} from "react-native";
import { Facebook, Google, Constants } from "expo";
import QuipCity from "../quipcity.js";
import Link from "../components/Link.js";
import colors from "../constants/colors.js";

export default class FeedScreen extends React.Component {
  static navigationOptions = {
    gesturesEnabled: false,
  };
  constructor(props) {
    super(props);
    this._handleGoToLoginPress = this._handleGoToLoginPress.bind(this);
  }
  _handleGoToLoginPress() {
    const { navigate } = this.props.navigation;
    const { user } = this.props.navigation.state.params;
    navigate("SubLogin", { user })
  }
  render() {
    const { user } = this.props.navigation.state.params;
    return (
      <View style={styles.container}>
        <Image
          style={{ width: 140, height: 50 }}
          source={require("../images/logo.png")}
        />
        <Text style={{ width: '80%', marginTop: 10, fontSize: 14, textAlign: 'center' }}>
          {`Confirmation link was sent to ${user.email}`}
        </Text>
        <Text style={{ width: '80%', marginTop: 10, fontSize: 14, textAlign: 'center' }}>
          Please visit it and proceed to login.
        </Text>
        
        <View style={{margin:7}} />
        <Link 
          onPress={this._handleGoToLoginPress}
          title="Next"
          buttonStyle={{
            backgroundColor: colors.green,
            borderRadius: 5,
            borderWidth: 1,
            borderColor: colors.green,
            overflow: "hidden",
            height: 37,
            margin: 10,
            minWidth: '50%',
          }}
          textStyle={{
            color: "white",
          }}
        />
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


