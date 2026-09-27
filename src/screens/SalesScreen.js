import React, { useContext, useState } from 'react';
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

const EGG_SIZES = [
  { key: 'pullet', label: 'Pullet' },
  { key: 'small', label: 'Small' },
  { key: 'medium', label: 'Medium' },
  { key: 'large', label: 'Large' },
  { key: 'xlarge', label: 'X-Large' },
  { key: 'jumbo', label: 'Jumbo' },
];

const emptyValues = {
  pullet: '',
  small: '',
  medium: '',
  large: '',
  xlarge: '',
  jumbo: '',
};

export default function SalesScreen() {
  const {
    inventory,
    sales,
    sellEggs,
    addSale,
  } = useContext(EggContext);

  const [inputMode, setInputMode] = useState('eggs');

  const [quantities, setQuantities] = useState(emptyValues);
  const [prices, setPrices] = useState(emptyValues);

  const updateValue = (key, value) => {
    setQuantities(previous => ({
      ...previous,
      [key]: value,
    }));
  };

  const updatePrice = (key, value) => {
    setPrices(previous => ({
      ...previous,
      [key]: value,
    }));
  };

  const getNumber = value => {
    if (value === '') {
      return 0;
    }

    return Number(value);
  };

  const calculateSale = () => {
    const result = {
      pullet: 0,
      small: 0,
      medium: 0,
      large: 0,
      xlarge: 0,
      jumbo: 0,
      totalEggs: 0,
      totalAmount: 0,
    };

    EGG_SIZES.forEach(size => {
      const key = size.key;
      const quantity = getNumber(quantities[key]);
      const price = getNumber(prices[key]);

      let eggs;

      if (inputMode === 'trays') {
        eggs = quantity * 30;
      } else {
        eggs = quantity;
      }

      result[key] = eggs;
      result.totalEggs += eggs;
      result.totalAmount += quantity * price;
    });

    return result;
  };

  const validateWholeNumber = (value, fieldName) => {
    if (value === '') {
      return true;
    }

    const number = Number(value);

    if (!Number.isInteger(number) || number < 0) {
      Alert.alert(
        'Invalid Input',
        `${fieldName} must be a whole number greater than or equal to 0.`
      );

      return false;
    }

    return true;
  };

  const validatePrice = (value, fieldName) => {
    if (value === '') {
      return true;
    }

    const number = Number(value);

    if (isNaN(number) || number < 0) {
      Alert.alert(
        'Invalid Price',
        `${fieldName} must be a valid price greater than or equal to 0.`
      );

      return false;
    }

    return true;
  };

  const handleSaveSale = () => {
    let hasQuantity = false;

    // Validate quantities
    for (const size of EGG_SIZES) {
      const key = size.key;
      const quantity = quantities[key];

      const fieldName =
        inputMode === 'trays'
          ? `${size.label} trays`
          : `${size.label} eggs`;

      if (!validateWholeNumber(quantity, fieldName)) {
        return;
      }

      if (getNumber(quantity) > 0) {
        hasQuantity = true;
      }
    }

    if (!hasQuantity) {
      Alert.alert(
        'No Quantity Entered',
        `Please enter at least one ${inputMode === 'trays' ? 'tray' : 'egg'}.`
      );

      return;
    }

    // Validate prices
    for (const size of EGG_SIZES) {
      const key = size.key;
      const quantity = getNumber(quantities[key]);
      const price = prices[key];

      if (quantity > 0) {
        if (price === '') {
          Alert.alert(
            'Missing Price',
            `Please enter the price ${
              inputMode === 'trays'
                ? 'per tray'
                : 'per egg'
            } for ${size.label}.`
          );

          return;
        }

        if (
          !validatePrice(
            price,
            `${size.label} price ${
              inputMode === 'trays'
                ? 'per tray'
                : 'per egg'
            }`
          )
        ) {
          return;
        }
      }
    }

    const sale = calculateSale();

    // Check inventory
    for (const size of EGG_SIZES) {
      const key = size.key;

      if (sale[key] > inventory[key]) {
        Alert.alert(
          'Insufficient Inventory',
          `You are trying to sell ${sale[key]} ${size.label} eggs, but only ${inventory[key]} are available.`
        );

        return;
      }
    }

    // Deduct inventory
    const successful = sellEggs(sale);

    if (!successful) {
      Alert.alert(
        'Insufficient Inventory',
        'The sale could not be completed because there is not enough inventory.'
      );

      return;
    }

    // Save sale record
    const saleRecord = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],

      pullet: sale.pullet,
      small: sale.small,
      medium: sale.medium,
      large: sale.large,
      xlarge: sale.xlarge,
      jumbo: sale.jumbo,

      totalEggs: sale.totalEggs,
      totalAmount: sale.totalAmount,

      inputMode,

      quantities: {
        pullet: getNumber(quantities.pullet),
        small: getNumber(quantities.small),
        medium: getNumber(quantities.medium),
        large: getNumber(quantities.large),
        xlarge: getNumber(quantities.xlarge),
        jumbo: getNumber(quantities.jumbo),
      },

      prices: {
        pullet: getNumber(prices.pullet),
        small: getNumber(prices.small),
        medium: getNumber(prices.medium),
        large: getNumber(prices.large),
        xlarge: getNumber(prices.xlarge),
        jumbo: getNumber(prices.jumbo),
      },
    };

    addSale(saleRecord);

    Alert.alert(
      'Sale Recorded',
      `${sale.totalEggs} eggs sold for ₱${sale.totalAmount.toFixed(2)}.`
    );

    // Clear fields
    setQuantities(emptyValues);
    setPrices(emptyValues);
  };

  const preview = calculateSale();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Egg Sales</Text>

      <Text style={styles.subtitle}>
        Record egg sales and automatically update inventory.
      </Text>

      {/* MODE TOGGLE */}
      <View style={styles.modeContainer}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            inputMode === 'eggs' && styles.activeModeButton,
          ]}
          onPress={() => setInputMode('eggs')}
        >
          <Text
            style={[
              styles.modeText,
              inputMode === 'eggs' && styles.activeModeText,
            ]}
          >
            Eggs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            inputMode === 'trays' && styles.activeModeButton,
          ]}
          onPress={() => setInputMode('trays')}
        >
          <Text
            style={[
              styles.modeText,
              inputMode === 'trays' && styles.activeModeText,
            ]}
          >
            Trays
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.modeDescription}>
        {inputMode === 'eggs'
          ? 'Enter the number of eggs and price per egg.'
          : 'Enter the number of trays and price per tray.'}
      </Text>

      {/* EGG SIZE INPUTS */}
      {EGG_SIZES.map(size => {
        const key = size.key;
        const quantity = getNumber(quantities[key]);
        const price = getNumber(prices[key]);

        const amount = quantity * price;

        return (
          <View style={styles.sizeCard} key={key}>
            <Text style={styles.sizeTitle}>
              {size.label}
            </Text>

            <Text style={styles.available}>
              Available: {inventory[key]} eggs
            </Text>

            <Text style={styles.inputLabel}>
              {inputMode === 'trays'
                ? 'Number of Trays'
                : 'Number of Eggs'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              value={quantities[key]}
              onChangeText={value =>
                updateValue(
                  key,
                  value.replace(/[^0-9]/g, '')
                )
              }
            />

            <Text style={styles.inputLabel}>
              {inputMode === 'trays'
                ? 'Price per Tray (₱)'
                : 'Price per Egg (₱)'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={prices[key]}
              onChangeText={value =>
                updatePrice(
                  key,
                  value.replace(/[^0-9.]/g, '')
                )
              }
            />

            {inputMode === 'trays' && quantity > 0 && (
              <Text style={styles.conversionText}>
                {quantity} tray(s) = {quantity * 30} eggs
              </Text>
            )}

            <Text style={styles.amountText}>
              Amount: ₱{amount.toFixed(2)}
            </Text>
          </View>
        );
      })}

      {/* SALE SUMMARY */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>
          Sale Summary
        </Text>

        <Text style={styles.summaryText}>
          Total Eggs: {preview.totalEggs}
        </Text>

        {inputMode === 'trays' && (
          <Text style={styles.summaryText}>
            Total Trays: {Object.values(quantities).reduce(
              (total, value) => total + getNumber(value),
              0
            )}
          </Text>
        )}

        <Text style={styles.totalAmount}>
          Total Amount: ₱{preview.totalAmount.toFixed(2)}
        </Text>
      </View>

      {/* SAVE SALE */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveSale}
      >
        <Text style={styles.saveButtonText}>
          Save Sale
        </Text>
      </TouchableOpacity>

      {/* SALE HISTORY */}
      <Text style={styles.historyTitle}>
        Sale History
      </Text>

      {sales.length === 0 ? (
        <Text style={styles.emptyText}>
          No sales recorded yet.
        </Text>
      ) : (
        sales.map(sale => (
          <View
            style={styles.historyCard}
            key={sale.id}
          >
            <Text style={styles.historyDate}>
              {sale.date}
            </Text>

            <Text style={styles.historyText}>
              Eggs Sold: {sale.totalEggs}
            </Text>

            <Text style={styles.historyText}>
              Revenue: ₱
              {Number(sale.totalAmount).toFixed(2)}
            </Text>

            <Text style={styles.historyText}>
              Method:{' '}
              {sale.inputMode === 'trays'
                ? 'Trays'
                : 'Eggs'}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  subtitle: {
    color: '#6B7280',
    marginBottom: 15,
  },

  modeContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    padding: 4,
    marginBottom: 8,
  },

  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  activeModeButton: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },

  modeText: {
    fontWeight: 'bold',
    color: '#6B7280',
  },

  activeModeText: {
    color: '#111827',
  },

  modeDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 15,
  },

  sizeCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  sizeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  available: {
    color: '#6B7280',
    marginBottom: 12,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#374151',
  },

  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 11,
    marginBottom: 10,
    fontSize: 16,
  },

  conversionText: {
    color: '#6B7280',
    marginTop: 2,
  },

  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    marginTop: 5,
    marginBottom: 15,
    elevation: 2,
  },

  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  summaryText: {
    fontSize: 16,
    marginBottom: 5,
  },

  totalAmount: {
    fontSize: 21,
    fontWeight: 'bold',
    marginTop: 8,
  },

  saveButton: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 25,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  historyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  emptyText: {
    color: '#6B7280',
    marginBottom: 20,
  },

  historyCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },

  historyDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  historyText: {
    color: '#4B5563',
    marginTop: 2,
  },
});