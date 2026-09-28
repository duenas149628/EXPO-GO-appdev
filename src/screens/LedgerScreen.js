import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
} from 'react-native';

import { EggContext } from '../EggContext';

export default function LedgerScreen() {
  const { sales } = useContext(EggContext);

  // =========================
  // TOTAL REVENUE
  // =========================

  const totalRevenue = sales.reduce(
    (total, sale) => total + sale.totalAmount,
    0
  );

  // =========================
  // TOTAL EGGS SOLD
  // =========================

  const totalEggsSold = sales.reduce(
    (total, sale) => total + sale.totalEggs,
    0
  );

  // =========================
  // TRAYS & LOOSE EGGS
  // =========================

  const totalTrays = Math.floor(totalEggsSold / 30);
  const looseEggs = totalEggsSold % 30;

  // =========================
  // FORMAT EGGS
  // =========================

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
    <ImageBackground
      source={{
        uri: 'https://img.freepik.com/premium-photo/side-profile-chicken-against-pink-background-concept-animal-photography-still-life-pink-backgrounds_864588-56895.jpg',
      }}
      style={styles.background}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
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
              Sales Ledger
            </Text>

            <Text style={styles.subtitle}>
              Review recorded sales, total eggs sold, and revenue.
            </Text>
          </View>

          {/* =========================
              SALES OVERVIEW
          ========================= */}

          <Text style={styles.sectionTitle}>
            Sales Overview
          </Text>

          <View style={styles.summaryRow}>

            {/* TOTAL SOLD */}

            <View style={styles.summaryCard}>
              <Text style={styles.label}>
                Total Sold
              </Text>

              <Text style={styles.value}>
                {totalTrays}{' '}
                {totalTrays === 1 ? 'tray' : 'trays'}
              </Text>

              {looseEggs > 0 && (
                <Text style={styles.subValue}>
                  + {looseEggs} loose eggs
                </Text>
              )}
            </View>

            {/* REVENUE */}

            <View style={styles.summaryCard}>
              <Text style={styles.label}>
                Revenue
              </Text>

              <Text style={styles.revenueValue}>
                ₱{totalRevenue.toFixed(2)}
              </Text>

              <Text style={styles.subValue}>
                Total sales
              </Text>
            </View>

          </View>

          {/* =========================
              TOTAL EGGS SOLD
          ========================= */}

          <View style={styles.totalEggCard}>
            <Text style={styles.label}>
              Total Eggs Sold
            </Text>

            <Text style={styles.bigValue}>
              {totalEggsSold}
            </Text>

            <Text style={styles.subValue}>
              {formatEggsAsTrays(totalEggsSold)}
            </Text>
          </View>

          {/* =========================
              TRANSACTIONS
          ========================= */}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Transactions
            </Text>

            <Text style={styles.transactionCount}>
              {sales.length}{' '}
              {sales.length === 1 ? 'record' : 'records'}
            </Text>
          </View>

          {sales.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                No Sales Yet
              </Text>

              <Text style={styles.emptyText}>
                No sales have been recorded yet.
              </Text>
            </View>
          ) : (
            sales.map((sale) => (
              <View
                key={sale.id}
                style={styles.transactionCard}
              >

                {/* TRANSACTION HEADER */}

                <View style={styles.transactionHeader}>

                  <View>
                    <Text style={styles.transactionTitle}>
                      Egg Sale
                    </Text>

                    <Text style={styles.date}>
                      {sale.date}
                    </Text>
                  </View>

                  <Text style={styles.amount}>
                    ₱{sale.totalAmount.toFixed(2)}
                  </Text>

                </View>

                {/* EGGS SOLD */}

                <View style={styles.transactionRow}>
                  <Text style={styles.transactionLabel}>
                    Eggs Sold
                  </Text>

                  <Text style={styles.transactionValue}>
                    {sale.totalEggs} eggs
                  </Text>
                </View>

                {/* QUANTITY */}

                <View style={styles.transactionRow}>
                  <Text style={styles.transactionLabel}>
                    Quantity
                  </Text>

                  <Text style={styles.trayText}>
                    {formatEggsAsTrays(sale.totalEggs)}
                  </Text>
                </View>

                {/* INPUT METHOD */}

                <View style={styles.transactionRow}>
                  <Text style={styles.transactionLabel}>
                    Method
                  </Text>

                  <Text style={styles.method}>
                    {sale.inputMode === 'trays'
                      ? 'Trays'
                      : 'Eggs'}
                  </Text>
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
  // SUMMARY
  // =========================

  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
  },

  summaryCard: {
    flex: 1,

    backgroundColor: 'rgba(255, 255, 255, 0.92)',

    marginHorizontal: 5,
    padding: 17,

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

  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },

  value: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  revenueValue: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#16A34A',
  },

  subValue: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 5,
  },

  // =========================
  // TOTAL EGGS
  // =========================

  totalEggCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',

    marginHorizontal: 20,
    marginTop: 15,

    padding: 20,

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

  bigValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2563EB',
    marginTop: 2,
  },

  // =========================
  // TRANSACTIONS HEADER
  // =========================

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingRight: 20,
  },

  transactionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',

    marginTop: 15,
  },

  // =========================
  // TRANSACTION CARD
  // =========================

  transactionCard: {
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

  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingBottom: 12,
    marginBottom: 5,

    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  transactionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  date: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 3,
  },

  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16A34A',
  },

  // =========================
  // TRANSACTION ROW
  // =========================

  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingVertical: 7,
  },

  transactionLabel: {
    fontSize: 14,
    color: '#6B7280',
  },

  transactionValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },

  trayText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#374151',
  },

  method: {
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