import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  ListView,
  StatusBar,
  Linking,
  AsyncStorage
} from "react-native";
import { Facebook } from "expo";
import QuipCity from "../quipcity.js";
import CurrentRouteEmitter from "../util/CurrentRouteEmitter.js";
import { NavigationActions } from "react-navigation";
import Link from "../components/Link.js";
import colors from "../constants/colors.js";
import { KeyboardAwareView } from "react-native-keyboard-aware-view";

const PLACEHOLDERS = [
  "What's on your mind?",
  "Start typing your quip...",
  "Quip it, quip it good"
];

const CHAR_LIMIT = 300;

export default class ComposeScreen extends React.Component {
  static navigationOptions = props => {
    return {
      headerBackTitle: null,
      headerTitle: "Compose",
      headerStyle: {
        backgroundColor: 'white',
        borderBottomColor: colors.green,
        borderBottomWidth: 1
      },
      headerLeft: <View />,
      headerRight: (
        <Button
          title={"Back"}
          onPress={() => {
            props.navigation.setParams({ editing: false });
          }}
        />
      )
    };
  };
  constructor(props) {
    super(props);
    this._submitQuip = this._submitQuip.bind(this);
    this._closeView = this._closeView.bind(this);
    this.state = {
      text: "",
      placeholder: PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)],
      buttonText: "Quip",
    };
  }
  _componentIsVisible() {
    // this.refs.input.focus()
  }
  componentDidMount() {
    this._mounted = true;
    this._subscription = CurrentRouteEmitter.addListener(
      "change",
      routeName => {
        console.log(routeName);
        if (routeName === "Compose") {
          this._mounted && this._componentIsVisible();
        } else {
          if (this.refs.input) {
            this.refs.input.blur();
          }
        }
      }
    );
  }
  _closeView() {
    this.refs.input.blur();
    this.props.navigation.goBack();
  }
  componentWillReceiveProps(props) {
    let params = props.navigation.state.params;
    if (params) {
      if (params.editing === false) {
        this._closeView();
      }
    }
  }
  _submitQuip() {
    let text = this.state.text;
    if (text.length && text.length <= CHAR_LIMIT) {
      this.setState({ text: "" });
      this.refs.input.blur();
      QuipCity.create(this.state.text).then(() => {
        const resetAction = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: "Home",
              params: { filter: 1 }
            })
          ]
        });
        this.props.navigation.dispatch(resetAction);
      });
      // load until request is made
      // add quip to local store of quips
      // navigate to Feed/New
    }
  }
  componentWillUnmount() {
    this._mounted = false;
  }
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'white', }}>
        <KeyboardAwareView animated={true}>
          <TextInput
            style={{
              height: 40,
              padding: 20,
              fontSize: 16,
              flex: 1
            }}
            placeholder={this.state.placeholder}
            value={this.state.text}
            ref="input"
            multiline={true}
            onChangeText={text => this.setState({ text })}
          />
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: "green",
              height: 60,
              flexDirection: "row"
            }}
          >
            <View
              style={{
                flex: 1,
                padding: 10
              }}
            >
              <Text style={{ fontSize: 12 }}>
                Your Quip will be
                anonymous for the
                first 48 hours.
              </Text>
            </View>
            <View
              style={{
                width: 50,
                paddingTop: 20,
                paddingBottom: 20
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  textAlign: "right",
                  color: this.state.text.length > CHAR_LIMIT ? "red" : "black"
                }}
              >
                {this.state.text.length}
              </Text>
            </View>
            <View>
              <Link
                title={this.state.buttonText}
                buttonStyle={{
                  backgroundColor: colors.green,
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: colors.green,
                  width: 78,
                  overflow: "hidden",
                  height: 37,
                  margin: 10
                }}
                textStyle={{
                  color: "white"
                }}
                onPress={() => {
                  this.setState({buttonText: "Saving..."})
                  this._submitQuip();
                }}
              />
            </View>
          </View>
        </KeyboardAwareView>
      </View>
    );
  }
}
