import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import TestScreen from "./components/TestScreen";
import ProCamera from './proCamera/ProCamera';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <StatusBar barStyle="light-content" backgroundColor="#000" translucent />
        <TestScreen/>
        {/* <ProCamera /> */}
      </View>
    </GestureHandlerRootView>
  )
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
// });








