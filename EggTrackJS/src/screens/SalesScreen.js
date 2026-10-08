import React, {
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

const EGG_UNITS = ['Eggs', 'Trays'];
const UNSPECIFIED_COLOR_BRAND = 'Unspecified';

export default function SalesScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);
  const {
    inventory,
    sales,
    addSale,
    isOnline,
  } = useContext(EggContext);

  const [inputMode, setInputMode] =
    useState('eggs');

  const [selectedSizeKey, setSelectedSizeKey] =
    useState(EGG_SIZES[0].key);

  const [isSizeDropdownOpen, setIsSizeDropdownOpen] =
    useState(false);

  const [eggQuantities, setEggQuantities] =
    useState(emptyValues);

  const [trayQuantities, setTrayQuantities] =
    useState(emptyValues);

  const [colorBrand, setColorBrand] = useState(UNSPECIFIED_COLOR_BRAND);
  const [isColorBrandDropdownOpen, setIsColorBrandDropdownOpen] = useState(false);
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const quantities = inputMode === 'trays' ? trayQuantities : eggQuantities;
  const colorBrandOptions = [...new Set([
    UNSPECIFIED_COLOR_BRAND,
    ...sales.flatMap(record => [record.colorBrand, record.color, record.brand]
      .filter(value => typeof value === 'string' && value.trim())
      .map(value => value.trim())),
  ])];

  const [eggPrices, setEggPrices] =
    useState(emptyValues);

  const [trayPrices, setTrayPrices] =
    useState(emptyValues);
  const prices = inputMode === 'trays' ? trayPrices : eggPrices;
  const [isSaving, setIsSaving] = useState(false);


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

        const price =
          getNumber(
            prices[key]
          );


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

      const price =
        prices[key];


      if (
        quantity > 0
      ) {

        if (
          price === ''
        ) {

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
      colorBrand,
      eggSize: EGG_SIZES.filter(size => sale[size.key] > 0).map(size => size.label).join(', '),
      quantity: Object.values(quantities).reduce((sum, value) => sum + getNumber(value), 0),
      equivalentEggQuantity: sale.totalEggs,
      eggSizes: EGG_SIZES.filter(size => sale[size.key] > 0).map(size => ({
        key: size.key,
        label: size.label,
        quantity: getNumber(quantities[size.key]),
        unit: inputMode === 'trays' ? 'Trays' : 'Eggs',
        equivalentEggQuantity: sale[size.key],
        price: getNumber(prices[size.key]),
        total: getNumber(quantities[size.key]) * getNumber(prices[size.key]),
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
          getNumber(
            prices.pullet
          ),

        small:
          getNumber(
            prices.small
          ),

        medium:
          getNumber(
            prices.medium
          ),

        large:
          getNumber(
            prices.large
          ),

        xlarge:
          getNumber(
            prices.xlarge
          ),

        jumbo:
          getNumber(
            prices.jumbo
          ),
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

    setEggPrices(emptyValues);
    setTrayPrices(emptyValues);
    setColorBrand(UNSPECIFIED_COLOR_BRAND);
    setIsSaving(false);
  };


  // =====================================================
  // PREVIEW
  // =====================================================

  const preview =
    calculateSale();

  const selectedSize = EGG_SIZES.find(
    size => size.key === selectedSizeKey
  ) || EGG_SIZES[0];
  const selectedSizeKeyValue = selectedSize.key;
  const selectedQuantity = getNumber(quantities[selectedSizeKeyValue]);
  const selectedPrice = getNumber(prices[selectedSizeKeyValue]);
  const selectedAmount = selectedQuantity * selectedPrice;


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


      <Text style={styles.inputLabel}>Unit</Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ expanded: isUnitDropdownOpen }}
        style={styles.sizeDropdownButton}
        onPress={() => setIsUnitDropdownOpen(open => !open)}
      >
        <Text style={styles.sizeDropdownText}>{inputMode === 'trays' ? 'Trays' : 'Eggs'}</Text>
        <Text style={styles.dropdownChevron}>{isUnitDropdownOpen ? '^' : 'v'}</Text>
      </TouchableOpacity>
      {isUnitDropdownOpen && (
        <View style={styles.sizeDropdownMenu}>
          {EGG_UNITS.map(unit => {
            const unitMode = unit.toLowerCase();
            const selected = inputMode === unitMode;
            return (
              <TouchableOpacity
                key={unit}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[styles.sizeDropdownOption, selected && styles.selectedSizeDropdownOption]}
                onPress={() => {
                  setInputMode(unitMode);
                  setIsUnitDropdownOpen(false);
                }}
              >
                <Text style={[styles.sizeDropdownOptionText, selected && styles.selectedSizeDropdownOptionText]}>{unit}</Text>
                <Text style={styles.sizeDropdownAvailability}>{unit === 'Trays' ? '1 tray = 30 eggs' : 'Individual eggs'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}


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

      <Text style={styles.inputLabel}>Color / Brand</Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ expanded: isColorBrandDropdownOpen }}
        style={styles.sizeDropdownButton}
        onPress={() => setIsColorBrandDropdownOpen(open => !open)}
      >
        <Text style={styles.sizeDropdownText}>{colorBrand}</Text>
        <Text style={styles.dropdownChevron}>{isColorBrandDropdownOpen ? '^' : 'v'}</Text>
      </TouchableOpacity>
      {isColorBrandDropdownOpen && (
        <View style={styles.sizeDropdownMenu}>
          {colorBrandOptions.map(option => (
            <TouchableOpacity
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: option === colorBrand }}
              style={[styles.sizeDropdownOption, option === colorBrand && styles.selectedSizeDropdownOption]}
              onPress={() => {
                setColorBrand(option);
                setIsColorBrandDropdownOpen(false);
              }}
            >
              <Text style={[styles.sizeDropdownOptionText, option === colorBrand && styles.selectedSizeDropdownOptionText]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.inputLabel}>Egg Size</Text>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ expanded: isSizeDropdownOpen }}
        style={styles.sizeDropdownButton}
        onPress={() => setIsSizeDropdownOpen(open => !open)}
      >
        <Text style={styles.sizeDropdownText}>{selectedSize.label}</Text>
        <Text style={styles.dropdownChevron}>{isSizeDropdownOpen ? '^' : 'v'}</Text>
      </TouchableOpacity>

      {isSizeDropdownOpen && (
        <View style={styles.sizeDropdownMenu}>
          {EGG_SIZES.map(size => (
            <TouchableOpacity
              key={size.key}
              accessibilityRole="button"
              accessibilityState={{ selected: size.key === selectedSizeKey }}
              style={[
                styles.sizeDropdownOption,
                size.key === selectedSizeKey && styles.selectedSizeDropdownOption,
              ]}
              onPress={() => {
                setSelectedSizeKey(size.key);
                setIsSizeDropdownOpen(false);
              }}
            >
              <Text
                style={[
                  styles.sizeDropdownOptionText,
                  size.key === selectedSizeKey && styles.selectedSizeDropdownOptionText,
                ]}
              >
                {size.label}
              </Text>
              <Text style={styles.sizeDropdownAvailability}>
                {inventory[size.key]} eggs
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.sizeCard}>

              <Text
                style={
                  styles.sizeTitle
                }
              >
                {selectedSize.label}
              </Text>


              <Text
                style={
                  styles.available
                }
              >
                Available:{' '}
                {inventory[selectedSizeKeyValue]} eggs
              </Text>


              <Text
                style={
                  styles.inputLabel
                }
              >
                {inputMode === 'trays'
                  ? 'Number of Trays'
                  : 'Number of Eggs'}
              </Text>


              <TextInput
                style={
                  [styles.input, { color: colors.text }]
                }

                placeholder="0"
                placeholderTextColor={colors.muted}
                selectionColor={colors.primary}

                keyboardType="numeric"

                value={
                  quantities[selectedSizeKeyValue]
                }

                onChangeText={
                  value =>
                    updateValue(
                      selectedSizeKeyValue,
                      value.replace(
                        /[^0-9]/g,
                        ''
                      )
                    )
                }
              />


              <Text
                style={
                  styles.inputLabel
                }
              >
                {inputMode === 'trays'
                  ? 'Price per Tray (₱)'
                  : 'Price per Egg (₱)'}
              </Text>


              <TextInput
                style={
                  [styles.input, { color: colors.text }]
                }

                placeholder="0.00"
                placeholderTextColor={colors.muted}
                selectionColor={colors.primary}

                keyboardType="decimal-pad"

                value={
                  prices[selectedSizeKeyValue]
                }

                onChangeText={
                  value =>
                    updatePrice(
                      selectedSizeKeyValue,
                      value.replace(
                        /[^0-9.]/g,
                        ''
                      )
                    )
                }
              />


              {inputMode ===
                'trays' &&
                selectedQuantity > 0 && (

                  <Text
                    style={
                      styles.conversionText
                    }
                  >
                    {selectedQuantity} tray(s)
                    {' = '}
                    {selectedQuantity * 30}
                    {' eggs'}
                  </Text>

                )}


              <Text
                style={
                  styles.amountText
                }
              >
                Amount: ₱
                {selectedAmount.toFixed(2)}
              </Text>

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

        sales.map(
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

              <Text
                style={
                  styles.historyDate
                }
              >
                {sale.date}
              </Text>

              {sale.pendingSync && (
                <Text style={styles.pendingSyncText}>
                  {sale.pendingSyncError
                    ? `Sync needs attention (${sale.pendingSyncError})`
                    : 'Saved on this device · waiting to sync'}
                </Text>
              )}


              <Text style={styles.historyText}>
                Egg Size: {sale.eggSizes?.map(size => size.label || size.key).join(', ')
                  || EGG_SIZES.filter(size => Number(sale[size.key] || 0) > 0).map(size => size.label).join(', ')
                  || 'Not recorded'}
              </Text>

              <Text style={styles.historyText}>
                Color / Brand: {sale.colorBrand || sale.color || sale.brand || UNSPECIFIED_COLOR_BRAND}
              </Text>


              <Text
                style={
                  styles.historyText
                }
              >
                Quantity: {sale.quantity ?? Object.values(sale.quantities || {}).reduce((sum, value) => sum + Number(value || 0), 0)}{' '}
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


            </View>

          )
        )

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

  modeDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 15,
  },

  sizeDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 10,
  },

  sizeDropdownText: {
    fontSize: 16,
    fontWeight: '600',
  },

  dropdownChevron: {
    color: '#6B7280',
    fontSize: 12,
  },

  sizeDropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },

  sizeDropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  selectedSizeDropdownOption: {
    backgroundColor: '#E7F2EA',
  },

  sizeDropdownOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },

  selectedSizeDropdownOptionText: {
    color: '#2D6A4F',
    fontWeight: '700',
  },

  sizeDropdownAvailability: {
    color: '#6B7280',
    fontSize: 13,
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

  pendingSyncText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
});
