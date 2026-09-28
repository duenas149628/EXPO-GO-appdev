import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from 'react-native';

import { EggContext } from '../EggContext';

const EGGS_PER_TRAY = 30;

export default function ProductionScreen() {
  const [inputMode, setInputMode] = useState('eggs');

  // =========================
  // EGG INPUTS
  // =========================

  const [pullet, setPullet] = useState('');
  const [small, setSmall] = useState('');
  const [medium, setMedium] = useState('');
  const [large, setLarge] = useState('');
  const [xlarge, setXlarge] = useState('');
  const [jumbo, setJumbo] = useState('');

  // =========================
  // TRAY INPUTS
  // =========================

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

  const {
    addProduction,
    productions,
  } = useContext(EggContext);

  // =========================
  // CALCULATE EGGS
  // =========================

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

  // =========================
  // TOTAL PRODUCTION
  // =========================

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

  // =========================
  // SAVE PRODUCTION
  // =========================

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

    // Check invalid values
    const hasInvalidValue = valuesToCheck.some(
      (value) => {
        if (value.trim() === '') {
          return false;
        }

        return (
          Number(value) < 0 ||
          !Number.isInteger(Number(value))
        );
      }
    );

    if (hasInvalidValue) {
      Alert.alert(
        'Invalid Input',
        'All quantities must be whole numbers that are 0 or greater.'
      );

      return;
    }

    // Check loose eggs
    if (inputMode === 'trays') {
      const looseNumbers = looseValues.map(
        (value) => Number(value) || 0
      );

      const hasTooManyLooseEggs =
        looseNumbers.some(
          (value) => value >= EGGS_PER_TRAY
        );

      if (hasTooManyLooseEggs) {
        Alert.alert(
          'Invalid Loose Egg Quantity',
          'Loose eggs must be less than 30. Enter another tray instead.'
        );

        return;
      }
    }

    // Check if no eggs were entered
    if (totalEggs === 0) {
      Alert.alert(
        'No Eggs Entered',
        'Please enter at least one egg.'
      );

      return;
    }

    // Save production
    addProduction({
      pullet: pulletEggs,
      small: smallEggs,
      medium: mediumEggs,
      large: largeEggs,
      xlarge: xlargeEggs,
      jumbo: jumboEggs,
    });

    // Clear inputs
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

  // =========================
  // EGG INPUT CARD
  // =========================

  const renderEggInput = (
    name,
    value,
    setValue
  ) => {
    const total = Number(value) || 0;

    return (
      <View style={styles.sizeCard}>

        <Text style={styles.sizeTitle}>
          {name}
        </Text>

        <Text style={styles.inputLabel}>
          Number of Eggs
        </Text>

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder="0"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          maxLength={5}
        />

        <Text style={styles.calculatedText}>
          Total: {total} eggs
        </Text>

      </View>
    );
  };

  // =========================
  // TRAY INPUT CARD
  // =========================

  const renderTrayInput = (
    name,
    trays,
    setTrays,
    loose,
    setLoose
  ) => {
    const total =
      (Number(trays) || 0) *
        EGGS_PER_TRAY +
      (Number(loose) || 0);

    return (
      <View style={styles.sizeCard}>

        <Text style={styles.sizeTitle}>
          {name}
        </Text>

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
              placeholderTextColor="#9CA3AF"
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
              placeholderTextColor="#9CA3AF"
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
    <ImageBackground
      source={{
        uri: 'https://img.freepik.com/premium-photo/side-profile-chicken-against-pink-background-concept-animal-photography-still-life-pink-backgrounds_864588-56895.jpg',
      }}
      style={styles.background}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >

      {/* LIGHT OVERLAY */}

      <View style={styles.overlay}>

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >

          {/* =========================
              HEADER
          ========================= */}

          <View style={styles.header}>

            <Text style={styles.title}>
              Record Egg Production
            </Text>

            <Text style={styles.subtitle}>
              Record the collected eggs by size and update your inventory.
            </Text>

          </View>

          {/* =========================
              RECORDING METHOD
          ========================= */}

          <Text style={styles.sectionTitle}>
            Recording Method
          </Text>

          <View style={styles.modeCard}>

            <View style={styles.modeRow}>

              <TouchableOpacity
                style={[
                  styles.modeButton,
                  inputMode === 'eggs' &&
                    styles.activeModeButton,
                ]}
                onPress={() =>
                  setInputMode('eggs')
                }
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
                onPress={() =>
                  setInputMode('trays')
                }
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

          {/* =========================
              EGG SIZE INPUTS
          ========================= */}

          <Text style={styles.sectionTitle}>
            Production by Size
          </Text>

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

          {/* =========================
              PRODUCTION SUMMARY
          ========================= */}

          <Text style={styles.sectionTitle}>
            Production Summary
          </Text>

          <View style={styles.resultCard}>

            <View style={styles.resultRow}>

              <Text style={styles.resultLabel}>
                Total Eggs
              </Text>

              <Text style={styles.resultValue}>
                {totalEggs}
              </Text>

            </View>

            <View style={styles.resultRow}>

              <Text style={styles.resultLabel}>
                Complete Trays
              </Text>

              <Text style={styles.resultValue}>
                {completeTrays}
              </Text>

            </View>

            <View
              style={[
                styles.resultRow,
                styles.lastResultRow,
              ]}
            >

              <Text style={styles.resultLabel}>
                Loose Eggs
              </Text>

              <Text style={styles.resultValue}>
                {looseEggs}
              </Text>

            </View>

          </View>

          {/* =========================
              SAVE BUTTON
          ========================= */}

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >

            <Text style={styles.saveButtonText}>
              Save Production
            </Text>

          </TouchableOpacity>

          {/* =========================
              PRODUCTION HISTORY
          ========================= */}

          <Text style={styles.sectionTitle}>
            Production History
          </Text>

          {productions.length === 0 ? (

            <View style={styles.emptyCard}>

              <Text style={styles.emptyTitle}>
                No Production Yet
              </Text>

              <Text style={styles.emptyText}>
                No production records have been saved yet.
              </Text>

            </View>

          ) : (

            productions.map((record) => (

              <View
                key={record.id}
                style={styles.historyCard}
              >

                <View style={styles.historyHeader}>

                  <View>

                    <Text style={styles.historyTitle}>
                      Production Record
                    </Text>

                    <Text style={styles.historyDate}>
                      {record.date}
                    </Text>

                  </View>

                  <Text style={styles.historyEggs}>
                    {record.totalEggs} eggs
                  </Text>

                </View>

                <View style={styles.historySummary}>

                  <Text style={styles.historyDetails}>
                    {Math.floor(
                      record.totalEggs / EGGS_PER_TRAY
                    )}{' '}
                    {Math.floor(
                      record.totalEggs / EGGS_PER_TRAY
                    ) === 1
                      ? 'tray'
                      : 'trays'}
                    {' + '}
                    {record.totalEggs %
                      EGGS_PER_TRAY}{' '}
                    loose eggs
                  </Text>

                </View>

                <View style={styles.sizeDetailsContainer}>

                  <View style={styles.historySizeRow}>
                    <Text style={styles.sizeDetailsLabel}>
                      Pullet
                    </Text>

                    <Text style={styles.sizeDetailsValue}>
                      {record.pullet}
                    </Text>
                  </View>

                  <View style={styles.historySizeRow}>
                    <Text style={styles.sizeDetailsLabel}>
                      Small
                    </Text>

                    <Text style={styles.sizeDetailsValue}>
                      {record.small}
                    </Text>
                  </View>

                  <View style={styles.historySizeRow}>
                    <Text style={styles.sizeDetailsLabel}>
                      Medium
                    </Text>

                    <Text style={styles.sizeDetailsValue}>
                      {record.medium}
                    </Text>
                  </View>

                  <View style={styles.historySizeRow}>
                    <Text style={styles.sizeDetailsLabel}>
                      Large
                    </Text>

                    <Text style={styles.sizeDetailsValue}>
                      {record.large}
                    </Text>
                  </View>

                  <View style={styles.historySizeRow}>
                    <Text style={styles.sizeDetailsLabel}>
                      X-Large
                    </Text>

                    <Text style={styles.sizeDetailsValue}>
                      {record.xlarge}
                    </Text>
                  </View>

                  <View style={styles.historySizeRow}>
                    <Text style={styles.sizeDetailsLabel}>
                      Jumbo
                    </Text>

                    <Text style={styles.sizeDetailsValue}>
                      {record.jumbo}
                    </Text>
                  </View>

                </View>

              </View>

            ))

          )}

          <View style={styles.bottomSpace} />

        </ScrollView>

      </View>

    </ImageBackground>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  // =========================
  // BACKGROUND
  // =========================

  background: {
    flex: 1,
  },

  backgroundImage: {
    opacity: 0.75,
    resizeMode: 'cover',
    alignSelf: 'center',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(245, 247, 250, 0.35)',
  },

  // =========================
  // CONTAINER
  // =========================

  container: {
    flex: 1,
  },

  // =========================
  // HEADER
  // =========================

  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.90)',

    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 22,

    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',

    elevation: 2,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',

    marginTop: 5,

    lineHeight: 20,
  },

  // =========================
  // SECTION TITLE
  // =========================

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',

    color: '#1F2937',

    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 10,
  },

  // =========================
  // RECORDING METHOD
  // =========================

  modeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',

    marginHorizontal: 20,

    padding: 15,

    borderRadius: 14,

    elevation: 3,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,

    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },

  modeButton: {
    flex: 1,

    paddingVertical: 13,

    borderWidth: 1,
    borderColor: '#D1D5DB',

    borderRadius: 10,

    backgroundColor: '#F9FAFB',
  },

  activeModeButton: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
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

    lineHeight: 19,
  },

  // =========================
  // SIZE CARD
  // =========================

  sizeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',

    marginHorizontal: 20,
    marginBottom: 12,

    padding: 18,

    borderRadius: 14,

    elevation: 3,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,

    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  sizeTitle: {
    fontSize: 18,

    fontWeight: 'bold',

    color: '#1F2937',

    marginBottom: 12,
  },

  // =========================
  // INPUT
  // =========================

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

    paddingHorizontal: 13,
    paddingVertical: 12,

    fontSize: 17,

    color: '#1F2937',
  },

  calculatedText: {
    fontSize: 14,

    fontWeight: 'bold',

    color: '#2563EB',

    marginTop: 10,
  },

  // =========================
  // RESULT CARD
  // =========================

  resultCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',

    marginHorizontal: 20,

    padding: 10,

    borderRadius: 14,

    elevation: 3,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,

    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  resultRow: {
    flexDirection: 'row',

    justifyContent: 'space-between',
    alignItems: 'center',

    paddingVertical: 13,
    paddingHorizontal: 10,

    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  lastResultRow: {
    borderBottomWidth: 0,
  },

  resultLabel: {
    fontSize: 15,

    fontWeight: 'bold',

    color: '#374151',
  },

  resultValue: {
    fontSize: 16,

    fontWeight: 'bold',

    color: '#2563EB',
  },

  // =========================
  // SAVE BUTTON
  // =========================

  saveButton: {
    backgroundColor: '#2563EB',

    marginHorizontal: 20,
    marginTop: 20,

    paddingVertical: 16,

    borderRadius: 12,

    elevation: 3,

    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,

    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  saveButtonText: {
    color: '#FFFFFF',

    textAlign: 'center',

    fontSize: 16,

    fontWeight: 'bold',
  },

  // =========================
  // HISTORY CARD
  // =========================

  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',

    marginHorizontal: 20,
    marginBottom: 10,

    padding: 17,

    borderRadius: 14,

    elevation: 3,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,

    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  historyHeader: {
    flexDirection: 'row',

    justifyContent: 'space-between',
    alignItems: 'center',

    paddingBottom: 12,

    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  historyTitle: {
    fontSize: 16,

    fontWeight: 'bold',

    color: '#1F2937',
  },

  historyDate: {
    fontSize: 13,

    color: '#6B7280',

    marginTop: 3,
  },

  historyEggs: {
    fontSize: 18,

    fontWeight: 'bold',

    color: '#16A34A',
  },

  historySummary: {
    paddingVertical: 10,
  },

  historyDetails: {
    fontSize: 14,

    color: '#6B7280',
  },

  // =========================
  // SIZE DETAILS
  // =========================

  sizeDetailsContainer: {
    borderTopWidth: 1,

    borderTopColor: '#E5E7EB',

    paddingTop: 7,
  },

  historySizeRow: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    paddingVertical: 5,
  },

  sizeDetailsLabel: {
    fontSize: 14,

    color: '#6B7280',
  },

  sizeDetailsValue: {
    fontSize: 14,

    fontWeight: '600',

    color: '#374151',
  },

  // =========================
  // EMPTY STATE
  // =========================

  emptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',

    marginHorizontal: 20,

    padding: 25,

    borderRadius: 14,

    elevation: 3,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,

    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  emptyTitle: {
    fontSize: 17,

    fontWeight: 'bold',

    color: '#1F2937',

    textAlign: 'center',
  },

  emptyText: {
    fontSize: 14,

    color: '#6B7280',

    textAlign: 'center',

    marginTop: 5,
  },

  // =========================
  // BOTTOM SPACE
  // =========================

  bottomSpace: {
    height: 35,
  },

});