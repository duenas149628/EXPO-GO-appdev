import React, { useContext, useMemo, useState } from 'react';
import {
  Alert,
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

function DateDropdown({ label, value, options, getOptionLabel, onSelect, isOpen, onToggle, onClose, styles }) {
  return (
    <View style={styles.dateDropdownColumn}>
      <TouchableOpacity
        style={styles.dateDropdownButton}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={`${label}: ${getOptionLabel(value)}`}
        onPress={onToggle}
      >
        <Text style={styles.dateDropdownValue} numberOfLines={1}>{getOptionLabel(value)}</Text>
        <Text style={styles.dateDropdownChevron}>{isOpen ? '⌃' : '⌄'}</Text>
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.dateDropdownMenu}>
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {options.map(option => (
              <TouchableOpacity
                key={option}
                style={[styles.dateDropdownOption, option === value && styles.dateDropdownOptionSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected: option === value }}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text style={[styles.dateDropdownOptionText, option === value && styles.dateDropdownOptionSelectedText]}>
                  {getOptionLabel(option)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function DateRangePicker({ label, value, onChange, styles }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1999 }, (_, index) => currentYear - index);
  const daysInMonth = new Date(value.getFullYear(), value.getMonth() + 1, 0).getDate();
  const months = Array.from({ length: 12 }, (_, index) => index + 1);
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);
  const monthLabel = month => new Date(2000, month - 1, 1).toLocaleString('en-US', { month: 'long' });

  return (
    <View style={styles.dateRangeGroup}>
      <View style={styles.dateDropdownRow}>
        <Text style={styles.dateRangeEndpoint}>{label}</Text>
        <DateDropdown
          label="Month"
          value={value.getMonth() + 1}
          options={months}
          getOptionLabel={monthLabel}
          onSelect={month => onChange(new Date(value.getFullYear(), month - 1, Math.min(value.getDate(), new Date(value.getFullYear(), month, 0).getDate())))}
          isOpen={openDropdown === 'month'}
          onToggle={() => setOpenDropdown(openDropdown === 'month' ? null : 'month')}
          onClose={() => setOpenDropdown(null)}
          styles={styles}
        />
        <DateDropdown
          key={`day-${value.getMonth()}-${value.getFullYear()}`}
          label="Day"
          value={value.getDate()}
          options={days}
          getOptionLabel={day => String(day)}
          onSelect={day => onChange(new Date(value.getFullYear(), value.getMonth(), day))}
          isOpen={openDropdown === 'day'}
          onToggle={() => setOpenDropdown(openDropdown === 'day' ? null : 'day')}
          onClose={() => setOpenDropdown(null)}
          styles={styles}
        />
        <DateDropdown
          label="Year"
          value={value.getFullYear()}
          options={years}
          getOptionLabel={year => String(year)}
          onSelect={year => onChange(new Date(year, value.getMonth(), Math.min(value.getDate(), new Date(year, value.getMonth() + 1, 0).getDate())))}
          isOpen={openDropdown === 'year'}
          onToggle={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
          onClose={() => setOpenDropdown(null)}
          styles={styles}
        />
      </View>
    </View>
  );
}

const toDateKey = value => {
  if (typeof value !== 'string') return null;
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return Number(`${year}${month}${day}`);
  }
  const displayMatch = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!displayMatch) return null;
  const [, month, day, year] = displayMatch;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day)) return null;
  return Number(`${year}${month}${day}`);
};

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
  const [dateFrom, setDateFrom] = useState(() => new Date(new Date().getFullYear(), 0, 1));
  const [dateTo, setDateTo] = useState(() => new Date());
  const [appliedDateRange, setAppliedDateRange] = useState(null);

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
  const revenueBySize = useMemo(() => {
    const sizes = [
      ['Pullet', 'pullet'], ['Small', 'small'], ['Medium', 'medium'],
      ['Large', 'large'], ['X-Large', 'xlarge'], ['Jumbo', 'jumbo'],
    ];
    return sizes.map(([label, key]) => ({
      label,
      amount: sales.reduce((total, sale) => {
        const detail = sale.eggSizes?.find(size => size.key === key);
        if (detail && Number.isFinite(Number(detail.total))) return total + Number(detail.total);
        const quantity = Number(sale.quantities?.[key] ?? detail?.quantity ?? 0);
        const price = Number(sale.prices?.[key] ?? detail?.price ?? 0);
        return total + quantity * price;
      }, 0),
    }));
  }, [sales]);
  const records = useMemo(() => [
    ...productions.map((record, index) => ({ ...record, kind: 'production', recordKey: record.firebaseId || `production-${record.id}-${index}` })),
    ...sales.map((record, index) => ({ ...record, kind: 'sale', recordKey: record.firebaseId || `sale-${record.id}-${index}` })),
  ].sort((a, b) => `${b.date || ''}-${b.id || ''}`.localeCompare(`${a.date || ''}-${a.id || ''}`)), [productions, sales]);
  const visibleRecords = useMemo(
    () => records.filter(record => {
      if (recordFilter !== 'all' && record.kind !== recordFilter) return false;
      if (!appliedDateRange) return true;
      const dateKey = toDateKey(record.date);
      if (dateKey === null) return false;
      return (appliedDateRange.from === null || dateKey >= appliedDateRange.from)
        && (appliedDateRange.to === null || dateKey <= appliedDateRange.to);
    }),
    [records, recordFilter, appliedDateRange]
  );

  const applyDateFilter = () => {
    const from = dateFrom.getFullYear() * 10000 + (dateFrom.getMonth() + 1) * 100 + dateFrom.getDate();
    const to = dateTo.getFullYear() * 10000 + (dateTo.getMonth() + 1) * 100 + dateTo.getDate();
    if (from > to) {
      Alert.alert('Invalid date range', 'The start date must be on or before the end date.');
      return;
    }
    setAppliedDateRange({ from, to });
  };

  const clearDateFilter = () => {
    setAppliedDateRange(null);
  };

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

      <View style={styles.soldSummaryCard}>
        <View style={styles.soldMetric}>
          <Text style={styles.label}>Total Eggs Sold</Text>
          <Text style={styles.bigValue}>{totalEggsSold}</Text>
        </View>
        <View style={[styles.soldMetric, styles.soldMetricRight]}>
          <Text style={styles.label}>Total Trays Sold</Text>
          <Text style={styles.soldTrayValue}>{totalTrays}</Text>
          {looseEggs > 0 && <Text style={styles.subValue}>+ {looseEggs} loose eggs</Text>}
        </View>
      </View>

      <View style={styles.revenueSummaryCard}>
        <View style={styles.totalRevenueBlock}>
          <Text style={styles.label}>Total Revenue</Text>
          <Text style={styles.revenueValue} numberOfLines={1} adjustsFontSizeToFit>&#8369;{totalRevenue.toFixed(2)}</Text>
        </View>
        <View style={styles.revenueBySizeBlock}>
          <Text style={styles.revenueBySizeTitle}>Revenue by egg size</Text>
          {revenueBySize.map(size => (
            <View key={size.label} style={styles.revenueSizeRow}>
              <Text style={styles.revenueSizeLabel} numberOfLines={1}>{size.label}</Text>
              <Text style={styles.revenueSizeAmount} numberOfLines={1} adjustsFontSizeToFit>&#8369;{size.amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>
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

      <View style={styles.dateFilterCard}>
        <View style={styles.dateFilterHeading}>
          <Text style={styles.dateFilterTitle}>Filter by date</Text>
          <View style={styles.dateFilterActions}>
            <TouchableOpacity style={styles.dateApplyButton} onPress={applyDateFilter} accessibilityRole="button">
              <Text style={styles.dateApplyText}>Apply</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateClearButton} onPress={clearDateFilter} accessibilityRole="button">
              <Text style={styles.dateClearText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.dateDropdownRow}>
          <Text style={styles.dateRangeEndpoint} />
          <Text style={styles.dateColumnHeading}>Month</Text>
          <Text style={styles.dateColumnHeading}>Day</Text>
          <Text style={styles.dateColumnHeading}>Year</Text>
        </View>
        <DateRangePicker label="From" value={dateFrom} onChange={setDateFrom} styles={styles} />
        <DateRangePicker label="To" value={dateTo} onChange={setDateTo} styles={styles} />
      </View>

      {visibleRecords.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            {records.length === 0
              ? 'No production or sales recorded yet.'
              : appliedDateRange
                ? 'No transactions match the selected date range.'
                : `No ${recordFilter} records found.`}
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

  soldSummaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  soldMetric: { flex: 1 },
  soldMetricRight: { alignItems: 'flex-end', borderLeftWidth: 1, borderLeftColor: '#E5E7EB', paddingLeft: 12 },

  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },

  bigValue: {
    fontSize: 30,
    fontWeight: 'bold',
  },

  soldTrayValue: { fontSize: 26, fontWeight: 'bold', color: '#2D6A4F' },

  subValue: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  revenueSummaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },

  totalRevenueBlock: { flex: 0.9, minWidth: 0, paddingRight: 8, justifyContent: 'center' },
  revenueValue: { fontSize: 15, fontWeight: 'bold', color: '#2D6A4F' },
  revenueBySizeBlock: { flex: 1.6, minWidth: 0, borderLeftWidth: 1, borderLeftColor: '#E5E7EB', paddingLeft: 8 },
  revenueBySizeTitle: { color: '#6B7280', fontSize: 10, fontWeight: '700', marginBottom: 3 },
  revenueSizeRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 1, minWidth: 0 },
  revenueSizeLabel: { color: '#6B7280', fontSize: 10, flex: 1, minWidth: 0 },
  revenueSizeAmount: { fontSize: 10, fontWeight: '600', flexShrink: 1, textAlign: 'right' },

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

  dateFilterCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 10, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  dateFilterHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  dateFilterTitle: { color: '#111827', fontSize: 13, fontWeight: '700' },
  dateRangeGroup: { marginBottom: 4 },
  dateDropdownRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: -3 },
  dateRangeEndpoint: { width: 48, color: '#6B7280', fontSize: 11, fontWeight: '700', marginHorizontal: 3 },
  dateColumnHeading: { flex: 1, color: '#9CA3AF', fontSize: 9, fontWeight: '700', marginHorizontal: 3, marginBottom: 2 },
  dateDropdownColumn: { flex: 1, marginHorizontal: 3, zIndex: 2 },
  dateDropdownButton: { minHeight: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 7, paddingHorizontal: 6 },
  dateDropdownValue: { color: '#111827', fontSize: 10, fontWeight: '600', flex: 1 },
  dateDropdownChevron: { color: '#6B7280', fontSize: 13, marginLeft: 2 },
  dateDropdownMenu: { maxHeight: 180, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, marginTop: 4, elevation: 5 },
  dateDropdownOption: { minHeight: 34, justifyContent: 'center', paddingHorizontal: 8 },
  dateDropdownOptionSelected: { backgroundColor: '#E7F2EA' },
  dateDropdownOptionText: { color: '#374151', fontSize: 12 },
  dateDropdownOptionSelectedText: { color: '#2D6A4F', fontWeight: '700' },
  dateFilterActions: { flexDirection: 'row', alignItems: 'center' },
  dateApplyButton: { backgroundColor: '#2D6A4F', borderRadius: 6, paddingHorizontal: 9, paddingVertical: 5 },
  dateApplyText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  dateClearButton: { paddingHorizontal: 8, paddingVertical: 5 },
  dateClearText: { color: '#536258', fontSize: 10, fontWeight: '700' },

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
