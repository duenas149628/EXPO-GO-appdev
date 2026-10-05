import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import SummaryCard from '../components/SummaryCard';

import { EggContext } from '../EggContext';
import { useTheme, useThemedStyles } from '../ThemeContext';


export default function DashboardScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);
  const {
    inventory,
    sales,
    productions,
    thresholds,
  } = useContext(EggContext);

  const now = new Date();
  const todayKey = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');

  const harvestedToday = productions
    .filter(record => record.date === todayKey)
    .reduce((total, record) => total + Number(record.totalEggs || 0), 0);

  const soldToday = sales
    .filter(record => record.date === todayKey)
    .reduce((total, record) => total + Number(record.totalEggs || 0), 0);

  const totalInventory =
    inventory.pullet +
    inventory.small +
    inventory.medium +
    inventory.large +
    inventory.xlarge +
    inventory.jumbo;

  const totalEggsSold = sales.reduce(
    (total, sale) => total + Number(sale.totalEggs || 0),
    0
  );

  const totalRevenue = sales.reduce(
    (total, sale) => total + Number(sale.totalAmount || 0),
    0
  );

  const lowStockItems = [];

  if (inventory.pullet <= thresholds.pullet) {
    lowStockItems.push('Pullet');
  }

  if (inventory.small <= thresholds.small) {
    lowStockItems.push('Small');
  }

  if (inventory.medium <= thresholds.medium) {
    lowStockItems.push('Medium');
  }

  if (inventory.large <= thresholds.large) {
    lowStockItems.push('Large');
  }

  if (inventory.xlarge <= thresholds.xlarge) {
    lowStockItems.push('X-Large');
  }

  if (inventory.jumbo <= thresholds.jumbo) {
    lowStockItems.push('Jumbo');
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >

      <View style={[styles.header, { backgroundColor: colors.primarySoft }]}>
        <View style={styles.heroCopy}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>TODAY&apos;S ACTIVITY</Text>
          <View style={styles.activityRow}>
            <View style={styles.activityItem}>
              <Text style={[styles.activityLabel, { color: colors.secondaryText }]}>Harvested</Text>
              <Text style={[styles.activityValue, { color: colors.text }]}>
                {harvestedToday.toLocaleString()} eggs
              </Text>
            </View>
            <View style={styles.activityItem}>
              <Text style={[styles.activityLabel, { color: colors.secondaryText }]}>Sold</Text>
              <Text style={[styles.activityValue, { color: colors.text }]}>
                {soldToday.toLocaleString()} eggs
              </Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            {now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
        </View>
        <View style={[styles.sparkle, { backgroundColor: `${colors.primary}14` }]}>
          <Svg width={30} height={30} viewBox="0 0 32 32" accessibilityLabel="Decorative sparkle">
            <Path d="M16 2.5c1.8 7.3 4.2 9.7 11.5 11.5-7.3 1.8-9.7 4.2-11.5 11.5C14.2 18.2 11.8 15.8 4.5 14 11.8 12.2 14.2 9.8 16 2.5Z" fill={colors.primary} />
            <Path d="M25 22c.7 2.7 1.6 3.6 4.3 4.3-2.7.7-3.6 1.6-4.3 4.3-.7-2.7-1.6-3.6-4.3-4.3 2.7-.7 3.6-1.6 4.3-4.3Z" fill={colors.accent} />
          </Svg>
        </View>
      </View>

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
          value={`₱${totalRevenue}`}
          unit="total sales"
        />

        <SummaryCard
          label="Egg Sizes"
          value="6"
          unit="categories"
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Inventory Status
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('Inventory')}
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

      <Text style={styles.sectionTitle}>
        Stock Alert
      </Text>

      <View style={styles.alertCard}>

        {lowStockItems.length === 0 ? (
          <>
            <Text style={styles.alertTitle}>
              Inventory is in good condition
            </Text>

            <Text style={styles.alertText}>
              No egg size is currently at or below its configured threshold.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.alertTitle}>
              Low Stock Detected
            </Text>

            <Text style={styles.alertText}>
              {lowStockItems.join(', ')} need attention.
            </Text>
          </>
        )}

      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Recent Sales
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('Sales')}
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
        sales.slice(0, 3).map(sale => (
          <View
            key={sale.firebaseId || `sale-${sale.id}`}
            style={styles.saleCard}
          >
            <View>
              <Text style={styles.saleTitle}>
                Egg Sale
              </Text>

              <Text style={styles.saleDate}>
                {sale.date}
              </Text>
            </View>

            <View style={styles.saleRight}>
              <Text style={styles.saleEggs}>
                {Number(sale.totalEggs || 0)} eggs
              </Text>

              <Text style={styles.saleAmount}>
                ₱{Number(sale.totalAmount || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        ))
      )}

    </ScrollView>
  );
}

const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  header: {
    backgroundColor: '#E7F2EA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 19,
    borderRadius: 20,
    overflow: 'hidden',
  },

  heroCopy: {
    flex: 1,
    paddingRight: 8,
  },

  eyebrow: {
    color: '#2D6A4F',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 7,
  },

  sparkle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activityRow: {
    flexDirection: 'row',
    marginTop: 3,
    marginBottom: 2,
  },

  activityItem: {
    flex: 1,
  },

  activityLabel: {
    color: '#536258',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },

  activityValue: {
    fontSize: 16,
    fontWeight: '800',
  },

  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 10,
  },

  cardRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 20,
  },

  viewText: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  statusCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    padding: 10,
    borderRadius: 12,
    elevation: 2,
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  statusName: {
    fontSize: 15,
    fontWeight: 'bold',
  },

  statusValue: {
    fontSize: 15,
  },

  alertCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 12,
    elevation: 2,
  },

  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  alertText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
    lineHeight: 20,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
  },

  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
  },

  saleCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
  },

  saleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
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
  },

  saleAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 3,
  },

  actions: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
});
