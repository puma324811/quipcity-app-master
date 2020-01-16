import { AsyncStorage } from "react-native";
import UserCache from "./util/UserCache.js";
import { Alert } from "react-native";

let token = null;

let api_request = async (path, method, body, headers) => {
  // This is for development
  // let apiRoot = "http://192.168.1.5:3000/";
  let apiRoot = "https://quipcity.herokuapp.com/";
  let response;
  try {
    console.log(`New api request to ${method} ${path}`);

    let opt = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Cache-control": "max-age=0",
      },
    };

    if (headers) {
      // I mean, yeah...
      opt.headers["Authorization"] = headers.Authorization;
    }

    if (body && method != "get") {
      opt.body = JSON.stringify(body);
    }

    if (body && body.q) {
      path += `?q=${body.q}`;
    }

    response = await fetch(`${apiRoot}${path}`, opt);

    console.log(response.status);
    if (response.status >= 400) {
      throw response;
    }

    if (response.status != 204) {
      let responseJson = await response.json();
      console.log(responseJson);
      return responseJson;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

let authenticated_request = async (path, method, body) => {
  token = await AsyncStorage.getItem("@QuipCityStore:token");
  console.log("this is happenging", token);
  if (token === null) {
    throw { message: "no token", status: 400 };
  }

  let headers = {
    Authorization: token,
  };

  return api_request(path, method, body, headers);
};

const filtersParamMap = {
  "Top - 48 Hrs": "top48",
  Hot: "hot",
  "New Quips": "new",
  "Recently Revealed": "post48",
  "Top All Time": "topalltime",
};

exports.feed = async filter => {
  path = "feed";
  if (filter) {
    let param = filtersParamMap[filter];
    if (param) {
      path += `?filter=${param}`;
    }
  }
  let resp = await authenticated_request(path, "get");
  return resp;
};

exports.user = async () => {
  let resp = await authenticated_request("user", "get");
  UserCache.set(resp);
  return resp;
};

exports.push_token = async push_token => {
  let resp = await authenticated_request("users/push-token", "post", {
    push_token: push_token,
  });
  return resp;
};

exports.update_user = async params => {
  let resp = await authenticated_request("user", "post", params);
  UserCache.set(resp);
  return resp;
};

exports.search_users = async term => {
  let params = { q: term };
  let resp = await authenticated_request("users/search", "get", params);
  return resp;
};

exports.search_quips = async term => {
  let params = { q: term };
  let resp = await authenticated_request("quips/search", "get", params);
  return resp;
};

exports.quip = async id => {
  let resp = await authenticated_request(`quips/${id}`);
  return resp;
};

exports.quips = async order => {
  let path = `quips`;
  if (order) {
    path += `?order=${order}`;
  }
  let resp = await authenticated_request(path, "get");
  return resp;
};

exports.user_quips = async (username, order) => {
  let path = `users/${username}/quips`;
  if (order) {
    path += `?order=${order}`;
  }
  let resp = await authenticated_request(path, "get");
  return resp;
};

// terrible
exports.user_user = async username => {
  let resp = await authenticated_request(`users/${username}`, "get");
  return resp;
};

exports.vote = async quip_id => {
  let resp = await authenticated_request("vote", "post", { quip_id: quip_id });
  return resp;
};

exports.unvote = async quip_id => {
  let resp = await authenticated_request("vote", "delete", {
    quip_id: quip_id,
  });
  return resp;
};

exports.create = async text => {
  let resp = await authenticated_request("quips", "post", { body: text });
  return resp;
};

exports.delete_quip = async id => {
  let resp = await authenticated_request(`quips/${id}`, "delete");
  return resp;
};

exports.comments = quip_id => {
  return authenticated_request(`quips/${quip_id}/comments`, "get");
};

exports.comment = (quip_id, body) => {
  return authenticated_request("comments", "post", {
    quip_id: quip_id,
    body: body,
  });
};

exports.facebook_signup = async token => {
  let resp = await api_request("facebook-signup", "post", { token: token });
  return resp;
};

exports.google_signup = async token => {
  let resp = await api_request("google-signup", "post", { token: token });
  return resp;
};

exports.signup = async user => {
  let resp = await api_request("signup", "post", { user });
  return resp;
};

exports.login = async user => {
  let resp = await api_request("login", "post", { user });
  return resp;
};

exports.logout = async () => {
  const token = await AsyncStorage.getItem("@QuipCityStore:token")
  await api_request("logoff", "delete", { token });
  return AsyncStorage.removeItem("@QuipCityStore:token");
};

exports.follow = id => {
  return authenticated_request("follow", "post", { following_id: id });
};
exports.unfollow = id => {
  return authenticated_request("unfollow", "delete", { following_id: id });
};

exports.following = async username => {
  let path;
  if (username) {
    path = `users/${username}/following`;
  } else {
    path = "following";
  }
  let resp = await authenticated_request(path, "get");
  return resp;
};

exports.followers = async username => {
  let path;
  if (username) {
    path = `users/${username}/followers`;
  } else {
    path = "followers";
  }
  let resp = await authenticated_request(path, "get");
  return resp;
};

exports.stats = async username => {
  let path;
  if (username) {
    path = `users/${username}/stats`;
  } else {
    path = "stats";
  }
  let resp = await authenticated_request(path, "get");
  return resp;
};

exports.notifications_you = () => {
  return authenticated_request("notifications/you", "get");
};
exports.notifications_following = () => {
  return authenticated_request("notifications/following", "get");
};

// get '/feed', to: 'feed#show'
// post '/votes', to: 'votes#create'
// delete '/votes/:id', to: 'votes#destroy'
// get '/quips', to: 'quips#index'
// get '/quips/:id', to: 'quips#show'
// get '/quips/:id/comments', to: 'quips#comments'
// post '/quips', to: 'quips#create'
// delete '/quips/:id', to: 'quips#destroy'
// post '/comments', to: 'comments#create'
// delete '/comments/:id', to: 'comments#destroy'
// get '/user', to: 'users#me'
// post '/user', to: 'users#update'
// post '/facebook-signup', to: 'users#facebook_signup'
// get '/users/:username', to: 'users#show'
// get '/users/:username/following', to: 'users#following'
// get '/users/:username/followers', to: 'users#followers'
// get '/users/:username/quips', to: 'users#quips'
// get '/following', to: 'follows#following'
// get '/followers', to: 'follows#followers'
// post '/follow', to: 'follows#follow'
// delete '/unfollow/:id', to: 'follows#destroy'
