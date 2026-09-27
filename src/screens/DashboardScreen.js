import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import SummaryCard from '../components/SummaryCard';
import ActionButton from '../components/ActionButton';

import { EggContext } from '../EggContext';

export default function DashboardScreen({ navigation }) {
  const {
    inventory,
    sales,
    thresholds,
  } = useContext(EggContext);

  const totalInventory =
    inventory.pullet +
    inventory.small +
    inventory.medium +
    inventory.large +
    inventory.xlarge +
    inventory.jumbo;

  const totalEggsSold = sales.reduce(
    (total, sale) => total + sale.totalEggs,
    0
  );

  const totalRevenue = sales.reduce(
    (total, sale) => total + sale.totalAmount,
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

      <View style={styles.header}>
        <Text style={styles.title}>
          EggTrack
        </Text>

        <Text style={styles.subtitle}>
          Poultry Management System
        </Text>
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
            key={sale.id}
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
                {sale.totalEggs} eggs
              </Text>

              <Text style={styles.saleAmount}>
                ₱{sale.totalAmount}
              </Text>
            </View>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>
        Quick Actions
      </Text>

      <View style={styles.actions}>

        <ActionButton
          title="Record Production"
          onPress={() => navigation.navigate('Production')}
        />

        <ActionButton
          title="Manage Inventory"
          onPress={() => navigation.navigate('Inventory')}
        />

        <ActionButton
          title="Record Sale"
          onPress={() => navigation.navigate('Sales')}
        />

        <ActionButton
          title="View Ledger"
          onPress={() => navigation.navigate('Ledger')}
        />

        <ActionButton
          title="View Reports"
          onPress={() => navigation.navigate('Reports')}
        />

        <ActionButton
          title="Settings"
          onPress={() => navigation.navigate('Settings')}
        />

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
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