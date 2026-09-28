import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { EggContext } from '../EggContext';

export default function SettingsScreen() {
  const {
    thresholds,
    updateThreshold,
  } = useContext(EggContext);

  const [values, setValues] = React.useState({
    pullet: String(thresholds.pullet),
    small: String(thresholds.small),
    medium: String(thresholds.medium),
    large: String(thresholds.large),
    xlarge: String(thresholds.xlarge),
    jumbo: String(thresholds.jumbo),
  });

  const handleChange = (size, value) => {
    // Only allow numbers
    const cleanedValue = value.replace(/[^0-9]/g, '');

    setValues(previous => ({
      ...previous,
      [size]: cleanedValue,
    }));
  };

  const handleSave = () => {
    const sizes = [
      'pullet',
      'small',
      'medium',
      'large',
      'xlarge',
      'jumbo',
    ];

    for (const size of sizes) {
      const value = values[size].trim();

      if (value === '') {
        Alert.alert(
          'Invalid Threshold',
          'Please enter a threshold for every egg size.'
        );
        return;
      }

      const numberValue = Number(value);

      if (
        !Number.isInteger(numberValue) ||
        numberValue < 0
      ) {
        Alert.alert(
          'Invalid Threshold',
          'Threshold values must be whole numbers that are 0 or greater.'
        );
        return;
      }
    }

    sizes.forEach(size => {
      updateThreshold(size, Number(values[size]));
    });

    Alert.alert(
      'Settings Saved',
      'Low-stock thresholds have been updated successfully.'
    );
  };

  const renderThresholdInput = (
    label,
    size
  ) => {
    return (
      <View style={styles.settingCard}>

        <View style={styles.settingHeader}>

          <Text style={styles.sizeName}>
            {label}
          </Text>

          <Text style={styles.unit}>
            eggs
          </Text>

        </View>

        <Text style={styles.inputLabel}>
          Low-stock threshold
        </Text>

        <TextInput
          style={styles.input}
          value={values[size]}
          onChangeText={value =>
            handleChange(size, value)
          }
          keyboardType="numeric"
          placeholder="0"
          maxLength={5}
        />

        <Text style={styles.helpText}>
          A warning will appear when {label} stock
          reaches this amount or lower.
        </Text>

      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* =========================
          HEADER
      ========================= */}

      <View style={styles.header}>

        <Text style={styles.title}>
          Settings
        </Text>

        <Text style={styles.description}>
          Configure your EggTrack inventory settings.
        </Text>

      </View>

      {/* =========================
          STOCK SETTINGS
      ========================= */}

      <Text style={styles.sectionTitle}>
        Low-Stock Thresholds
      </Text>

      <Text style={styles.sectionDescription}>
        Set the minimum number of eggs allowed for
        each egg size before a low-stock warning
        appears.
      </Text>

      {renderThresholdInput(
        'Pullet',
        'pullet'
      )}

      {renderThresholdInput(
        'Small',
        'small'
      )}

      {renderThresholdInput(
        'Medium',
        'medium'
      )}

      {renderThresholdInput(
        'Large',
        'large'
      )}

      {renderThresholdInput(
        'X-Large',
        'xlarge'
      )}

      {renderThresholdInput(
        'Jumbo',
        'jumbo'
      )}

      {/* =========================
          SAVE BUTTON
      ========================= */}

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>
          Save Settings
        </Text>
      </TouchableOpacity>

      {/* =========================
          INFORMATION
      ========================= */}

      <View style={styles.infoCard}>

        <Text style={styles.infoTitle}>
          How Low-Stock Alerts Work
        </Text>

        <Text style={styles.infoText}>
          EggTrack compares the current inventory
          of each egg size with its configured
          threshold.
        </Text>

        <Text style={styles.infoText}>
          When the inventory is equal to or below
          the threshold, the egg size will be marked
          as LOW STOCK.
        </Text>

      </View>

      <View style={styles.bottomSpace} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  // =========================
  // CONTAINER
  // =========================

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  // =========================
  // HEADER
  // =========================

  header: {
    backgroundColor: '#FFFFFF',

    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,

    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',

    elevation: 2,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  description: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
  },

  // =========================
  // SECTION
  // =========================

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',

    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 6,
  },

  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',

    lineHeight: 20,

    marginHorizontal: 20,
    marginBottom: 15,
  },

  // =========================
  // SETTING CARD
  // =========================

  settingCard: {
    backgroundColor: '#FFFFFF',

    marginHorizontal: 20,
    marginBottom: 12,

    padding: 18,

    borderRadius: 14,

    elevation: 2,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,

    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  settingHeader: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: 12,
  },

  sizeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  unit: {
    fontSize: 13,
    color: '#6B7280',
  },

  // =========================
  // INPUT
  // =========================

  inputLabel: {
    fontSize: 13,
    color: '#6B7280',

    marginBottom: 6,
  },

  input: {
    backgroundColor: '#F9FAFB',

    borderWidth: 1,
    borderColor: '#D1D5DB',

    borderRadius: 10,

    paddingHorizontal: 14,
    paddingVertical: 12,

    fontSize: 17,

    color: '#1F2937',
  },

  helpText: {
    fontSize: 12,
    color: '#9CA3AF',

    marginTop: 7,

    lineHeight: 18,
  },

  // =========================
  // SAVE BUTTON
  // =========================

  saveButton: {
    backgroundColor: '#111827',

    marginHorizontal: 20,
    marginTop: 10,

    paddingVertical: 16,

    borderRadius: 10,

    elevation: 2,
  },

  saveButtonText: {
    color: '#FFFFFF',

    textAlign: 'center',

    fontSize: 16,

    fontWeight: 'bold',
  },

  // =========================
  // INFORMATION
  // =========================

  infoCard: {
    backgroundColor: '#FFFFFF',

    marginHorizontal: 20,
    marginTop: 20,

    padding: 18,

    borderRadius: 14,

    elevation: 2,
  },

  infoTitle: {
    fontSize: 17,
    fontWeight: 'bold',

    color: '#1F2937',

    marginBottom: 10,
  },

  infoText: {
    fontSize: 14,
    color: '#6B7280',

    lineHeight: 20,

    marginBottom: 8,
  },

  // =========================
  // BOTTOM SPACE
  // =========================

  bottomSpace: {
    height: 40,
  },

});