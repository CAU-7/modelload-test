import React from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';

const HomeScreen = ({navigateToCamera}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Camera App!</Text>
      <Button title="Open Camera" onPress={navigateToCamera} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
});

export default HomeScreen;
