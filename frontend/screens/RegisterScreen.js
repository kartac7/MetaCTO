import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from "react-native";

const RegisterScreen = ({ apiUrl, onRegisterSuccess, onSwitchToLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    setError("");
    setMessage("");
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        // Registration failed – show error
        const errData = await response.json().catch(() => ({}));
        const msg = errData.error || "Registration failed";
        setError(msg);
      } else {
        const data = await response.json();
        // Registration successful, we have a token
        onRegisterSuccess(data.token);
      }
    } catch (err) {
      setError("Network error: " + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feature Voting - Register</Text>
      {error !== "" && <Text style={styles.errorText}>{error}</Text>}
      {message !== "" && <Text style={styles.messageText}>{message}</Text>}
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
      <Button title="Register" onPress={handleRegister} />
      <TouchableOpacity onPress={onSwitchToLogin}>
        <Text style={styles.switchText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;

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
  messageText: {
    color: "green",
    marginBottom: 10,
    textAlign: "center"
  },
  switchText: {
    color: "blue",
    marginTop: 15,
    textAlign: "center"
  }
});
