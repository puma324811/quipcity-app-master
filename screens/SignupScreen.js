import React from "react";
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Image,
  Button,
  Linking,
  TextInput,
  AsyncStorage,
  TouchableOpacity
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
    this._processFBToken = this._processFBToken.bind(this);
    this._handleFBButtonPress = this._handleFBButtonPress.bind(this);
    this._processGoogleToken = this._processGoogleToken.bind(this);
    this._handleGoogleButtonPress = this._handleGoogleButtonPress.bind(this);
    this._handleSignup = this._handleSignup.bind(this);
    this._handleUserChange = this._handleUserChange.bind(this);
    this._handleGoToLoginPress = this._handleGoToLoginPress.bind(this);

    this.state = {
      error: "",
      user: {
        email: '',
        password: '',
        password_confirmation: ''
      },
    };
  }
  _processFBToken(token) {
    let user;
    QuipCity.facebook_signup(token)
      .then(resp => {
        user = resp.user;
        return AsyncStorage.setItem("@QuipCityStore:token", resp.token);
      })
      .then(() => {
        const { navigate } = this.props.navigation;
        if (!user.username) {
          navigate("Username");
        } else {
          navigate("App");
        }
      })
      .catch(err => {});
  }
  _handleFBButtonPress() {
    Facebook.logInWithReadPermissionsAsync("1282207108532465", {
      behavior: Constants.appOwnership == "standalone" ? "native" : "web",
      permissions: ["public_profile", "email", "user_friends"],
    })
      .then(resp => {
        let { type, token } = resp;
        console.log(type, token);
        if (type === "success") {
          this._processFBToken(token);
        }
      })
      .catch(err => {
        console.log(err);
        this.setState({
          error: "There was an error logging into the account. Please try again.",
        });
      });
  }
  _handleGoogleButtonPress() {
    Google.logInAsync({
      scopes: ["profile", "email"],
      iosClientId: "324560700149-fgal2m68oacn2u2o7vnnkjrlialpbjpm.apps.googleusercontent.com",
      iosStandaloneAppClientId: "324560700149-re7kqvd4gv1s2itbecu6p41h047brc8d.apps.googleusercontent.com",
    })
      .then(result => {
        if (result.type === "success") {
          this._processGoogleToken(result.accessToken);
        } else {
          return { cancelled: true };
        }
      })
      .catch(err => {
        console.log(err);
        this.setState({
          error: "There was an error logging into the account. Please try again.",
        });
      });
  }
  _processGoogleToken(token) {
    let user;
    QuipCity.google_signup(token)
      .then(resp => {
        user = resp.user;
        return AsyncStorage.setItem("@QuipCityStore:token", resp.token);
      })
      .then(() => {
        const { navigate } = this.props.navigation;
        if (!user.username) {
          navigate("Username");
        } else {
          navigate("App");
        }
      })
      .catch(err => {});
  }
  _handleUserChange(field, value) {
    this.setState({
      user: {
        ...this.state.user,
        [field]: value
      }
    })
  }
  _handleSignup() {
    const { user } = this.state;
    QuipCity.signup(user)
      .then(() => {
        const { navigate } = this.props.navigation;
        console.log('Successfully signed up!')
        navigate("SubConfirmation", { user });
      })
      .catch(err => {
        err.json().then(data => {
          console.log(data)
          this.setState({
            error: data.error,
          });
        });
      });
  }
  _handleGoToLoginPress() {
    const { navigate } = this.props.navigation;
    navigate("SubLogin");
  }
  render() {
    const { user } = this.state
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
        <Image
          style={{ width: 140, height: 50 }}
          source={require("../images/logo.png")}
        />
        <Text style={{ color: "red", width: '50%' }}>{this.state.error}</Text>

        <TextInput
          style={{ padding: 12, width: '50%' }}
          value={user.email}
          returnKeyType="next"
          multiline={false}
          placeholder='Email'
          onChangeText={value => this._handleUserChange('email', value)}
          onSubmitEditing={() => this.passwordField.focus()}
        />
        <TextInput
          style={{ padding: 12, width: '50%' }}
          value={user.password}
          ref={ref => (this.passwordField = ref)}
          placeholder='Password'
          returnKeyType="next"
          secureTextEntry={true}
          autoCapitalize={'none'}
          textContentType={'password'}
          onChangeText={value => this._handleUserChange('password', value)}
          onSubmitEditing={() => this.passwordConfirmationField.focus()}
        />
        <TextInput
          style={{ padding: 12, width: '50%' }}
          value={user.password_confirmation}
          ref={ref => (this.passwordConfirmationField = ref)}
          placeholder='Password confirmation'
          returnKeyType="done"
          secureTextEntry={true}
          autoCapitalize={'none'}
          textContentType={'password'}
          onChangeText={value => this._handleUserChange('password_confirmation', value)}
          onSubmitEditing={this._handleSignup}
        />
        <View style={{margin:7}} />
        <Link 
          onPress={this._handleSignup}
          title="Sign up"
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

        <Link
          title="Log In With Facebook"
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
          onPress={this._handleFBButtonPress}
        />

        <TouchableOpacity
          style={{marginTop: 10}}
          onPress={this._handleGoToLoginPress}
        >
          <Text
            style={{color: '#808080'}}
          >
            I already have an account
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
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


