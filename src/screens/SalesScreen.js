import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from 'react-native';

import { EggContext } from '../EggContext';

const EGGS_PER_TRAY = 30;

const BACKGROUND_IMAGE =
  'https://img.freepik.com/premium-photo/side-profile-chicken-against-pink-background-concept-animal-photography-still-life-pink-backgrounds_864588-56895.jpg';

export default function SalesScreen() {
  const {
    inventory,
    sales,
    sellEggs,
    addSale,
  } = useContext(EggContext);

  // =====================================================
  // INPUT MODE
  // =====================================================

  const [inputMode, setInputMode] = useState('eggs');

  // =====================================================
  // EGG INPUTS
  // =====================================================

  const [pullet, setPullet] = useState('');
  const [small, setSmall] = useState('');
  const [medium, setMedium] = useState('');
  const [large, setLarge] = useState('');
  const [xlarge, setXlarge] = useState('');
  const [jumbo, setJumbo] = useState('');

  // =====================================================
  // TRAY INPUTS
  // =====================================================

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

  // =====================================================
  // PRICES PER EGG
  // =====================================================

  const [pulletPrice, setPulletPrice] = useState('');
  const [smallPrice, setSmallPrice] = useState('');
  const [mediumPrice, setMediumPrice] = useState('');
  const [largePrice, setLargePrice] = useState('');
  const [xlargePrice, setXlargePrice] = useState('');
  const [jumboPrice, setJumboPrice] = useState('');

  // =====================================================
  // CONVERT INPUT TO EGGS
  // =====================================================

  const getEggs = (eggs, trays, loose) => {
    if (inputMode === 'eggs') {
      return Number(eggs) || 0;
    }

    return (
      (Number(trays) || 0) * EGGS_PER_TRAY +
      (Number(loose) || 0)
    );
  };

  // =====================================================
  // TOTAL EGGS PER SIZE
  // =====================================================

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

  // =====================================================
  // TOTAL EGGS
  // =====================================================

  const totalEggs =
    pulletEggs +
    smallEggs +
    mediumEggs +
    largeEggs +
    xlargeEggs +
    jumboEggs;

  // =====================================================
  // TOTAL AMOUNT
  // =====================================================

  const totalAmount =
    pulletEggs * (Number(pulletPrice) || 0) +
    smallEggs * (Number(smallPrice) || 0) +
    mediumEggs * (Number(mediumPrice) || 0) +
    largeEggs * (Number(largePrice) || 0) +
    xlargeEggs * (Number(xlargePrice) || 0) +
    jumboEggs * (Number(jumboPrice) || 0);

  // =====================================================
  // FORMAT EGGS AS TRAYS
  // =====================================================

  const formatEggsAsTrays = eggs => {
    const trays = Math.floor(eggs / EGGS_PER_TRAY);
    const loose = eggs % EGGS_PER_TRAY;

    if (trays > 0 && loose > 0) {
      return `${trays} tray${
        trays !== 1 ? 's' : ''
      } + ${loose} eggs`;
    }

    if (trays > 0) {
      return `${trays} tray${
        trays !== 1 ? 's' : ''
      }`;
    }

    return `${loose} eggs`;
  };

  // =====================================================
  // VALIDATE NUMBER
  // =====================================================

  const isValidWholeNumber = value => {
    if (value.trim() === '') {
      return true;
    }

    const number = Number(value);

    return (
      number >= 0 &&
      Number.isInteger(number)
    );
  };

  // =====================================================
  // SAVE SALE
  // =====================================================

  const handleSaveSale = () => {
    // -----------------------------------------------
    // CHECK QUANTITIES
    // -----------------------------------------------

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

    const priceValues = [
      pulletPrice,
      smallPrice,
      mediumPrice,
      largePrice,
      xlargePrice,
      jumboPrice,
    ];

    const valuesToCheck =
      inputMode === 'eggs'
        ? [...eggValues, ...priceValues]
        : [
            ...trayValues,
            ...looseValues,
            ...priceValues,
          ];

    const hasInvalidNumber =
      valuesToCheck.some(
        value => !isValidWholeNumber(value)
      );

    if (hasInvalidNumber) {
      Alert.alert(
        'Invalid Input',
        'Quantities and prices must be whole numbers that are 0 or greater.'
      );

      return;
    }

    // -----------------------------------------------
    // CHECK LOOSE EGGS
    // -----------------------------------------------

    if (inputMode === 'trays') {
      const looseNumbers = looseValues.map(
        value => Number(value) || 0
      );

      const hasTooManyLooseEggs =
        looseNumbers.some(
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

    // -----------------------------------------------
    // CHECK TOTAL EGGS
    // -----------------------------------------------

    if (totalEggs === 0) {
      Alert.alert(
        'No Eggs Entered',
        'Please enter at least one egg to record a sale.'
      );

      return;
    }

    // -----------------------------------------------
    // CHECK PRICE
    // -----------------------------------------------

    if (totalAmount <= 0) {
      Alert.alert(
        'Invalid Price',
        'Please enter a price for the eggs being sold.'
      );

      return;
    }

    // -----------------------------------------------
    // CHECK INVENTORY
    // -----------------------------------------------

    if (pulletEggs > inventory.pullet) {
      Alert.alert(
        'Insufficient Pullet Stock',
        `You only have ${inventory.pullet} pullet eggs available.`
      );

      return;
    }

    if (smallEggs > inventory.small) {
      Alert.alert(
        'Insufficient Small Stock',
        `You only have ${inventory.small} small eggs available.`
      );

      return;
    }

    if (mediumEggs > inventory.medium) {
      Alert.alert(
        'Insufficient Medium Stock',
        `You only have ${inventory.medium} medium eggs available.`
      );

      return;
    }

    if (largeEggs > inventory.large) {
      Alert.alert(
        'Insufficient Large Stock',
        `You only have ${inventory.large} large eggs available.`
      );

      return;
    }

    if (xlargeEggs > inventory.xlarge) {
      Alert.alert(
        'Insufficient X-Large Stock',
        `You only have ${inventory.xlarge} X-Large eggs available.`
      );

      return;
    }

    if (jumboEggs > inventory.jumbo) {
      Alert.alert(
        'Insufficient Jumbo Stock',
        `You only have ${inventory.jumbo} jumbo eggs available.`
      );

      return;
    }

    // -----------------------------------------------
    // REMOVE FROM INVENTORY
    // -----------------------------------------------

    const saleData = {
      pullet: pulletEggs,
      small: smallEggs,
      medium: mediumEggs,
      large: largeEggs,
      xlarge: xlargeEggs,
      jumbo: jumboEggs,
    };

    const saleSuccessful = sellEggs(
      saleData
    );

    if (!saleSuccessful) {
      Alert.alert(
        'Sale Failed',
        'There is not enough inventory for this sale.'
      );

      return;
    }

    // -----------------------------------------------
    // CREATE SALE RECORD
    // -----------------------------------------------

    const sale = {
      id: Date.now(),

      date: new Date()
        .toISOString()
        .split('T')[0],

      inputMode,

      pullet: pulletEggs,
      small: smallEggs,
      medium: mediumEggs,
      large: largeEggs,
      xlarge: xlargeEggs,
      jumbo: jumboEggs,

      totalEggs,

      totalAmount: Number(
        totalAmount.toFixed(2)
      ),
    };

    // -----------------------------------------------
    // SAVE SALE
    // -----------------------------------------------

    addSale(sale);

    // -----------------------------------------------
    // CLEAR FORM
    // -----------------------------------------------

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

    setPulletPrice('');
    setSmallPrice('');
    setMediumPrice('');
    setLargePrice('');
    setXlargePrice('');
    setJumboPrice('');

    Alert.alert(
      'Sale Recorded',
      `${totalEggs} eggs sold for ₱${totalAmount.toFixed(
        2
      )}.`
    );
  };

  // =====================================================
  // EGG INPUT COMPONENT
  // =====================================================

  const renderEggInput = (
    name,
    value,
    setValue,
    price,
    setPrice
  ) => {
    const total = Number(value) || 0;
    const amount =
      total * (Number(price) || 0);

    return (
      <View style={styles.sizeCard}>
        <View style={styles.sizeHeader}>
          <Text style={styles.sizeTitle}>
            {name}
          </Text>

          <Text style={styles.stockText}>
            Stock:{' '}
            {inventory[
              name === 'X-Large'
                ? 'xlarge'
                : name.toLowerCase()
            ]}
          </Text>
        </View>

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

        <Text style={styles.inputLabel}>
          Price per Egg (₱)
        </Text>

        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="0.00"
          keyboardType="decimal-pad"
          maxLength={8}
        />

        <View style={styles.calculatedRow}>
          <Text style={styles.calculatedText}>
            Eggs: {total}
          </Text>

          <Text style={styles.calculatedAmount}>
            ₱{amount.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  // =====================================================
  // TRAY INPUT COMPONENT
  // =====================================================

  const renderTrayInput = (
    name,
    trays,
    setTrays,
    loose,
    setLoose,
    price,
    setPrice
  ) => {
    const total =
      (Number(trays) || 0) *
        EGGS_PER_TRAY +
      (Number(loose) || 0);

    const amount =
      total * (Number(price) || 0);

    const inventoryKey =
      name === 'X-Large'
        ? 'xlarge'
        : name.toLowerCase();

    return (
      <View style={styles.sizeCard}>
        <View style={styles.sizeHeader}>
          <Text style={styles.sizeTitle}>
            {name}
          </Text>

          <Text style={styles.stockText}>
            Stock: {inventory[inventoryKey]}
          </Text>
        </View>

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

        <Text style={styles.inputLabel}>
          Price per Egg (₱)
        </Text>

        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="0.00"
          keyboardType="decimal-pad"
          maxLength={8}
        />

        <View style={styles.calculatedRow}>
          <Text style={styles.calculatedText}>
            Total: {total} eggs
          </Text>

          <Text style={styles.calculatedAmount}>
            ₱{amount.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <ImageBackground
      source={{
        uri: BACKGROUND_IMAGE,
      }}
      style={styles.background}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={
            styles.contentContainer
          }
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}

          <View style={styles.header}>
            <Text style={styles.title}>
              Record Egg Sale
            </Text>

            <Text style={styles.description}>
              Record eggs sold and automatically
              update your inventory.
            </Text>
          </View>

          {/* RECORDING METHOD */}

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
                ? 'Enter the exact number of eggs sold.'
                : 'Enter complete trays and remaining loose eggs. One tray contains 30 eggs.'}
            </Text>
          </View>

          {/* EGG INPUTS */}

          {inputMode === 'eggs' ? (
            <>
              {renderEggInput(
                'Pullet',
                pullet,
                setPullet,
                pulletPrice,
                setPulletPrice
              )}

              {renderEggInput(
                'Small',
                small,
                setSmall,
                smallPrice,
                setSmallPrice
              )}

              {renderEggInput(
                'Medium',
                medium,
                setMedium,
                mediumPrice,
                setMediumPrice
              )}

              {renderEggInput(
                'Large',
                large,
                setLarge,
                largePrice,
                setLargePrice
              )}

              {renderEggInput(
                'X-Large',
                xlarge,
                setXlarge,
                xlargePrice,
                setXlargePrice
              )}

              {renderEggInput(
                'Jumbo',
                jumbo,
                setJumbo,
                jumboPrice,
                setJumboPrice
              )}
            </>
          ) : (
            <>
              {renderTrayInput(
                'Pullet',
                pulletTrays,
                setPulletTrays,
                pulletLoose,
                setPulletLoose,
                pulletPrice,
                setPulletPrice
              )}

              {renderTrayInput(
                'Small',
                smallTrays,
                setSmallTrays,
                smallLoose,
                setSmallLoose,
                smallPrice,
                setSmallPrice
              )}

              {renderTrayInput(
                'Medium',
                mediumTrays,
                setMediumTrays,
                mediumLoose,
                setMediumLoose,
                mediumPrice,
                setMediumPrice
              )}

              {renderTrayInput(
                'Large',
                largeTrays,
                setLargeTrays,
                largeLoose,
                setLargeLoose,
                largePrice,
                setLargePrice
              )}

              {renderTrayInput(
                'X-Large',
                xlargeTrays,
                setXlargeTrays,
                xlargeLoose,
                setXlargeLoose,
                xlargePrice,
                setXlargePrice
              )}

              {renderTrayInput(
                'Jumbo',
                jumboTrays,
                setJumboTrays,
                jumboLoose,
                setJumboLoose,
                jumboPrice,
                setJumboPrice
              )}
            </>
          )}

          {/* SALE SUMMARY */}

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>
              Sale Summary
            </Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Total Eggs
              </Text>

              <Text style={styles.summaryValue}>
                {totalEggs}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Equivalent
              </Text>

              <Text style={styles.summaryValue}>
                {formatEggsAsTrays(totalEggs)}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>
                Total Amount
              </Text>

              <Text style={styles.totalAmount}>
                ₱{totalAmount.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* SAVE BUTTON */}

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveSale}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>
              Save Sale
            </Text>
          </TouchableOpacity>

          {/* SALES HISTORY */}

          <Text style={styles.historyTitle}>
            Sales History
          </Text>

          {sales.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No sales recorded yet.
              </Text>
            </View>
          ) : (
            sales.map(sale => (
              <View
                key={sale.id}
                style={styles.saleCard}
              >
                <View
                  style={styles.saleHeader}
                >
                  <View>
                    <Text
                      style={styles.saleTitle}
                    >
                      Egg Sale
                    </Text>

                    <Text
                      style={styles.saleDate}
                    >
                      {sale.date}
                    </Text>
                  </View>

                  <Text
                    style={styles.saleAmount}
                  >
                    ₱
                    {Number(
                      sale.totalAmount || 0
                    ).toFixed(2)}
                  </Text>
                </View>

                <Text
                  style={styles.saleEggs}
                >
                  {sale.totalEggs} eggs
                </Text>

                <Text
                  style={styles.saleTrayText}
                >
                  {formatEggsAsTrays(
                    sale.totalEggs
                  )}
                </Text>

                <Text
                  style={styles.saleMethod}
                >
                  Method:{' '}
                  {sale.inputMode ===
                  'trays'
                    ? 'Trays + Loose'
                    : 'Eggs'}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  backgroundImage: {
    opacity: 0.7,
    resizeMode: 'cover',
  },

  overlay: {
    flex: 1,
    backgroundColor:
      'rgba(245, 247, 250, 0.40)',
  },

  container: {
    flex: 1,
  },

  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  // ===================================================
  // HEADER
  // ===================================================

  header: {
    backgroundColor:
      'rgba(255, 255, 255, 0.90)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 3,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  description: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 20,
  },

  // ===================================================
  // MODE
  // ===================================================

  modeCard: {
    backgroundColor:
      'rgba(255, 255, 255, 0.94)',
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
    elevation: 3,
  },

  modeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
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
    lineHeight: 19,
  },

  // ===================================================
  // SIZE CARD
  // ===================================================

  sizeCard: {
    backgroundColor:
      'rgba(255, 255, 255, 0.94)',
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 3,
  },

  sizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sizeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  stockText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563EB',
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
    marginTop: 5,
  },

  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 13,
    fontSize: 17,
    color: '#111827',
  },

  calculatedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  calculatedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },

  calculatedAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#16A34A',
  },

  // ===================================================
  // SUMMARY
  // ===================================================

  summaryCard: {
    backgroundColor:
      'rgba(255, 255, 255, 0.96)',
    padding: 20,
    borderRadius: 14,
    marginTop: 8,
    elevation: 3,
  },

  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },

  summaryLabel: {
    fontSize: 15,
    color: '#6B7280',
  },

  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },

  totalLabel: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  totalAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#16A34A',
  },

  // ===================================================
  // SAVE BUTTON
  // ===================================================

  saveButton: {
    backgroundColor: '#111827',
    padding: 17,
    borderRadius: 12,
    marginTop: 18,
    elevation: 3,
  },

  saveButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 'bold',
  },

  // ===================================================
  // HISTORY
  // ===================================================

  historyTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 30,
    marginBottom: 12,
  },

  emptyCard: {
    backgroundColor:
      'rgba(255, 255, 255, 0.94)',
    padding: 20,
    borderRadius: 14,
    elevation: 2,
  },

  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
  },

  saleCard: {
    backgroundColor:
      'rgba(255, 255, 255, 0.94)',
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 3,
  },

  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  saleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  saleDate: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  saleAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16A34A',
  },

  saleEggs: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 12,
  },

  saleTrayText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },

  saleMethod: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
  },
});