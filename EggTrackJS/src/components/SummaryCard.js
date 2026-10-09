import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemedStyles } from '../ThemeContext';

export default function SummaryCard({ label, value, unit }) {
  const styles = useThemedStyles(baseStyles);
  return (
    <View style={styles.card}>
      <Text style={styles.label}>
        {label}
      </Text>

      <Text style={styles.value}>
        {value}
      </Text>

      <Text style={styles.unit}>
        {unit}
      </Text>
    </View>
  );
}

const baseStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 5,
    padding: 13,
    borderRadius: 10,
    elevation: 2,
  },

  label: {
    fontSize: 12,
    color: '#6B7280',
  },

  value: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 5,
  },

  unit: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
