import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { EggContext } from '../EggContext';
import { useThemedStyles } from '../ThemeContext';

export default function InventoryScreen() {
  const styles = useThemedStyles(baseStyles);
  const {
    inventory,
    thresholds,
  } = useContext(EggContext);

  const totalEggs =
    inventory.pullet +
    inventory.small +
    inventory.medium +
    inventory.large +
    inventory.xlarge +
    inventory.jumbo;

  const completeTrays = Math.floor(totalEggs / 30);
  const looseEggs = totalEggs % 30;

  const getStatus = (quantity, threshold) => {
    if (quantity <= threshold) {
      return 'LOW STOCK';
    }

    return 'Normal';
  };

  const getStatusStyle = (quantity, threshold) => {
    if (quantity <= threshold) {
      return styles.lowStock;
    }

    return styles.normalStock;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>

        <Text style={styles.title}>
          Egg Inventory
        </Text>

        <Text style={styles.description}>
          Monitor current egg stock and individual low-stock thresholds.
        </Text>

        <View style={styles.totalCard}>
          <View>
            <Text style={styles.totalLabel}>Total Eggs</Text>
            <Text style={styles.totalValue}>{totalEggs}</Text>
          </View>
          <View style={styles.traySummary}>
            <Text style={styles.totalLabel}>Total Trays</Text>
            <Text style={styles.trayTotalValue}>{completeTrays}</Text>
            {looseEggs > 0 && <Text style={styles.totalUnit}>+ {looseEggs} loose eggs</Text>}
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Inventory by Size
        </Text>

        <View style={styles.sizeGrid}>
          {[
            ['Pullet', 'pullet'],
            ['Small', 'small'],
            ['Medium', 'medium'],
            ['Large', 'large'],
            ['X-Large', 'xlarge'],
            ['Jumbo', 'jumbo'],
          ].map(([name, key]) => (
            <View key={key} style={styles.sizeItem}>
              <View style={styles.sizeHeader}>
                <Text style={styles.sizeName}>{name}</Text>
                <Text style={getStatusStyle(inventory[key], thresholds[key])}>
                  {getStatus(inventory[key], thresholds[key])}
                </Text>
              </View>
              <Text style={styles.trayQuantity}>
                {Math.floor(inventory[key] / 30)} {Math.floor(inventory[key] / 30) === 1 ? 'Tray' : 'Trays'}
              </Text>
              <Text style={styles.quantity}>
                {inventory[key]} eggs{inventory[key] % 30 > 0 ? ` (${inventory[key] % 30} loose)` : ''}
              </Text>
              <Text style={styles.threshold}>Threshold: {thresholds[key]}</Text>
            </View>
          ))}
        </View>

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
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },

  description: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
    marginBottom: 25,
  },

  totalCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },

  totalLabel: {
    fontSize: 15,
    color: '#6B7280',
  },

  totalValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 5,
  },

  totalUnit: {
    fontSize: 13,
    color: '#9CA3AF',
  },

  traySummary: {
    alignItems: 'flex-end',
  },

  trayTotalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D6A4F',
    marginTop: 3,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 22,
    marginBottom: 10,
  },

  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  sizeItem: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    padding: 11,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },

  sizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sizeName: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  quantity: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },

  trayQuantity: {
    color: '#2D6A4F',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },

  threshold: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
  },

  normalStock: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6B7280',
  },

  lowStock: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#C84D4D',
  },
});
