import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

export default function ActionButton({ title, onPress }) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
    >
      <Text style={styles.text}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
  },

  text: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});