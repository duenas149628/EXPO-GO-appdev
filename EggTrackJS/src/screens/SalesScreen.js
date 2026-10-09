import React, {
  useEffect,
  useContext,
  useState,
} from 'react';

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
import { useTheme, useThemedStyles } from '../ThemeContext';

const EGG_SIZES = [
  {
    key: 'pullet',
    label: 'Pullet',
  },
  {
    key: 'small',
    label: 'Small',
  },
  {
    key: 'medium',
    label: 'Medium',
  },
  {
    key: 'large',
    label: 'Large',
  },
  {
    key: 'xlarge',
    label: 'X-Large',
  },
  {
    key: 'jumbo',
    label: 'Jumbo',
  },
];

const emptyValues = {
  pullet: '',
  small: '',
  medium: '',
  large: '',
  xlarge: '',
  jumbo: '',
};

const INITIAL_HISTORY_COUNT = 3;
const priceGroupToInputs = group => Object.fromEntries(
  EGG_SIZES.map(({ key }) => [key, Number(group[key]).toFixed(2)])
);

const formatHistoryDate = value => {
  if (!value) return 'Date unavailable';
  if (typeof value === 'string') {
    const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) return `${dateOnlyMatch[2]}-${dateOnlyMatch[3]}-${dateOnlyMatch[1]}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || 'Date unavailable';
  return [date.getMonth() + 1, date.getDate(), date.getFullYear()]
    .map(part => String(part).padStart(2, '0'))
    .join('-');
};

export default function SalesScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);
  const {
    inventory,
    sales,
    addSale,
    isOnline,
    salePrices,
  } = useContext(EggContext);

  const [inputMode, setInputMode] =
    useState('eggs');

  const [eggQuantities, setEggQuantities] =
    useState(emptyValues);

  const [trayQuantities, setTrayQuantities] =
    useState(emptyValues);

  const quantities = inputMode === 'trays' ? trayQuantities : eggQuantities;

  const [eggPrices, setEggPrices] =
    useState(() => priceGroupToInputs(salePrices.perEgg));

  const [trayPrices, setTrayPrices] =
    useState(() => priceGroupToInputs(salePrices.perTray));
  const prices = inputMode === 'trays' ? trayPrices : eggPrices;
  const [isSaving, setIsSaving] = useState(false);
  const [showAllSales, setShowAllSales] = useState(false);
  const defaultPrices = inputMode === 'trays' ? salePrices.perTray : salePrices.perEgg;

  useEffect(() => {
    setEggPrices(priceGroupToInputs(salePrices.perEgg));
    setTrayPrices(priceGroupToInputs(salePrices.perTray));
  }, [salePrices]);

  const getPriceForSize = key => prices[key] === ''
    ? Number(defaultPrices[key])
    : getNumber(prices[key]);


  // =====================================================
  // UPDATE QUANTITY
  // =====================================================

  const updateValue = (
    key,
    value
  ) => {

    const setActiveQuantities = inputMode === 'trays' ? setTrayQuantities : setEggQuantities;
    setActiveQuantities(previous => ({ ...previous, [key]: value }));
  };


  // =====================================================
  // UPDATE PRICE
  // =====================================================

  const updatePrice = (
    key,
    value
  ) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const [whole, ...decimalParts] = cleaned.split('.');
    const normalized = decimalParts.length
      ? `${whole}.${decimalParts.join('')}`
      : whole;

    const setActivePrices = inputMode === 'trays' ? setTrayPrices : setEggPrices;
    setActivePrices(previous => ({ ...previous, [key]: normalized }));
  };


  // =====================================================
  // GET NUMBER
  // =====================================================

  const getNumber = value => {

    if (
      value === ''
    ) {
      return 0;
    }

    return Number(value);
  };


  // =====================================================
  // CALCULATE SALE
  // =====================================================

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


    EGG_SIZES.forEach(
      size => {

        const key =
          size.key;

        const quantity =
          getNumber(
            quantities[key]
          );

        const price = getPriceForSize(key);


        let eggs;


        if (
          inputMode === 'trays'
        ) {

          eggs =
            quantity * 30;

        } else {

          eggs =
            quantity;
        }


        result[key] =
          eggs;

        result.totalEggs +=
          eggs;

        result.totalAmount +=
          quantity * price;
      }
    );


    return result;
  };


  // =====================================================
  // VALIDATE WHOLE NUMBER
  // =====================================================

  const validateWholeNumber = (
    value,
    fieldName
  ) => {

    if (
      value === ''
    ) {
      return true;
    }


    const number =
      Number(value);


    if (
      !Number.isInteger(number) ||
      number < 0
    ) {

      Alert.alert(
        'Invalid Input',
        `${fieldName} must be a whole number greater than or equal to 0.`
      );

      return false;
    }


    return true;
  };


  // =====================================================
  // VALIDATE PRICE
  // =====================================================

  const validatePrice = (
    value,
    fieldName
  ) => {

    if (
      value === ''
    ) {
      return true;
    }


    const number =
      Number(value);


    if (
      !Number.isFinite(number) ||
      number < 0
    ) {

      Alert.alert(
        'Invalid Price',
        `${fieldName} must be a valid price greater than or equal to 0.`
      );

      return false;
    }


    return true;
  };


  // =====================================================
  // SAVE SALE
  // =====================================================

  const handleSaveSale = async () => {
    if (isSaving) return;

    let hasQuantity =
      false;


    // ---------------------------------------------------
    // Validate quantities
    // ---------------------------------------------------

    for (
      const size of EGG_SIZES
    ) {

      const key =
        size.key;

      const quantity =
        quantities[key];


      const fieldName =
        inputMode === 'trays'
          ? `${size.label} trays`
          : `${size.label} eggs`;


      if (
        !validateWholeNumber(
          quantity,
          fieldName
        )
      ) {
        return;
      }


      if (
        getNumber(quantity) > 0
      ) {

        hasQuantity =
          true;
      }
    }


    if (
      !hasQuantity
    ) {

      Alert.alert(
        'No Quantity Entered',
        `Please enter at least one ${
          inputMode === 'trays'
            ? 'tray'
            : 'egg'
        }.`
      );

      return;
    }


    // ---------------------------------------------------
    // Validate prices
    // ---------------------------------------------------

    for (
      const size of EGG_SIZES
    ) {

      const key =
        size.key;

      const quantity =
        getNumber(
          quantities[key]
        );

      const price = getPriceForSize(key);


      if (
        quantity > 0
      ) {

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


    // ---------------------------------------------------
    // Calculate sale
    // ---------------------------------------------------

    const sale =
      calculateSale();


    // ---------------------------------------------------
    // Check inventory
    // ---------------------------------------------------

    for (
      const size of EGG_SIZES
    ) {

      const key =
        size.key;


      if (
        sale[key] >
        inventory[key]
      ) {

        Alert.alert(
          'Insufficient Inventory',

          `You are trying to sell ${sale[key]} ${size.label} eggs, but only ${inventory[key]} are available.`
        );

        return;
      }
    }


    // ---------------------------------------------------
    // Create sale record
    // ---------------------------------------------------

    const saleRecord = {

      id:
        Date.now(),

      date: (() => {
        const now = new Date();
        return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
      })(),


      pullet:
        sale.pullet,

      small:
        sale.small,

      medium:
        sale.medium,

      large:
        sale.large,

      xlarge:
        sale.xlarge,

      jumbo:
        sale.jumbo,


      totalEggs:
        sale.totalEggs,

      totalAmount:
        sale.totalAmount,


      inputMode,

      unit: inputMode === 'trays' ? 'Trays' : 'Eggs',
      eggSize: EGG_SIZES.filter(size => sale[size.key] > 0).map(size => size.label).join(', '),
      quantity: Object.values(quantities).reduce((sum, value) => sum + getNumber(value), 0),
      equivalentEggQuantity: sale.totalEggs,
      eggSizes: EGG_SIZES.filter(size => sale[size.key] > 0).map(size => ({
        key: size.key,
        label: size.label,
        quantity: getNumber(quantities[size.key]),
        unit: inputMode === 'trays' ? 'Trays' : 'Eggs',
        equivalentEggQuantity: sale[size.key],
        price: getPriceForSize(size.key),
        total: getNumber(quantities[size.key]) * getPriceForSize(size.key),
      })),


      quantities: {

        pullet:
          getNumber(
            quantities.pullet
          ),

        small:
          getNumber(
            quantities.small
          ),

        medium:
          getNumber(
            quantities.medium
          ),

        large:
          getNumber(
            quantities.large
          ),

        xlarge:
          getNumber(
            quantities.xlarge
          ),

        jumbo:
          getNumber(
            quantities.jumbo
          ),
      },


      prices: {

        pullet:
          getPriceForSize('pullet'),

        small:
          getPriceForSize('small'),

        medium:
          getPriceForSize('medium'),

        large:
          getPriceForSize('large'),

        xlarge:
          getPriceForSize('xlarge'),

        jumbo:
          getPriceForSize('jumbo'),
      },
    };


    // ---------------------------------------------------
    // Save to Firebase
    // ---------------------------------------------------

    setIsSaving(true);
    const saveResult = await addSale(saleRecord);

    if (!saveResult || saveResult.ok !== true) {
      setIsSaving(false);
      const errorCode = saveResult?.code || 'unknown';
      Alert.alert(
        'Sale Not Saved',
        `The app could not confirm the sale (${errorCode}).${saveResult?.message ? `\n${saveResult.message}` : ''}\nCheck the available inventory and sale history before trying again.`
      );
      return;
    }


    const formattedAmount = Number(sale.totalAmount || 0).toFixed(2);
    if (saveResult.queued && isOnline === false) {
      Alert.alert(
        'Sale Saved Offline',
        `${sale.totalEggs} eggs. Total: PHP ${formattedAmount}. It will sync with the business account when you are back online.`
      );
    } else if (saveResult.syncError) {
      Alert.alert(
        'Sale Sync Needs Attention',
        `${sale.totalEggs} eggs were saved on this device. Sync failed (${saveResult.syncError}).`
      );
    } else {
      Alert.alert(
        'Sale Recorded',
        `${sale.totalEggs} eggs sold. Total: PHP ${formattedAmount}.`
      );
    }


    // ---------------------------------------------------
    // Clear fields
    // ---------------------------------------------------

    setEggQuantities(emptyValues);
    setTrayQuantities(emptyValues);

    setEggPrices(priceGroupToInputs(salePrices.perEgg));
    setTrayPrices(priceGroupToInputs(salePrices.perTray));
    setIsSaving(false);
  };


  // =====================================================
  // PREVIEW
  // =====================================================

  const preview =
    calculateSale();

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
    >

      <Text style={styles.title}>
        Egg Sales
      </Text>


      <Text style={styles.subtitle}>
        Record egg sales and automatically
        update inventory.
      </Text>


      <Text style={styles.unitSectionTitle}>Recording Method</Text>
      <View style={styles.unitToggleRow}>
        {['eggs', 'trays'].map(unit => {
          const selected = inputMode === unit;
          return (
            <TouchableOpacity
              key={unit}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={[styles.unitButton, selected && styles.activeUnitButton]}
              onPress={() => setInputMode(unit)}
            >
              <Text style={[styles.unitButtonText, selected && styles.activeUnitButtonText]}>
                {unit === 'eggs' ? 'Eggs' : 'Trays'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>


      <Text
        style={
          styles.modeDescription
        }
      >
        {inputMode === 'eggs'
          ? 'Enter the number of eggs and price per egg.'
          : 'Enter the number of trays and price per tray.'}
      </Text>


      {/* EGG SIZE INPUTS */}

      <Text style={styles.inputLabel}>Egg Sizes</Text>
      <View style={styles.sizeGrid}>
        {EGG_SIZES.map(size => {
          const quantity = getNumber(quantities[size.key]);
          const amount = quantity * getPriceForSize(size.key);
          return (
            <View key={size.key} style={styles.sizeCard}>
              <Text style={styles.sizeTitle}>{size.label}</Text>
              <Text style={styles.available}>{inventory[size.key]} eggs available</Text>
              <Text style={styles.inputLabel}>{inputMode === 'trays' ? 'Trays' : 'Eggs'}</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={quantities[size.key]}
                onChangeText={value => updateValue(size.key, value.replace(/[^0-9]/g, ''))}
                placeholder="0"
                placeholderTextColor={colors.muted}
                selectionColor={colors.primary}
                keyboardType="numeric"
              />
              <Text style={styles.inputLabel}>{inputMode === 'trays' ? 'Price / tray (PHP)' : 'Price / egg (PHP)'}</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={prices[size.key]}
                onChangeText={value => updatePrice(size.key, value.replace(/[^0-9.]/g, ''))}
                placeholder="0.00"
                placeholderTextColor={colors.muted}
                selectionColor={colors.primary}
                keyboardType="decimal-pad"
              />
              {inputMode === 'trays' && quantity > 0 && (
                <Text style={styles.conversionText}>{quantity} {quantity === 1 ? 'tray' : 'trays'} = {quantity * 30} eggs</Text>
              )}
              <Text style={styles.amountText}>Amount: PHP {amount.toFixed(2)}</Text>
            </View>
          );
        })}
      </View>
      {/* SALE SUMMARY */}

      <View
        style={
          styles.summaryCard
        }
      >

        <Text
          style={
            styles.summaryTitle
          }
        >
          Sale Summary
        </Text>


        <Text
          style={
            styles.summaryText
          }
        >
          Total Eggs:{' '}
          {preview.totalEggs}
        </Text>


        {inputMode ===
          'trays' && (

          <Text
            style={
              styles.summaryText
            }
          >
            Total Trays:{' '}

            {Object.values(
              quantities
            ).reduce(
              (
                total,
                value
              ) =>
                total +
                getNumber(
                  value
                ),

              0
            )}

          </Text>

        )}


        <Text
          style={
            styles.totalAmount
          }
        >
          Total Amount: ₱
          {preview.totalAmount.toFixed(
            2
          )}
        </Text>

      </View>


      {/* SAVE SALE */}

      <TouchableOpacity
        style={
          styles.saveButton
        }

        onPress={
          handleSaveSale
        }
        disabled={isSaving}
      >

        <Text
          style={
            styles.saveButtonText
          }
        >
          {isSaving ? 'Saving…' : 'Save Sale'}
        </Text>

      </TouchableOpacity>


      {/* SALE HISTORY */}

      <Text
        style={
          styles.historyTitle
        }
      >
        Sale History
      </Text>


      {sales.length === 0 ? (

        <Text
          style={
            styles.emptyText
          }
        >
          No sales recorded yet.
        </Text>

      ) : (
        <View style={styles.historyGrid}>
        {sales.slice(0, showAllSales ? sales.length : INITIAL_HISTORY_COUNT).map(
          (
            sale,
            index
          ) => (

            <View
              style={
                styles.historyCard
              }

              /*
               * Firestore document ID is unique.
               *
               * The index fallback is only for
               * old locally cached records that
               * do not have firebaseId yet.
               */
              key={
                sale.firebaseId ||
                `local-${sale.id}-${index}`
              }
            >

              {sale.pendingSync && (
                <Text style={styles.pendingSyncText}>
                  {sale.pendingSyncError
                    ? `Sync needs attention (${sale.pendingSyncError})`
                    : 'Saved on this device · waiting to sync'}
                </Text>
              )}


              <View style={styles.historyEggSizesCard}>
                <Text style={styles.historyEggSizesLabel}>Egg sizes sold</Text>
                <Text style={styles.historyEggSizes}>
                  {sale.eggSizes?.map(size => size.label || size.key).join(', ')
                  || EGG_SIZES.filter(size => Number(sale[size.key] || 0) > 0).map(size => size.label).join(', ')
                  || 'Not recorded'}
                </Text>
              </View>

              <Text style={styles.historySaleQuantity}>
                Sold: {sale.quantity ?? Object.values(sale.quantities || {}).reduce((sum, value) => sum + Number(value || 0), 0)}{' '}
                {sale.unit || (sale.inputMode === 'trays' ? 'Trays' : 'Eggs')}
              </Text>

              <Text style={styles.historyText}>
                Equivalent: {sale.equivalentEggQuantity ?? sale.totalEggs ?? 0} eggs
              </Text>


              <Text
                style={
                  styles.historyText
                }
              >
                Revenue: ₱
                {Number(
                  sale.totalAmount
                ).toFixed(2)}
              </Text>

              <Text style={styles.historyDate}>
                {formatHistoryDate(sale.date)}
              </Text>

            </View>

          )
        )}
        </View>

      )}
      {sales.length > INITIAL_HISTORY_COUNT && (
        <TouchableOpacity style={styles.historyToggle} onPress={() => setShowAllSales(value => !value)}>
          <Text style={styles.historyToggleText}>{showAllSales ? 'View Less' : 'View More'}</Text>
        </TouchableOpacity>
      )}

    </ScrollView>
  );
}


// =======================================================
// STYLES
// =======================================================

const baseStyles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  content: {
    padding: 14,
    paddingBottom: 30,
  },

  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  subtitle: {
    color: '#6B7280',
    marginBottom: 12,
  },

  modeDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },

  sizeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  sizeCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 2,
  },

  sizeTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  available: {
    color: '#6B7280',
    fontSize: 10,
    marginBottom: 7,
  },

  inputLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#374151',
  },

  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 7,
    marginBottom: 6,
    fontSize: 14,
  },

  conversionText: {
    color: '#6B7280',
    marginTop: 2,
  },

  amountText: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 5,
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginTop: 5,
    marginBottom: 12,
    elevation: 2,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  summaryText: {
    fontSize: 14,
    marginBottom: 4,
  },

  totalAmount: {
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 8,
  },

  saveButton: {
    backgroundColor: '#111827',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  emptyText: {
    color: '#6B7280',
    marginBottom: 20,
  },

  historyGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  historyCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 1,
  },

  unitToggleRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  unitSectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  unitButton: { flex: 1, alignItems: 'center', padding: 10, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, backgroundColor: '#F9FAFB' },
  activeUnitButton: { backgroundColor: '#111827', borderColor: '#111827' },
  unitButtonText: { color: '#374151', fontSize: 14, fontWeight: '700' },
  activeUnitButtonText: { color: '#FFFFFF' },

  historyDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 7,
  },

  historyText: {
    color: '#4B5563',
    fontSize: 11,
    marginTop: 2,
  },

  historyEggSizesCard: { paddingVertical: 2, marginTop: 2, marginBottom: 4 },
  historyEggSizesLabel: { color: '#2D6A4F', fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
  historyEggSizes: { color: '#111827', fontSize: 12, fontWeight: '700', marginTop: 2 },
  historySaleQuantity: { color: '#111827', fontSize: 14, fontWeight: '800', marginTop: 3, marginBottom: 3 },

  pendingSyncText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyToggle: { alignSelf: 'center', paddingHorizontal: 18, paddingVertical: 10, marginBottom: 18 },
  historyToggleText: { color: '#2D6A4F', fontSize: 14, fontWeight: '700' },
});
