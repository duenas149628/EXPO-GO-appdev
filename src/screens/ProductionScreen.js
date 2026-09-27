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

const EGGS_PER_TRAY = 30;

export default function ProductionScreen() {
  const [inputMode, setInputMode] = useState('eggs');

  const [pullet, setPullet] = useState('');
  const [small, setSmall] = useState('');
  const [medium, setMedium] = useState('');
  const [large, setLarge] = useState('');
  const [xlarge, setXlarge] = useState('');
  const [jumbo, setJumbo] = useState('');

  const [pulletTrays, setPulletTrays] = useState('');
  const [pulletLoose, setPulletLoose] = useState('');

  const [smallTrays, setSmallTrays] = useState('');
  const [smallLoose, setSmallLoose] = useState('');

  const [mediumTrays, setMediumTrays] = useState('');
  const [mediumLoose, setMediumLoose] = useState('');

  const [largeTrays, setLargeTrays] = useState('');
  const [largeLoose, setLargeLoose] = useState('');

  const [xlargeTrays, setXlargeTrays] = useState('');
  const [xlargeLoose, setXlargeLoose] = useState('');

  const [jumboTrays, setJumboTrays] = useState('');
  const [jumboLoose, setJumboLoose] = useState('');

  const { addProduction, productions } = useContext(EggContext);

  const getEggs = (eggs, trays, loose) => {
    if (inputMode === 'eggs') {
      return Number(eggs) || 0;
    }

    return (
      (Number(trays) || 0) * EGGS_PER_TRAY +
      (Number(loose) || 0)
    );
  };

  const pulletEggs = getEggs(
    pullet,
    pulletTrays,
    pulletLoose
  );

  const smallEggs = getEggs(
    small,
    smallTrays,
    smallLoose
  );

  const mediumEggs = getEggs(
    medium,
    mediumTrays,
    mediumLoose
  );

  const largeEggs = getEggs(
    large,
    largeTrays,
    largeLoose
  );

  const xlargeEggs = getEggs(
    xlarge,
    xlargeTrays,
    xlargeLoose
  );

  const jumboEggs = getEggs(
    jumbo,
    jumboTrays,
    jumboLoose
  );

  const totalEggs =
    pulletEggs +
    smallEggs +
    mediumEggs +
    largeEggs +
    xlargeEggs +
    jumboEggs;

  const completeTrays = Math.floor(
    totalEggs / EGGS_PER_TRAY
  );

  const looseEggs = totalEggs % EGGS_PER_TRAY;

  const handleSave = () => {
    const eggValues = [
      pullet,
      small,
      medium,
      large,
      xlarge,
      jumbo,
    ];

    const trayValues = [
      pulletTrays,
      smallTrays,
      mediumTrays,
      largeTrays,
      xlargeTrays,
      jumboTrays,
    ];

    const looseValues = [
      pulletLoose,
      smallLoose,
      mediumLoose,
      largeLoose,
      xlargeLoose,
      jumboLoose,
    ];

    const valuesToCheck =
      inputMode === 'eggs'
        ? eggValues
        : [...trayValues, ...looseValues];

    const hasInvalidValue = valuesToCheck.some(value => {
      if (value.trim() === '') {
        return false;
      }

      return (
        Number(value) < 0 ||
        !Number.isInteger(Number(value))
      );
    });

    if (hasInvalidValue) {
      Alert.alert(
        'Invalid Input',
        'All quantities must be whole numbers that are 0 or greater.'
      );

      return;
    }

    if (inputMode === 'trays') {
      const looseNumbers = looseValues.map(
        value => Number(value) || 0
      );

      const hasTooManyLooseEggs = looseNumbers.some(
        value => value >= EGGS_PER_TRAY
      );

      if (hasTooManyLooseEggs) {
        Alert.alert(
          'Invalid Loose Egg Quantity',
          'Loose eggs must be less than 30. Enter another tray instead.'
        );

        return;
      }
    }

    if (totalEggs === 0) {
      Alert.alert(
        'No Eggs Entered',
        'Please enter at least one egg.'
      );

      return;
    }

    addProduction({
      pullet: pulletEggs,
      small: smallEggs,
      medium: mediumEggs,
      large: largeEggs,
      xlarge: xlargeEggs,
      jumbo: jumboEggs,
    });

    setPullet('');
    setSmall('');
    setMedium('');
    setLarge('');
    setXlarge('');
    setJumbo('');

    setPulletTrays('');
    setPulletLoose('');
    setSmallTrays('');
    setSmallLoose('');
    setMediumTrays('');
    setMediumLoose('');
    setLargeTrays('');
    setLargeLoose('');
    setXlargeTrays('');
    setXlargeLoose('');
    setJumboTrays('');
    setJumboLoose('');

    Alert.alert(
      'Production Saved',
      `${totalEggs} eggs have been added to inventory.`
    );
  };

  const renderEggInput = (
    name,
    value,
    setValue
  ) => {
    const total = Number(value) || 0;

    return (
      <View style={styles.sizeCard}>
        <Text style={styles.sizeTitle}>{name}</Text>

        <Text style={styles.inputLabel}>
          Number of Eggs
        </Text>

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder="0"
          keyboardType="numeric"
          maxLength={5}
        />

        <Text style={styles.calculatedText}>
          Total: {total} eggs
        </Text>
      </View>
    );
  };

  const renderTrayInput = (
    name,
    trays,
    setTrays,
    loose,
    setLoose
  ) => {
    const total =
      (Number(trays) || 0) * EGGS_PER_TRAY +
      (Number(loose) || 0);

    return (
      <View style={styles.sizeCard}>
        <Text style={styles.sizeTitle}>{name}</Text>

        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Trays
            </Text>

            <TextInput
              style={styles.input}
              value={trays}
              onChangeText={setTrays}
              placeholder="0"
              keyboardType="numeric"
              maxLength={4}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Loose Eggs
            </Text>

            <TextInput
              style={styles.input}
              value={loose}
              onChangeText={setLoose}
              placeholder="0"
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
        </View>

        <Text style={styles.calculatedText}>
          Total: {total} eggs
        </Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <Text style={styles.title}>
          Record Egg Production
        </Text>

        <Text style={styles.description}>
          Choose how you want to record the collected eggs.
        </Text>

        <View style={styles.modeCard}>
          <Text style={styles.modeTitle}>
            Recording Method
          </Text>

          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                inputMode === 'eggs' &&
                  styles.activeModeButton,
              ]}
              onPress={() => setInputMode('eggs')}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  inputMode === 'eggs' &&
                    styles.activeModeButtonText,
                ]}
              >
                Eggs
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                inputMode === 'trays' &&
                  styles.activeModeButton,
              ]}
              onPress={() => setInputMode('trays')}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  inputMode === 'trays' &&
                    styles.activeModeButtonText,
                ]}
              >
                Trays + Loose
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modeDescription}>
            {inputMode === 'eggs'
              ? 'Enter the exact number of eggs collected.'
              : 'Enter complete trays and remaining loose eggs. One tray contains 30 eggs.'}
          </Text>
        </View>

        {inputMode === 'eggs' ? (
          <>
            {renderEggInput(
              'Pullet',
              pullet,
              setPullet
            )}

            {renderEggInput(
              'Small',
              small,
              setSmall
            )}

            {renderEggInput(
              'Medium',
              medium,
              setMedium
            )}

            {renderEggInput(
              'Large',
              large,
              setLarge
            )}

            {renderEggInput(
              'X-Large',
              xlarge,
              setXlarge
            )}

            {renderEggInput(
              'Jumbo',
              jumbo,
              setJumbo
            )}
          </>
        ) : (
          <>
            {renderTrayInput(
              'Pullet',
              pulletTrays,
              setPulletTrays,
              pulletLoose,
              setPulletLoose
            )}

            {renderTrayInput(
              'Small',
              smallTrays,
              setSmallTrays,
              smallLoose,
              setSmallLoose
            )}

            {renderTrayInput(
              'Medium',
              mediumTrays,
              setMediumTrays,
              mediumLoose,
              setMediumLoose
            )}

            {renderTrayInput(
              'Large',
              largeTrays,
              setLargeTrays,
              largeLoose,
              setLargeLoose
            )}

            {renderTrayInput(
              'X-Large',
              xlargeTrays,
              setXlargeTrays,
              xlargeLoose,
              setXlargeLoose
            )}

            {renderTrayInput(
              'Jumbo',
              jumboTrays,
              setJumboTrays,
              jumboLoose,
              setJumboLoose
            )}
          </>
        )}

        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>
            Production Summary
          </Text>

          <Text style={styles.resultText}>
            Total Eggs: {totalEggs}
          </Text>

          <Text style={styles.resultText}>
            Complete Trays: {completeTrays}
          </Text>

          <Text style={styles.resultText}>
            Loose Eggs: {looseEggs}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            Save Production
          </Text>
        </TouchableOpacity>

        <Text style={styles.historyTitle}>
          Production History
        </Text>

        {productions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No production recorded yet.
            </Text>
          </View>
        ) : (
          productions.map(record => (
            <View
              key={record.id}
              style={styles.historyCard}
            >
              <Text style={styles.historyDate}>
                {record.date}
              </Text>

              <Text style={styles.historyEggs}>
                {record.totalEggs} eggs
              </Text>

              <Text style={styles.historyDetails}>
                {Math.floor(record.totalEggs / 30)} trays +{' '}
                {record.totalEggs % 30} loose eggs
              </Text>

              <Text style={styles.sizeDetails}>
                Pullet: {record.pullet}
              </Text>

              <Text style={styles.sizeDetails}>
                Small: {record.small}
              </Text>

              <Text style={styles.sizeDetails}>
                Medium: {record.medium}
              </Text>

              <Text style={styles.sizeDetails}>
                Large: {record.large}
              </Text>

              <Text style={styles.sizeDetails}>
                X-Large: {record.xlarge}
              </Text>

              <Text style={styles.sizeDetails}>
                Jumbo: {record.jumbo}
              </Text>
            </View>
          ))
        )}
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

  modeCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },

  modeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },

  modeButton: {
    flex: 1,
    padding: 13,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
  },

  activeModeButton: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },

  modeButtonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#374151',
  },

  activeModeButtonText: {
    color: '#FFFFFF',
  },

  modeDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 12,
  },

  sizeCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  sizeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },

  inputContainer: {
    flex: 1,
  },

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
    padding: 13,
    fontSize: 17,
  },

  calculatedText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
  },

  resultCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },

  resultTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  resultText: {
    fontSize: 16,
    marginVertical: 4,
  },

  saveButton: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
  },

  saveButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },

  historyTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },

  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
  },

  historyCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  historyDate: {
    fontSize: 13,
    color: '#6B7280',
  },

  historyEggs: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },

  historyDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
  },

  sizeDetails: {
    fontSize: 14,
    marginTop: 3,
  },
});