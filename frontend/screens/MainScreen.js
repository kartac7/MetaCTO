import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from "react-native";

const MainScreen = ({ apiUrl, authToken }) => {
  const [features, setFeatures] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState("");

  // Fetch features from API
  const loadFeatures = async () => {
    try {
      const response = await fetch(`${apiUrl}/features`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!response.ok) {
        throw new Error("Failed to load features");
      }
      const data = await response.json();
      setFeatures(data.features || []);
    } catch (err) {
      console.error("Error loading features:", err);
      setError("Could not fetch feature list.");
    }
  };

  useEffect(() => {
    loadFeatures();
  }, []);

  // Handle new feature submission
  const handleAddFeature = async () => {
    if (!newTitle.trim()) {
      Alert.alert("Feature title is required");
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/features`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ title: newTitle })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.error || "Failed to add feature";
        Alert.alert("Error", msg);
      } else {
        setNewTitle("");
        loadFeatures();  // refresh list to include the new feature
      }
    } catch (err) {
      Alert.alert("Network error", err.message);
    }
  };

  // Handle upvote action for a feature
  const handleUpvote = async (featureId) => {
    try {
      const response = await fetch(`${apiUrl}/features/${featureId}/upvote`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.error || "Failed to upvote";
        Alert.alert("Notice", msg);
      } else {
        // Refresh the list (to update vote counts and disable button)
        loadFeatures();
      }
    } catch (err) {
      Alert.alert("Network error", err.message);
    }
  };

  const renderFeature = ({ item }) => (
    <View style={styles.featureItem}>
      <Text style={styles.featureText}>
        {item.title}  —  {item.voteCount} votes
      </Text>
      <Button
        title="Upvote"
        onPress={() => handleUpvote(item.id)}
        disabled={item.votedByUser}  // disable if already voted by this user
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Feature Requests</Text>
      {error !== "" && <Text style={styles.errorText}>{error}</Text>}
      {/* New Feature Input */}
      <View style={styles.newFeatureContainer}>
        <TextInput
          style={styles.input}
          placeholder="New feature title"
          value={newTitle}
          onChangeText={setNewTitle}
        />
        <Button title="Add" onPress={handleAddFeature} />
      </View>
      {/* Feature List */}
      <FlatList
        data={features}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFeature}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
};

export default MainScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center"
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center"
  },
  newFeatureContainer: {
    flexDirection: "row",
    marginBottom: 15
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#888",
    padding: 8,
    marginRight: 8,
    borderRadius: 4
  },
  featureItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee"
  },
  featureText: {
    fontSize: 16
  }
});
