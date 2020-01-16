import React from "react";
import { Permissions, Notifications } from "expo";
import { Alert, AsyncStorage } from "react-native";
import QuipCity from "../quipcity.js";

let askForPermission = async () => {
    console.log("ok, we here");
    let { status } = await Permissions.askAsync(
        Permissions.REMOTE_NOTIFICATIONS
    );
    console.log(status);
    if (status !== "granted") {
        AsyncStorage.setItem(
            "@QuipCityStore:push-notifications",
            "rejected-ios-request"
        );
    }
    let token = await Notifications.getExpoPushTokenAsync();
    if (token) {
        QuipCity.push_token(token);
        AsyncStorage.setItem("@QuipCityStore:push-notifications", "yes");
    }
};

let checkPushNotifications = async () => {
    console.log("getting permission status")
    const { existingStatus } = await Permissions.getAsync(Permissions.REMOTE_NOTIFICATIONS);
    console.log(`status is ${existingStatus}`)
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        // Android remote notification permissions are granted during the app
        // install, so this will only ask on iOS
        console.log(`asking for permission`)
        const { status } = await Permissions.askAsync(Permissions.REMOTE_NOTIFICATIONS);
        console.log(`got status: ${status}`)
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        console.log(`exiting: ${finalStatus}`)
        return;
    }
    console.log(`getting token`)
    let token = await Notifications.getExpoPushTokenAsync();
    console.log(`token: ${token}`)
    if (token) {
        console.log(`saving token`)
        QuipCity.push_token(token);
        AsyncStorage.setItem("@QuipCityStore:push-notifications", "yes");
        return;
    }
    // console.log("checking push notifications");
    // let enabled = await AsyncStorage.getItem(
    //     "@QuipCityStore:push-notifications"
    // );
    // if (enabled == null) {
    //     Alert.alert(
    //         "Push Notifications",
    //         "Enable QuipCity push notifications?",
    //         [
    //             {
    //                 text: "OK",
    //                 onPress: () => {
    //                     askForPermission();
    //                 },
    //             },
    //             {
    //                 text: "No Thanks",
    //                 onPress: () => {
    //                     AsyncStorage.setItem(
    //                         "@QuipCityStore:push-notifications",
    //                         "pre-cancelled"
    //                     );
    //                 },
    //                 style: "cancel",
    //             },
    //         ],
    //         { cancelable: true }
    //     );
    // }
};
export default checkPushNotifications;
