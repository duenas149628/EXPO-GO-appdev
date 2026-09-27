import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { EggContext } from '../EggContext';

export default function LedgerScreen() {
  const { sales } = useContext(EggContext);

  const totalRevenue = sales.reduce(
    (total, sale) => total + sale.totalAmount,
    0
  );

  const totalEggsSold = sales.reduce(
    (total, sale) => total + sale.totalEggs,
    0
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
      <Text style={styles.title}>Sales Ledger</Text>

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

      {sales.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No sales recorded yet.
          </Text>
        </View>
      ) : (
        sales.map((sale) => (
          <View key={sale.id} style={styles.transactionCard}>
            <View style={styles.transactionHeader}>
              <Text style={styles.date}>{sale.date}</Text>

              <Text style={styles.amount}>
                ₱{sale.totalAmount.toFixed(2)}
              </Text>
            </View>

            <Text style={styles.transactionText}>
              {sale.totalEggs} eggs
            </Text>

            <Text style={styles.trayText}>
              {formatEggsAsTrays(sale.totalEggs)}
            </Text>

            <Text style={styles.method}>
              Method: {sale.inputMode === 'trays' ? 'Trays' : 'Eggs'}
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