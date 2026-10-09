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
import { useTheme, useThemedStyles } from '../ThemeContext';

const EGGS_PER_TRAY = 30;
const INITIAL_HISTORY_COUNT = 3;

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

export default function ProductionScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);
  const [inputMode, setInputMode] = useState('eggs');
  const [isSaving, setIsSaving] = useState(false);
  const [showAllProductions, setShowAllProductions] = useState(false);
  const [productionDateFilter, setProductionDateFilter] = useState('');
  const [productionSizeFilter, setProductionSizeFilter] = useState('');

  const [pullet, setPullet] = useState('');
  const [small, setSmall] = useState('');
  const [medium, setMedium] = useState('');
  const [large, setLarge] = useState('');
  const [xlarge, setXlarge] = useState('');
  const [jumbo, setJumbo] = useState('');

  const { addProduction, productions, isOnline } = useContext(EggContext);

  const getEggs = value => (Number(value) || 0) * (inputMode === 'trays' ? EGGS_PER_TRAY : 1);
  const productionSizes = [
    ['pullet', 'Pullet'], ['small', 'Small'], ['medium', 'Medium'],
    ['large', 'Large'], ['xlarge', 'X-Large'], ['jumbo', 'Jumbo'],
  ];
  const filteredProductions = productions.filter(record => {
    const recordDate = String(record.date || '');
    const matchesDate = !productionDateFilter.trim() ||
      recordDate.toLowerCase().includes(productionDateFilter.trim().toLowerCase()) ||
      formatHistoryDate(recordDate).toLowerCase().includes(productionDateFilter.trim().toLowerCase());
    const matchesSize = !productionSizeFilter || Number(record[productionSizeFilter] || 0) > 0;
    return matchesDate && matchesSize;
  });


  const pulletEggs = getEggs(pullet);
  const smallEggs = getEggs(small);
  const mediumEggs = getEggs(medium);
  const largeEggs = getEggs(large);
  const xlargeEggs = getEggs(xlarge);
  const jumboEggs = getEggs(jumbo);

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

  const handleSave = async () => {
    if (isSaving) return;
    const eggValues = [
      pullet,
      small,
      medium,
      large,
      xlarge,
      jumbo,
    ];

    const hasInvalidValue = eggValues.some(value => {
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

    if (totalEggs === 0) {
      Alert.alert(
        'No Eggs Entered',
        'Please enter at least one egg.'
      );

      return;
    }

    setIsSaving(true);
    const saved = await addProduction({
      pullet: pulletEggs,
      small: smallEggs,
      medium: mediumEggs,
      large: largeEggs,
      xlarge: xlargeEggs,
      jumbo: jumboEggs,
    });

    if (!saved) {
      setIsSaving(false);
      Alert.alert(
        'Production Not Saved',
        'The app could not confirm the production save. Check your connection and production history before trying again.'
      );
      return;
    }

    setPullet('');
    setSmall('');
    setMedium('');
    setLarge('');
    setXlarge('');
    setJumbo('');

    Alert.alert(
      'Production Saved',
      isOnline === false
        ? `${totalEggs} eggs have been saved on this device. They will sync with the business account when you are back online.`
        : `${totalEggs} eggs have been added to inventory.`
    );
    setIsSaving(false);
  };

  const renderEggInput = (
    name,
    value,
    setValue
  ) => {
    const total = getEggs(value);

    return (
      <View style={styles.sizeCard}>
        <Text style={styles.sizeTitle}>{name}</Text>

        <Text style={styles.inputLabel}>{inputMode === 'trays' ? 'Number of Trays' : 'Number of Eggs'}</Text>

        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholderTextColor={colors.muted}
          selectionColor={colors.primary}
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
                Trays
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modeDescription}>
            {inputMode === 'eggs'
              ? 'Enter the exact number of eggs collected.'
              : 'Enter the number of trays collected. One tray contains 30 eggs.'}
          </Text>
        </View>

        <View style={styles.inputGrid}>
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
        </View>

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
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving…' : 'Save Production'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.historyTitle}>
          Production History
        </Text>

        <View style={styles.filterCard}>
          <Text style={styles.filterLabel}>Filter by date</Text>
          <TextInput
            accessibilityLabel="Filter production history by date"
            style={styles.filterInput}
            value={productionDateFilter}
            onChangeText={setProductionDateFilter}
            placeholder="YYYY-MM-DD or date"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
          />
          <Text style={styles.filterLabel}>Filter by egg size</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[styles.filterChip, !productionSizeFilter && styles.activeFilterChip]}
              onPress={() => setProductionSizeFilter('')}
              accessibilityRole="button"
              accessibilityState={{ selected: !productionSizeFilter }}
            ><Text style={[styles.filterChipText, !productionSizeFilter && styles.activeFilterChipText]}>All sizes</Text></TouchableOpacity>
            {productionSizes.map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[styles.filterChip, productionSizeFilter === key && styles.activeFilterChip]}
                onPress={() => setProductionSizeFilter(current => current === key ? '' : key)}
                accessibilityRole="button"
                accessibilityState={{ selected: productionSizeFilter === key }}
              ><Text style={[styles.filterChipText, productionSizeFilter === key && styles.activeFilterChipText]}>{label}</Text></TouchableOpacity>
            ))}
          </View>
          {(productionDateFilter || productionSizeFilter) ? (
            <TouchableOpacity onPress={() => { setProductionDateFilter(''); setProductionSizeFilter(''); }}>
              <Text style={styles.clearFilterText}>Clear filters</Text>
            </TouchableOpacity>
          ) : null}
          <Text style={styles.filterResultText}>{filteredProductions.length} of {productions.length} records</Text>
        </View>

        {filteredProductions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>{productions.length === 0 ? 'No production recorded yet.' : 'No production records match these filters.'}</Text>
          </View>
        ) : (
          <View style={styles.historyGrid}>
          {filteredProductions.slice(0, showAllProductions ? filteredProductions.length : INITIAL_HISTORY_COUNT).map((record, index) => (
            <View
              key={record.firebaseId || `production-${record.id}-${index}`}
              style={styles.historyCard}
            >
              <Text style={styles.historyEggs}>
                {Number(record.totalEggs || 0)} eggs
              </Text>

              <Text style={styles.historyDetails}>
                {Math.floor(Number(record.totalEggs || 0) / 30)} trays +{' '}
                {Number(record.totalEggs || 0) % 30} loose eggs
              </Text>

              <Text style={[styles.sizeDetails, { color: colors.secondaryText }]}>
                {[
                  ['Pullet', record.pullet], ['Small', record.small], ['Medium', record.medium],
                  ['Large', record.large], ['X-Large', record.xlarge], ['Jumbo', record.jumbo],
                ].filter(([, quantity]) => Number(quantity) > 0).map(([name, quantity]) => `${name} ${quantity}`).join(' · ') || 'No size details'}
              </Text>

              <Text style={styles.historyDate}>
                {formatHistoryDate(record.date)}
              </Text>
            </View>
          ))}
          </View>
        )}
        {filteredProductions.length > INITIAL_HISTORY_COUNT && (
          <TouchableOpacity style={styles.historyToggle} onPress={() => setShowAllProductions(value => !value)}>
            <Text style={styles.historyToggleText}>{showAllProductions ? 'View Less' : 'View All'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  content: {
    padding: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  description: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 15,
  },

  modeCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  modeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },

  modeButton: {
    flex: 1,
    padding: 10,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },

  activeModeButtonText: {
    color: '#FFFFFF',
  },

  modeDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },

  inputGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  sizeCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 2,
  },

  sizeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  inputRow: {
    flexDirection: 'row',
    gap: 6,
  },

  inputContainer: {
    flex: 1,
  },

  inputLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },

  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 8,
    fontSize: 15,
  },

  calculatedText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 6,
  },

  resultCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 2,
  },

  resultTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  resultText: {
    fontSize: 12,
    marginVertical: 1,
  },

  saveButton: {
    backgroundColor: '#111827',
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderRadius: 10,
    marginTop: 10,
  },

  saveButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
  },

  historyTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 22,
    marginBottom: 8,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 22,
  },

  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
  },

  historyGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  historyCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 2,
  },

  historyDate: { fontSize: 9, color: '#9CA3AF', marginTop: 7 },
  historyEggs: { fontSize: 16, fontWeight: 'bold', marginTop: 3 },
  historyDetails: { fontSize: 11, color: '#6B7280', marginTop: 3 },
  sizeDetails: { fontSize: 10, lineHeight: 14, marginTop: 4 },
  historyToggle: { alignSelf: 'center', paddingHorizontal: 18, paddingVertical: 10, marginBottom: 18 },
  historyToggleText: { color: '#2D6A4F', fontSize: 14, fontWeight: '700' },
  filterCard: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12, marginBottom: 12, elevation: 1 },
  filterLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 7 },
  filterInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, color: '#111827' },
  filterOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  filterChip: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 16, paddingHorizontal: 11, paddingVertical: 7, backgroundColor: '#FFFFFF' },
  activeFilterChip: { backgroundColor: '#E7F2EA', borderColor: '#2D6A4F' },
  filterChipText: { color: '#4B5563', fontSize: 12, fontWeight: '600' },
  activeFilterChipText: { color: '#2D6A4F' },
  clearFilterText: { color: '#2D6A4F', fontWeight: '700', marginTop: 12 },
  filterResultText: { color: '#6B7280', fontSize: 12, marginTop: 10 },
});
