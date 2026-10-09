import React, { useContext, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { EggContext } from '../EggContext';
import { useThemedStyles } from '../ThemeContext';

const RECORD_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'sale', label: 'Sales' },
  { key: 'production', label: 'Production' },
];

const EGG_SIZES = [
  ['pullet', 'Pullet'],
  ['small', 'Small'],
  ['medium', 'Medium'],
  ['large', 'Large'],
  ['xlarge', 'X-Large'],
  ['jumbo', 'Jumbo'],
];

function formatSaleSizeDetails(record) {
  const sizeDetails = Array.isArray(record.eggSizes) && record.eggSizes.length > 0
    ? record.eggSizes.map(size => ({
      key: size.key,
      label: size.label || size.key,
      quantity: Number(size.quantity || 0),
      unit: size.unit || record.unit || (record.inputMode === 'trays' ? 'Trays' : 'Eggs'),
      eggs: Number(size.equivalentEggQuantity ?? record[size.key] ?? 0),
    }))
    : EGG_SIZES
      .filter(([key]) => Number(record[key] || 0) > 0)
      .map(([key, label]) => {
        const eggs = Number(record[key] || 0);
        const unit = record.unit || (record.inputMode === 'trays' ? 'Trays' : 'Eggs');
        return {
          key,
          label,
          quantity: Number(record.quantities?.[key] ?? (unit === 'Trays' ? eggs / 30 : eggs)),
          unit,
          eggs,
        };
      });

  return sizeDetails.map(size => {
    const unit = size.unit.toLowerCase();
    const quantityDetails = unit === 'trays'
      ? `${size.quantity} trays (${size.eggs} eggs)`
      : `${size.eggs} eggs (${Math.floor(size.eggs / 30)} trays + ${size.eggs % 30} loose)`;
    return `${size.label}: ${quantityDetails}`;
  }).join(' · ');
}

export default function LedgerScreen() {
  const styles = useThemedStyles(baseStyles);
  const { sales, productions } = useContext(EggContext);
  const [recordFilter, setRecordFilter] = useState('all');

  const totalRevenue = useMemo(
    () => sales.reduce(
      (total, sale) => total + Number(sale.totalAmount || 0),
      0
    ),
    [sales]
  );

  const totalEggsSold = useMemo(
    () => sales.reduce(
      (total, sale) => total + Number(sale.totalEggs || 0),
      0
    ),
    [sales]
  );
  const records = useMemo(() => [
    ...productions.map((record, index) => ({ ...record, kind: 'production', recordKey: record.firebaseId || `production-${record.id}-${index}` })),
    ...sales.map((record, index) => ({ ...record, kind: 'sale', recordKey: record.firebaseId || `sale-${record.id}-${index}` })),
  ].sort((a, b) => `${b.date || ''}-${b.id || ''}`.localeCompare(`${a.date || ''}-${a.id || ''}`)), [productions, sales]);
  const visibleRecords = useMemo(
    () => records.filter(record => recordFilter === 'all' || record.kind === recordFilter),
    [records, recordFilter]
  );

  const totalTrays = Math.floor(totalEggsSold / 30);
  const looseEggs = totalEggsSold % 30;

  const formatEggsAsTrays = (eggs) => {
    const trays = Math.floor(eggs / 30);
    const loose = eggs % 30;

    if (trays > 0 && loose > 0) {
      return `${trays} tray${trays !== 1 ? 's' : ''} + ${loose} eggs`;
    }

    if (trays > 0) {
      return `${trays} tray${trays !== 1 ? 's' : ''}`;
    }

    return `${loose} eggs`;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Production & Sales Ledger</Text>

      <View style={styles.summaryRow}>
        <View style={styles.card}>
          <Text style={styles.label}>Total Sold</Text>
          <Text style={styles.value}>
            {totalTrays} {totalTrays === 1 ? 'tray' : 'trays'}
          </Text>

          {looseEggs > 0 && (
            <Text style={styles.subValue}>
              + {looseEggs} loose eggs
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Revenue</Text>
          <Text style={styles.value}>
            ₱{totalRevenue.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.totalEggCard}>
        <Text style={styles.label}>Total Eggs Sold</Text>
        <Text style={styles.bigValue}>{totalEggsSold}</Text>
        <Text style={styles.subValue}>
          {formatEggsAsTrays(totalEggsSold)}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Transactions</Text>
      <View style={styles.filterRow}>
        {RECORD_FILTERS.map(filter => {
          const selected = recordFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setRecordFilter(filter.key)}
              style={[styles.filterButton, selected && styles.activeFilterButton]}
            >
              <Text style={[styles.filterText, selected && styles.activeFilterText]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {visibleRecords.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            {records.length === 0 ? 'No production or sales recorded yet.' : `No ${recordFilter} records found.`}
          </Text>
        </View>
      ) : visibleRecords.map(record => (
        <View key={record.recordKey} style={styles.transactionCard}>
          <View style={styles.transactionHeader}>
            <Text style={styles.date}>{record.date}</Text>
            {record.kind === 'production' ? (
              <Text style={styles.amount}>Production</Text>
            ) : (
              <Text style={styles.amount}>₱{Number(record.totalAmount || 0).toFixed(2)}</Text>
            )}
          </View>
          <Text style={styles.transactionText}>
            {record.kind === 'production' ? 'Collected' : 'Sold'} · {Number(record.totalEggs || 0)} eggs
          </Text>
          <Text style={styles.trayText}>{formatEggsAsTrays(Number(record.totalEggs || 0))}</Text>
          {record.kind === 'sale' && (
            <>
              <Text style={styles.method}>Egg sizes: {formatSaleSizeDetails(record) || 'Not recorded'}</Text>
              <Text style={styles.method}>Method: {record.inputMode === 'trays' ? 'Trays' : 'Eggs'}</Text>
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 16,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  summaryRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 5,
    elevation: 2,
  },

  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },

  value: {
    fontSize: 21,
    fontWeight: 'bold',
  },

  bigValue: {
    fontSize: 30,
    fontWeight: 'bold',
  },

  subValue: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  totalEggCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  filterRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },

  filterButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 3,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },

  activeFilterButton: {
    backgroundColor: '#2D6A4F',
    borderColor: '#2D6A4F',
  },

  filterText: {
    color: '#536258',
    fontSize: 13,
    fontWeight: '700',
  },

  activeFilterText: {
    color: '#FFFFFF',
  },

  transactionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },

  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  date: {
    fontSize: 14,
    color: '#6B7280',
  },

  amount: {
    fontSize: 17,
    fontWeight: 'bold',
  },

  transactionText: {
    fontSize: 15,
    marginBottom: 3,
  },

  trayText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  method: {
    fontSize: 13,
    color: '#6B7280',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
  },

  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
  },
});
