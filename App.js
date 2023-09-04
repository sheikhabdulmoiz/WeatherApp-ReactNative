import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  View,
  Button,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView, // Import ScrollView
} from "react-native";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";

const App = () => {
  const [isFontLoaded] = useFonts({
    "mw-black": require("./assets/fonts/Merriweather-Black.ttf"),
    "mw-light": require("./assets/fonts/Merriweather-Light.ttf"),
    "mw-bold": require("./assets/fonts/Merriweather-Bold.ttf"),
    "mw-Regular": require("./assets/fonts/Merriweather-Regular.ttf"),
  });
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState();
  const [city, setCity] = useState("");
  const [error, setError] = useState(null);
  const [refreshLocation, setRefreshLocation] = useState(true);
  const [permissionGranted, setIsPermissionGranted] = useState(true);

  async function getWeather() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setIsPermissionGranted(true);
        const location = await Location.getCurrentPositionAsync();
        const { latitude, longitude } = location.coords;
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=c1aee6a9a0a655ab62c7fe81aaf39736&units=metric`
        );
        const jsonData = await response.json();
        setData(jsonData);
      } else {
        setIsPermissionGranted(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getWeather();
  }, []);

  function refLocation() {
    setRefreshLocation(!refreshLocation);
    setCity("");
  }

  useEffect(() => {
    getWeather();
  }, [refreshLocation]);

  async function getAgainWeather() {
    try {
      if (city !== "") {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=c1aee6a9a0a655ab62c7fe81aaf39736&units=metric`
        );
        const json = await response.json();
        setData(json);
      } else {
        Alert.alert("Require Valid City Name", "You entered invalid input..!");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
    setCity("");
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -500}
    >
      <LinearGradient
  colors={["#36d1dc", "#5b86e5"]}
  style={styles.container}
      >
        <Text style={styles.title}>Weather App</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter city name"
          value={city}
          onChangeText={(text) => {
            setCity(text);
          }}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            width: "100%",
          }}
        >
          <Button
            title="Get Weather"
            onPress={getAgainWeather}
            color={"#0aa2b3"}
          />
          <Button title="Refresh" onPress={refLocation} color={"#0aa2b3"} />
        </View>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled" // Allow taps to dismiss keyboard
        >
          {isLoading ? (
            <ActivityIndicator
              style={styles.loader}
              color="#1aa0e8"
              size="large"
            />
          ) : !permissionGranted ? (
            <Text style={styles.errorText}>
              Location permission not granted
            </Text>
          ) : data.cod === "404" ? (
            <Text style={styles.errorText}>City not found</Text>
          ) : (
            <View style={styles.weatherInfo}>
              <Text style={styles.weatherText}>
                <Text
                  style={[
                    styles.nestedText,
                    { color: "paleturquoise", fontFamily: "mw-bold", fontSize: 32 },
                  ]}
                >
                  {data.name}
                </Text>
              </Text>
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Image
                  source={{
                    uri: `https://openweathermap.org/img/wn/${data.weather[0]?.icon}@2x.png`,
                  }}
                  style={{
                    width: 200,
                    height: 200,
                    // marginTop: 50,
                    // backgroundColor:"red",
                    marginVertical: 0, // Remove vertical margin
                    marginHorizontal: 0, // Remove horizontal margin
                  }}
                />
              </View>
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Text style={styles.weatherText}>
                  Temp:{" "}
                  <Text style={styles.nestedText}>{data.main.temp}°C</Text>
                </Text>
                <Text style={styles.weatherText}>
                  Humidity:{" "}
                  <Text style={styles.nestedText}>{data.main.humidity}%</Text>
                </Text>
                <Text style={styles.weatherText}>
                  Wind Speed:{" "}
                  <Text style={styles.nestedText}>{data.wind.speed} km/h</Text>
                </Text>
                <Text style={styles.weatherText}>
                  Weather:
                  <Text style={styles.nestedText}>{data.weather[0]?.main}</Text>
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  nestedText: {
    color: "royalblue",
    fontFamily: "mw-bold",
  },
  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#fff",
    padding: 12,
    width: "100%",
    marginBottom: 16,
    fontSize: 18,
    borderRadius: 8,
    color: "#125581",
    backgroundColor: "white",
    elevation: 4,
  },
  loader: {
    marginTop: 16,
  },
  errorText: {
    fontSize: 24,
    color: "red",
    marginTop: 16,
  },
  weatherInfo: {
    marginTop: 150,
  },
  weatherText: {
    // fontFamily:"mw-black",
    fontFamily: "mw-light",
    fontSize: 22,
    textAlign: "center",
    color: "midnightblue",
    margin:2
    // marginBottom: 8,
  },
});

