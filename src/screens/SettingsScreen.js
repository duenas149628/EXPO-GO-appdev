import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { EggContext } from '../EggContext';

export default function SettingsScreen() {
  const {
    thresholds,
    updateThreshold,
  } = useContext(EggContext);

  const [pullet, setPullet] = useState(
    String(thresholds.pullet)
  );

  const [small, setSmall] = useState(
    String(thresholds.small)
  );

  const [medium, setMedium] = useState(
    String(thresholds.medium)
  );

  const [large, setLarge] = useState(
    String(thresholds.large)
  );

  const [xlarge, setXlarge] = useState(
    String(thresholds.xlarge)
  );

  const [jumbo, setJumbo] = useState(
    String(thresholds.jumbo)
  );

  const handleSave = () => {
    const values = [
      pullet,
      small,
      medium,
      large,
      xlarge,
      jumbo,
    ];

    const hasInvalidValue = values.some(
      value =>
        value.trim() === '' ||
        Number(value) < 0 ||
        !Number.isInteger(Number(value))
    );

    if (hasInvalidValue) {
      Alert.alert(
        'Invalid Threshold',
        'Please enter a whole number that is 0 or greater for every egg size.'
      );

      return;
    }

    updateThreshold('pullet', Number(pullet));
    updateThreshold('small', Number(small));
    updateThreshold('medium', Number(medium));
    updateThreshold('large', Number(large));
    updateThreshold('xlarge', Number(xlarge));
    updateThreshold('jumbo', Number(jumbo));

    Alert.alert(
      'Settings Saved',
      'Low-stock thresholds have been updated.'
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>

        <Text style={styles.title}>
          Settings
        </Text>

        <Text style={styles.description}>
          Configure the minimum inventory level for each egg size.
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Low-Stock Thresholds
          </Text>

          <Text style={styles.infoText}>
            The Dashboard will show a warning when an egg size reaches or falls below its configured threshold.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Egg Size Thresholds
        </Text>

        <Text style={styles.label}>
          Pullet
        </Text>

        <TextInput
          style={styles.input}
          value={pullet}
          onChangeText={setPullet}
          keyboardType="numeric"
          placeholder="Enter threshold"
        />

        <Text style={styles.label}>
          Small
        </Text>

        <TextInput
          style={styles.input}
          value={small}
          onChangeText={setSmall}
          keyboardType="numeric"
          placeholder="Enter threshold"
        />

        <Text style={styles.label}>
          Medium
        </Text>

        <TextInput
          style={styles.input}
          value={medium}
          onChangeText={setMedium}
          keyboardType="numeric"
          placeholder="Enter threshold"
        />

        <Text style={styles.label}>
          Large
        </Text>

        <TextInput
          style={styles.input}
          value={large}
          onChangeText={setLarge}
          keyboardType="numeric"
          placeholder="Enter threshold"
        />

        <Text style={styles.label}>
          X-Large
        </Text>

        <TextInput
          style={styles.input}
          value={xlarge}
          onChangeText={setXlarge}
          keyboardType="numeric"
          placeholder="Enter threshold"
        />

        <Text style={styles.label}>
          Jumbo
        </Text>

        <TextInput
          style={styles.input}
          value={jumbo}
          onChangeText={setJumbo}
          keyboardType="numeric"
          placeholder="Enter threshold"
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            Save Thresholds
          </Text>
        </TouchableOpacity>

        <View style={styles.currentCard}>
          <Text style={styles.currentTitle}>
            Current Thresholds
          </Text>

          <Text style={styles.currentText}>
            Pullet: {thresholds.pullet}
          </Text>

          <Text style={styles.currentText}>
            Small: {thresholds.small}
          </Text>

          <Text style={styles.currentText}>
            Medium: {thresholds.medium}
          </Text>

          <Text style={styles.currentText}>
            Large: {thresholds.large}
          </Text>

          <Text style={styles.currentText}>
            X-Large: {thresholds.xlarge}
          </Text>

          <Text style={styles.currentText}>
            Jumbo: {thresholds.jumbo}
          </Text>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  content: {
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },

  description: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
    marginBottom: 20,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    elevation: 2,
  },

  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 15,
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 14,
    fontSize: 17,
    marginBottom: 18,
  },

  saveButton: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 10,
    marginTop: 5,
  },

  saveButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },

  currentCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginTop: 25,
    marginBottom: 30,
    elevation: 2,
  },

  currentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  currentText: {
    fontSize: 15,
    marginVertical: 4,
  },
});