import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  RefreshControl,
  ListView,
  Platform,
  TouchableNativeFeedback,
  TouchableOpacity,
  SegmentedControlIOS,
  StatusBar,
  TextInput,
  Linking,
  AsyncStorage
} from "react-native";
import { Facebook } from "expo";
import QuipCity from "../quipcity.js";
import CurrentRouteEmitter from "../util/CurrentRouteEmitter.js";
import Link from "../components/Link.js";
import ProfilePhoto from "../components/ProfilePhoto.js";
import Quip from "../components/Quip.js";
import colors from "../constants/colors.js";

const Touchable = Platform.OS === "android"
  ? TouchableNativeFeedback
  : TouchableOpacity;

export default class SearchScreen extends React.Component {
  static navigationOptions = {
    headerTitle: "Search",
    headerStyle: {
      borderBottomColor: colors.green,
      borderBottomWidth: 1,
      backgroundColor: "white"
    }
  };
  constructor(props) {
    super(props);
    this._search = this._search.bind(this);
    this._renderHeader = this._renderHeader.bind(this);
    this._renderResult = this._renderResult.bind(this);
    this._segmentChange = this._segmentChange.bind(this);

    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => {
        r1.id !== r2.id;
      }
    });

    this.state = {
      selectedIndex: 0,
      resultsRaw: [],
      refreshing: false,
      search: "",
      results: this.ds.cloneWithRows([])
    };
  }

  _componentIsVisible() {}

  componentDidMount() {
    this._componentIsVisible();
  }

  _search(selectedIndex) {
    console.log(this.state.search.length);
    if (this.state.search.length) {
      this.setState({ refreshing: true });

      if (selectedIndex != 1 && selectedIndex != 0) {
        selectedIndex = this.state.selectedIndex;
      }

      let type;
      if (selectedIndex == 0) {
        type = QuipCity.search_quips;
      } else {
        type = QuipCity.search_users;
      }

      type(this.state.search).then(results => {
        this.setState({
          resultsRaw: results,
          results: this.ds.cloneWithRows(results),
          refreshing: false
        });
      });
    }
  }
  _renderResult(result) {
    if (this.state.selectedIndex == 0) {
      return (
        <Quip
          quip={result}
          onCommentClick={() => {
            this.props.navigation.navigate("SearchQuip", {
              quip: result,
              tab: "Search"
            });
          }}
          onUsernameClick={username => {
            this.props.navigation.navigate("SearchProfile", {
              username: username,
              tab: "Search"
            });
          }}
        />
      );
    } else {
      return (
        <View
          style={{
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: "#274D0030"
          }}
        >
          <Touchable
            style={{
              flexDirection: "row"
            }}
            onPress={() => {
              this.props.navigation.navigate("SearchProfile", {
                username: result.username,
                tab: "Search"
              });
            }}
          >
            <ProfilePhoto
              user={result}
              style={{ height: 20, width: 20, margin: 10 }}
            />
            <Text style={{ margin: 10 }}>{result.username}</Text>
          </Touchable>
        </View>
      );
    }
  }
  _segmentChange(event) {
    this.setState({
      selectedIndex: event.nativeEvent.selectedSegmentIndex,
      resultsRaw: [],
      results: this.ds.cloneWithRows([])
    });
    this._search(event.nativeEvent.selectedSegmentIndex);
  }

  _renderHeader() {}

  componentWillUnmount() {}

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View>
          <View>
            <View
              style={{
                height: 40,
                flexDirection: "row",
                borderBottomWidth: 1,
                borderBottomColor: "#274D00",
                backgroundColor: "white"
              }}
            >
              <View style={{ flex: 1 }}>
                <TextInput
                  style={{
                    height: 30,
                    padding: 6,
                    paddingLeft: 12,
                    paddingRight: 12,
                    fontSize: 16,
                    flex: 1
                  }}
                  placeholder="Search"
                  returnKeyType="search"
                  value={this.state.search}
                  ref="input"
                  onSubmitEditing={this._search}
                  onChangeText={search => this.setState({ search })}
                />
              </View>
            </View>
          </View>
          <View style={{ padding: 10, backgroundColor: "white" }}>
            <SegmentedControlIOS
              values={["Quips", "People"]}
              tintColor="#274D00"
              selectedIndex={this.state.selectedIndex}
              onChange={this._segmentChange}
            />
          </View>
        </View>
        <ListView
          style={{ backgroundColor: "white" }}
          enableEmptySections={true}
          dataSource={this.state.results}
          initialListSize={10} //https://github.com/facebook/react-native/issues/1831
          renderRow={this._renderResult}
          renderHeader={this._renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={Boolean(
                this.state.search.length && this.state.refreshing
              )}
              onRefresh={this._search}
            />
          }
        />
      </View>
    );
  }
}
