import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from "react-native";

const LoginScreen = ({ apiUrl, onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        // Login failed – extract error message if available
        const errData = await response.json().catch(() => ({}));
        const msg = errData.error || "Login failed";
        setError(msg);
      } else {
        const data = await response.json();
        onLoginSuccess(data.token);  // pass the JWT token back to App
      }
    } catch (err) {
      setError("Network error: " + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feature Voting - Login</Text>
      {error !== "" && <Text style={styles.errorText}>{error}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
      <TouchableOpacity onPress={onSwitchToRegister}>
        <Text style={styles.switchText}>No account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center"
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center"
  },
  input: {
    borderWidth: 1,
    borderColor: "#888",
    padding: 10,
    marginVertical: 5,
    borderRadius: 4
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center"
  },
  switchText: {
    color: "blue",
    marginTop: 15,
    textAlign: "center"
  }
});
