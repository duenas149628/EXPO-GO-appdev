import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SummaryCard({ label, value, unit }) {
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

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 8,
    padding: 18,
    borderRadius: 12,
    elevation: 2,
  },

  label: {
    fontSize: 13,
    color: '#6B7280',
  },

  value: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 8,
  },

  unit: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
});