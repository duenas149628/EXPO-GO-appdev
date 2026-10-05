import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { useThemedStyles } from '../ThemeContext';

export default function ActionButton({ title, onPress }) {
  const styles = useThemedStyles(baseStyles);
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

const baseStyles = StyleSheet.create({
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
