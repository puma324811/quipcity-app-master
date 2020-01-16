import React from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  Image,
  View,
  Button,
  Linking,
  StatusBar,
  AsyncStorage
} from "react-native";
import { Facebook, WebBrowser } from "expo";
import QuipCity from "./quipcity.js";

import ComposeScreen from "./screens/ComposeScreen.js";
import FeedScreen from "./screens/FeedScreen.js";
import FollowersScreen from "./screens/FollowersScreen.js";
import NotificationsScreen from "./screens/NotificationsScreen.js";
import ProfileScreen from "./screens/ProfileScreen.js";
import QuipScreen from "./screens/QuipScreen.js";
import SearchScreen from "./screens/SearchScreen.js";
import SettingsScreen from "./screens/SettingsScreen.js";
import SettingsAboutScreen from "./screens/SettingsAboutScreen.js";
import SettingsEditScreen from "./screens/SettingsEditScreen.js";
import SignupScreen from "./screens/SignupScreen.js";
import LoginScreen from "./screens/LoginScreen.js";
import ConfirmationScreen from "./screens/ConfirmationScreen.js";
import UsernameScreen from "./screens/UsernameScreen.js";

StatusBar.setBarStyle('default', true)

import {
  TabNavigator,
  DrawerNavigator,
  StackNavigator,
  NavigationActions,
  TabView,
  TabBarBottom
} from "react-navigation";

import CurrentRouteEmitter from "./util/CurrentRouteEmitter.js";
import moment from "moment";

moment.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "1m",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "1mo",
    MM: "%dmo",
    y: "1y",
    yy: "%dy"
  }
});

const FeedTab = StackNavigator({
  Feed: { screen: FeedScreen },
  FeedQuip: { screen: QuipScreen },
  FeedProfile: { screen: ProfileScreen },
  FeedFollowers: { screen: FollowersScreen }
});

const ProfileTab = StackNavigator({
  Profile: { screen: ProfileScreen },
  ProfileQuip: { screen: QuipScreen },
  ProfileFollowers: { screen: FollowersScreen },
  Settings: { screen: SettingsScreen },
  SettingsAbout: { screen: SettingsAboutScreen },
  SettingsEdit: { screen: SettingsEditScreen },
  ProfileProfile: { screen: ProfileScreen }
});

const FollowingTab = StackNavigator(
  {
    Following: {
      screen: NotificationsScreen,
      navigationOptions: {
        header: null
      }
    },
    FollowingQuip: { screen: QuipScreen },
    FollowingProfile: { screen: ProfileScreen },
    FollowingFollowers: { screen: FollowersScreen }
  },
  {
    headerMode: "screen"
  }
);

const SearchTab = StackNavigator({
  Search: { screen: SearchScreen },
  SearchQuip: { screen: QuipScreen },
  SearchProfile: { screen: ProfileScreen },
  SearchFollowers: { screen: FollowersScreen }
});

let icons = {
  Feed: require("./images/home-icon.png"),
  Following: require("./images/heart-icon.png"),
  Compose: require("./images/compose-icon.png"),
  Search: require("./images/search-icon.png"),
  Profile: require("./images/profile-icon.png")
};

let iconFn = (key, tintColor) => {
  return (
    <Image
      source={icons[key]}
      style={[
        {
          tintColor: tintColor,
          width: 25,
          height: 25
        }
      ]}
    />
  );
};

let currentIndex = 0;
let avilableToCompose = true;
const TabIndex = {
  0: "Feed",
  1: "Following",
  3: "Search",
  4: "Profile"
};