export default App;

// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, Text, View, Button, TextInput, StyleSheet } from 'react-native';
// import * as Location from 'expo-location';

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#4eb4f7',
//   },
//   text: {
//     fontSize: 20,
//     marginBottom: 10,
//     color: '#535b5e',
//   },
//   errorText: {
//     fontSize: 18,
//     color: 'red',
//     marginTop: 16,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#fff',
//     padding: 12,
//     width: '100%',
//     marginBottom: 16,
//     fontSize: 18,
//     borderRadius: 8,
//     color: '#125581',
//     backgroundColor: 'white',
//     elevation: 4,
//   },
//   loader: {
//     marginTop: 16,
//   },
// });

// const App = () => {
//   const [isLoading, setLoading] = useState(true);
//   const [data, setData] = useState({});
//   const [error, setError] = useState(null);
//   const [city, setCity] = useState(''); // Default city

//   async function getLocationWeather() {
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         throw new Error('Location permission not granted');
//       }

//       const location = await Location.getCurrentPositionAsync();
//       const { latitude, longitude } = location.coords;

//       const response = await fetch(
//         `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=c1aee6a9a0a655ab62c7fe81aaf39736&units=metric`
//       );
//       if (!response.ok) {
//         throw new Error('Weather data not available');
//       }

//       const jsonData = await response.json();
//       setData(jsonData);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     getLocationWeather();
//   }, []);

//   async function getAgainWeather() {
//     try {
//       if (city !== '') {
//         const response = await fetch(
//           `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=c1aee6a9a0a655ab62c7fe81aaf39736&units=metric`
//         );
//         const json = await response.json();
//         setData(json);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//     setCity('');
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.text}>Weather App</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Enter city name"
//         value={city}
//         onChangeText={(text) => {
//           setCity(text);
//         }}
//       />
//       <Button title="Get Weather" onPress={getAgainWeather} color={'#3287ed'} />
//       {isLoading ? (
//         <ActivityIndicator style={styles.loader} color="#FFD700" size="large" />
//       ) : data.cod === '404' ? (
//         <Text style={styles.errorText}>City not found</Text>
//       ) : (
//         <View style={styles.weatherInfo}>
//           <Text style={styles.text}>Temperature: {data.main.temp}°C</Text>
//           <Text style={styles.text}>Humidity: {data.main.humidity}%</Text>
//           <Text style={styles.text}>City: {data.name}</Text>
//           <Text style={styles.text}>Wind Speed: {data.wind.speed} km/h</Text>
//           <Text style={styles.text}>Weather: {data.weather[0].main}</Text>
//         </View>
//       )}
//     </View>
//   );
// };

// export default App;

// import React, { useState, useEffect } from 'react';
// import { Platform, Text, View, StyleSheet } from 'react-native';

// import * as Location from 'expo-location';

// export default function App() {
//   const [location, setLocation] = useState(null);
//   const [errorMsg, setErrorMsg] = useState(null);

//   useEffect(() => {
//     (async () => {

//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         setErrorMsg('Permission to access location was denied');
//         return;
//       }

//       let location = await Location.getCurrentPositionAsync({});
//       setLocation(location);
//     })();
//   }, []);

//   let text = 'Waiting..';
//   if (errorMsg) {
//     text = errorMsg;
//   } else if (location) {
//     text = JSON.stringify(location);
//   }

//   return (
//     <View style={{flex:1, justifyContent:"center",alignItems:"center"}}>
//       <Text >{text}</Text>
//     </View>
//   );
// }

// async function getWeather() {
//   let city = "Karachi"; // Default city
//   try {
//     const response = await fetch(
//       `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=c1aee6a9a0a655ab62c7fe81aaf39736&units=metric`
//     );
//     const json = await response.json();
//     setData(json);
//   } catch (error) {
//     console.error(error);
//   } finally {
//     setLoading(false);
//   }
// }
