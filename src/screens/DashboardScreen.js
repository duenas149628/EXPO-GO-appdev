import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';

import SummaryCard from '../components/SummaryCard';
import ActionButton from '../components/ActionButton';
import { EggContext } from '../EggContext';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const {
    inventory,
    sales,
    thresholds,
  } = useContext(EggContext);

  // =========================
  // TOTAL INVENTORY
  // =========================

  const totalInventory =
    (inventory?.pullet || 0) +
    (inventory?.small || 0) +
    (inventory?.medium || 0) +
    (inventory?.large || 0) +
    (inventory?.xlarge || 0) +
    (inventory?.jumbo || 0);

  // =========================
  // TOTAL EGGS SOLD
  // =========================

  const totalEggsSold = sales.reduce(
    (total, sale) => total + (Number(sale.totalEggs) || 0),
    0
  );

  // =========================
  // TOTAL REVENUE
  // =========================

  const totalRevenue = sales.reduce(
    (total, sale) => total + (Number(sale.totalAmount) || 0),
    0
  );

  // =========================
  // LOW STOCK
  // =========================

  const lowStockItems = [];

  if (
    inventory.pullet <= thresholds.pullet
  ) {
    lowStockItems.push('Pullet');
  }

  if (
    inventory.small <= thresholds.small
  ) {
    lowStockItems.push('Small');
  }

  if (
    inventory.medium <= thresholds.medium
  ) {
    lowStockItems.push('Medium');
  }

  if (
    inventory.large <= thresholds.large
  ) {
    lowStockItems.push('Large');
  }

  if (
    inventory.xlarge <= thresholds.xlarge
  ) {
    lowStockItems.push('X-Large');
  }

  if (
    inventory.jumbo <= thresholds.jumbo
  ) {
    lowStockItems.push('Jumbo');
  }

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
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* =========================
              HEADER
          ========================= */}
        <View style={styles.header}>
          <View style={styles.headerTextBox}>
            <Text style={styles.title}>
              EggTrack
            </Text>

            <Text style={styles.subtitle}>
              Poultry Management System
            </Text>
          </View>
        </View>

          {/* =========================
              OVERVIEW
          ========================= */}

          <Text style={styles.sectionTitle}>
            Overview
          </Text>

          <View style={styles.cardRow}>
            <SummaryCard
              label="Inventory"
              value={totalInventory}
              unit="eggs"
            />

            <SummaryCard
              label="Eggs Sold"
              value={totalEggsSold}
              unit="eggs"
            />
          </View>

          <View style={styles.cardRow}>
            <SummaryCard
              label="Revenue"
              value={`₱${totalRevenue.toFixed(2)}`}
              unit="total sales"
            />

            <SummaryCard
              label="Egg Sizes"
              value="6"
              unit="categories"
            />
          </View>

          {/* =========================
              INVENTORY STATUS
          ========================= */}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Inventory Status
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('Inventory')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewText}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusName}>
                Total Stock
              </Text>

              <Text style={styles.statusValue}>
                {totalInventory} eggs
              </Text>
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.statusName}>
                Complete Trays
              </Text>

              <Text style={styles.statusValue}>
                {Math.floor(totalInventory / 30)}
              </Text>
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.statusName}>
                Loose Eggs
              </Text>

              <Text style={styles.statusValue}>
                {totalInventory % 30}
              </Text>
            </View>
          </View>

          {/* =========================
              STOCK ALERT
          ========================= */}

          <Text style={styles.sectionTitle}>
            Stock Alert
          </Text>

          <View
            style={[
              styles.alertCard,
              lowStockItems.length > 0 &&
                styles.warningCard,
            ]}
          >
            {lowStockItems.length === 0 ? (
              <>
                <Text style={styles.alertTitle}>
                  ✓ Inventory is in good condition
                </Text>

                <Text style={styles.alertText}>
                  No egg size is currently at or below
                  its configured threshold.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.alertTitle}>
                  ⚠ Low Stock Detected
                </Text>

                <Text style={styles.alertText}>
                  {lowStockItems.join(', ')} need attention.
                </Text>
              </>
            )}
          </View>

          {/* =========================
              RECENT SALES
          ========================= */}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Recent Sales
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('Sales')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewText}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {sales.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No sales recorded yet.
              </Text>
            </View>
          ) : (
            sales.slice(0, 3).map((sale) => (
              <View
                key={sale.id}
                style={styles.saleCard}
              >
                <View style={styles.saleLeft}>
                  <Text style={styles.saleTitle}>
                    Egg Sale
                  </Text>

                  <Text style={styles.saleDate}>
                    {sale.date}
                  </Text>
                </View>

                <View style={styles.saleRight}>
                  <Text style={styles.saleEggs}>
                    {sale.totalEggs} eggs
                  </Text>

                  <Text style={styles.saleAmount}>
                    ₱{Number(sale.totalAmount).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))
          )}

          {/* =========================
              QUICK ACTIONS
          ========================= */}

          <Text style={styles.sectionTitle}>
            Quick Actions
          </Text>

          <View style={styles.actions}>
            <ActionButton
              title="Record Production"
              onPress={() =>
                navigation.navigate('Production')
              }
            />

            <ActionButton
              title="Manage Inventory"
              onPress={() =>
                navigation.navigate('Inventory')
              }
            />

            <ActionButton
              title="Record Sale"
              onPress={() =>
                navigation.navigate('Sales')
              }
            />

            <ActionButton
              title="View Ledger"
              onPress={() =>
                navigation.navigate('Ledger')
              }
            />

            <ActionButton
              title="View Reports"
              onPress={() =>
                navigation.navigate('Reports')
              }
            />

            <ActionButton
              title="Settings"
              onPress={() =>
                navigation.navigate('Settings')
              }
            />
          </View>
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
    opacity: 0.45,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  // =========================
  // HEADER
  // =========================

 header: {
  backgroundColor: 'rgba(255, 255, 255, 0.94)',

  paddingHorizontal: 20,
  paddingTop: 25,
  paddingBottom: 25,

  borderBottomWidth: 1,
  borderBottomColor: '#E5E7EB',

  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 4,
  shadowOffset: {
    width: 0,
    height: 2,
  },

  elevation: 3,

  alignItems: 'center',
  justifyContent: 'center',
},

