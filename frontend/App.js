import React, { useState } from "react";
import { View, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import MainScreen from "./screens/MainScreen";

// Determine base URL for API depending on platform (Android emulator requires 10.0.2.2)
const API_URL = Platform.OS === "android" ? "http://10.0.2.2:3000/api" : "http://localhost:3000/api";

export default function App() {
  const [token, setToken] = useState(null);           // JWT token after login/register
  const [showRegister, setShowRegister] = useState(false);  // Toggle between Login and Register screens

  // Handlers for login and register success
  const handleLoginSuccess = (authToken) => {
    setToken(authToken);
  };
  const handleRegisterSuccess = (authToken) => {
    setToken(authToken);
  };

  // If not logged in, show the appropriate auth screen
  if (!token) {
    return (
      <View style={{ flex: 1 }}>
        {showRegister ? (
          <RegisterScreen apiUrl={API_URL} onRegisterSuccess={handleRegisterSuccess} onSwitchToLogin={() => setShowRegister(false)} />
        ) : (
          <LoginScreen apiUrl={API_URL} onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setShowRegister(true)} />
        )}
        <StatusBar style="auto" />
      </View>
    );
  }

  // If token is present (user is authenticated), show the main feature list screen
  return (
    <View style={{ flex: 1 }}>
      <MainScreen apiUrl={API_URL} authToken={token} />
      <StatusBar style="auto" />
    </View>
  );
}