const Home = TabNavigator(
  {
    FeedTab: {
      screen: FeedTab,
      navigationOptions: {
        tabBarLabel: "Feed",
        tabBarIcon: ({ tintColor }) => iconFn("Feed", tintColor)
      }
    },
    FollowingTab: {
      screen: FollowingTab,
      navigationOptions: {
        tabBarLabel: "Following",
        tabBarIcon: ({ tintColor }) => iconFn("Following", tintColor)
      }
    },
    ComposeTab: {
      screen: ComposeScreen,
      navigationOptions: {
        tabBarLabel: "Compose",
        tabBarIcon: ({ tintColor }) => iconFn("Compose", tintColor)
      }
    },
    SearchTab: {
      screen: SearchTab,
      navigationOptions: {
        tabBarLabel: "Search",
        tabBarIcon: ({ tintColor }) => iconFn("Search", tintColor)
      }
    },
    ProfileTab: {
      screen: ProfileTab,
      navigationOptions: {
        tabBarLabel: "Profile",
        tabBarIcon: ({ tintColor }) => iconFn("Profile", tintColor)
      }
    }
  },
  {
    lazy: true,
    tabBarOptions: {
      activeTintColor: "#274D00",
      style: { backgroundColor: "white"},
    },
    backBehavior: "initialRoute",
    tabBarComponent: ({ jumpToIndex, ...props }) => {
      return (
        <TabBarBottom
          {...props}
          jumpToIndex={index => {
            const { dispatch, state } = props.navigation;
            if (index === state.index) {
              const navigateAction = NavigationActions.navigate({
                routeName: `${TabIndex[index]}Tab`,
                action: NavigationActions.reset({
                  index: 0,
                  actions: [
                    NavigationActions.navigate({
                      routeName: TabIndex[index],
                      params: { filter: 0 }
                    })
                  ]
                })
              });
              props.navigation.dispatch(navigateAction);
            } else if (index === 2) {
              // or whatever index your menu button is
              if (avilableToCompose) {
                avilableToCompose = false;
                this.setTimeout(() => {
                  avilableToCompose = true;
                }, 100);
                props.navigation.navigate("Compose");
              }
            } else {
              console.log("tab press index update", index);
              jumpToIndex(index);
            }
          }}
        />
      );
    }
  }
);

let stackNavOptions = {
  gesturesEnabled: false
};

const ComposeContainer = StackNavigator(
  {
    Home: {
      screen: Home,
      navigationOptions: {
        ...stackNavOptions,
        header: null
      }
    },
    Compose: {
      screen: ComposeScreen
    }
  },
  {
    // headerMode: "none",
    mode: "modal"
  }
);

const SignupStack = StackNavigator(
  {
    SubSignup: {
      screen: SignupScreen,
      navigationOptions: stackNavOptions
    },
    SubLogin: {
      screen: LoginScreen,
      navigationOptions: stackNavOptions
    },
    SubConfirmation: {
      screen: ConfirmationScreen,
      navigationOptions: stackNavOptions
    },
  },
  {
    headerMode: "none"
  }
)

const SignupContainer = StackNavigator(
  {
    App: {
      screen: ComposeContainer,
      navigationOptions: stackNavOptions
    },
    Signup: {
      screen: SignupStack,
      navigationOptions: stackNavOptions
    },
    Username: {
      screen: UsernameScreen,
      navigationOptions: stackNavOptions
    }
  },
  {
    headerMode: "none"
  }
);

function hasChildNavigator(navigationState) {
  let child = navigationState.routes[navigationState.index];
  if (child.routes) {
    return true;
  } else {
    return false;
  }
}

function getCurrentScreen(navigationState) {
  if (!navigationState) {
    return null;
  }

  if (hasChildNavigator(navigationState)) {
    let child = navigationState.routes[navigationState.index];
    return getCurrentScreen(child);
  } else {
    return navigationState.routes[navigationState.index].routeName;
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
  }
  componentDidMount() {}
  onNavigationStateChange(prevState, newState) {
    currentIndex = newState.routes[0].routes[0].index;
    console.log("state change index update", currentIndex);
    let routeName = getCurrentScreen(newState);
    console.log(routeName);
    CurrentRouteEmitter.emit("change", routeName);
  }
  render() {
    return (
      <SignupContainer
        onNavigationStateChange={this.onNavigationStateChange}
        ref={nav => {
          this.navigator = nav;
        }}
      />
    );
  }
}

module.exports = App;