headerTextBox: {
  width: '100%',
  maxWidth: 500,

  backgroundColor: 'rgba(255, 192, 203, 0.85)',

  paddingVertical: 18,
  paddingHorizontal: 20,

  borderRadius: 18,

  borderWidth: 2,
  borderColor: '#EC4899',

  alignItems: 'center',
  justifyContent: 'center',

  shadowColor: '#000',
  shadowOpacity: 0.12,
  shadowRadius: 5,
  shadowOffset: {
    width: 0,
    height: 2,
  },

  elevation: 4,
},

title: {
  fontSize: width < 380 ? 28 : 32,
  fontWeight: '800',
  color: '#831843',
  letterSpacing: 0.5,
  textAlign: 'center',
},

subtitle: {
  fontSize: width < 380 ? 13 : 15,
  color: '#9D174D',
  marginTop: 5,
  letterSpacing: 0.3,
  textAlign: 'center',
},

  // =========================
  // SECTION
  // =========================

  sectionTitle: {
    fontSize: width < 380 ? 18 : 20,
    fontWeight: '700',
    color: '#1F2937',
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 10,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 20,
  },

  viewText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },

  // =========================
  // SUMMARY CARDS
  // =========================

  cardRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 4,
  },

  // =========================
  // INVENTORY STATUS
  // =========================

  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    padding: 10,
    borderRadius: 14,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 3,
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingVertical: 13,
    paddingHorizontal: 10,

    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  statusName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },

  statusValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },

  // =========================
  // STOCK ALERT
  // =========================

  alertCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 14,

    borderLeftWidth: 5,
    borderLeftColor: '#22C55E',

    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 3,
  },

  warningCard: {
    borderLeftColor: '#F59E0B',
  },

  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },

  alertText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
    lineHeight: 20,
  },

  // =========================
  // EMPTY
  // =========================

  emptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 14,
    elevation: 2,
  },

  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 14,
  },

  // =========================
  // SALES
  // =========================

  saleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 14,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 3,
  },

  saleLeft: {
    flex: 1,
    paddingRight: 10,
  },

  saleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },

  saleDate: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  saleRight: {
    alignItems: 'flex-end',
  },

  saleEggs: {
    fontSize: 14,
    color: '#4B5563',
  },

  saleAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 3,
  },

  // =========================
  // QUICK ACTIONS
  // =========================

  actions: {
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
});