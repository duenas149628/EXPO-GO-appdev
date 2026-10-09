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

          <Text style={styles.totalLabel}>
            Total Eggs
          </Text>

          <Text style={styles.totalValue}>
            {totalEggs}
          </Text>

          <Text style={styles.totalUnit}>
            eggs
          </Text>

        </View>

        <View style={styles.infoCard}>

          <Text style={styles.infoTitle}>
            Storage Summary
          </Text>

          <Text style={styles.infoText}>
            Complete Trays: {completeTrays}
          </Text>

          <Text style={styles.infoText}>
            Loose Eggs: {looseEggs}
          </Text>

        </View>

        <Text style={styles.sectionTitle}>
          Inventory by Size
        </Text>

        <View style={styles.sizeCard}>

          <View style={styles.sizeItem}>

            <View style={styles.sizeHeader}>
              <Text style={styles.sizeName}>
                Pullet
              </Text>

              <Text
                style={getStatusStyle(
                  inventory.pullet,
                  thresholds.pullet
                )}
              >
                {getStatus(
                  inventory.pullet,
                  thresholds.pullet
                )}
              </Text>
            </View>

            <Text style={styles.quantity}>
              {inventory.pullet} eggs
            </Text>

            <Text style={styles.trayQuantity}>
              {Math.floor(inventory.pullet / 30)} trays + {inventory.pullet % 30} loose
            </Text>

            <Text style={styles.threshold}>
              Low-stock threshold: {thresholds.pullet}
            </Text>

          </View>

          <View style={styles.sizeItem}>

            <View style={styles.sizeHeader}>
              <Text style={styles.sizeName}>
                Small
              </Text>

              <Text
                style={getStatusStyle(
                  inventory.small,
                  thresholds.small
                )}
              >
                {getStatus(
                  inventory.small,
                  thresholds.small
                )}
              </Text>
            </View>

            <Text style={styles.quantity}>
              {inventory.small} eggs
            </Text>

            <Text style={styles.trayQuantity}>
              {Math.floor(inventory.small / 30)} trays + {inventory.small % 30} loose
            </Text>

            <Text style={styles.threshold}>
              Low-stock threshold: {thresholds.small}
            </Text>

          </View>

          <View style={styles.sizeItem}>

            <View style={styles.sizeHeader}>
              <Text style={styles.sizeName}>
                Medium
              </Text>

              <Text
                style={getStatusStyle(
                  inventory.medium,
                  thresholds.medium
                )}
              >
                {getStatus(
                  inventory.medium,
                  thresholds.medium
                )}
              </Text>
            </View>

            <Text style={styles.quantity}>
              {inventory.medium} eggs
            </Text>

            <Text style={styles.trayQuantity}>
              {Math.floor(inventory.medium / 30)} trays + {inventory.medium % 30} loose
            </Text>

            <Text style={styles.threshold}>
              Low-stock threshold: {thresholds.medium}
            </Text>

          </View>

          <View style={styles.sizeItem}>

            <View style={styles.sizeHeader}>
              <Text style={styles.sizeName}>
                Large
              </Text>

              <Text
                style={getStatusStyle(
                  inventory.large,
                  thresholds.large
                )}
              >
                {getStatus(
                  inventory.large,
                  thresholds.large
                )}
              </Text>
            </View>

            <Text style={styles.quantity}>
              {inventory.large} eggs
            </Text>

            <Text style={styles.trayQuantity}>
              {Math.floor(inventory.large / 30)} trays + {inventory.large % 30} loose
            </Text>

            <Text style={styles.threshold}>
              Low-stock threshold: {thresholds.large}
            </Text>

          </View>

          <View style={styles.sizeItem}>

            <View style={styles.sizeHeader}>
              <Text style={styles.sizeName}>
                X-Large
              </Text>

              <Text
                style={getStatusStyle(
                  inventory.xlarge,
                  thresholds.xlarge
                )}
              >
                {getStatus(
                  inventory.xlarge,
                  thresholds.xlarge
                )}
              </Text>
            </View>

            <Text style={styles.quantity}>
              {inventory.xlarge} eggs
            </Text>

            <Text style={styles.trayQuantity}>
              {Math.floor(inventory.xlarge / 30)} trays + {inventory.xlarge % 30} loose
            </Text>

            <Text style={styles.threshold}>
              Low-stock threshold: {thresholds.xlarge}
            </Text>

          </View>

          <View style={styles.sizeItem}>

            <View style={styles.sizeHeader}>
              <Text style={styles.sizeName}>
                Jumbo
              </Text>

              <Text
                style={getStatusStyle(
                  inventory.jumbo,
                  thresholds.jumbo
                )}
              >
                {getStatus(
                  inventory.jumbo,
                  thresholds.jumbo
                )}
              </Text>
            </View>

            <Text style={styles.quantity}>
              {inventory.jumbo} eggs
            </Text>

            <Text style={styles.trayQuantity}>
              {Math.floor(inventory.jumbo / 30)} trays + {inventory.jumbo % 30} loose
            </Text>

            <Text style={styles.threshold}>
              Low-stock threshold: {thresholds.jumbo}
            </Text>

          </View>

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
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },

  totalLabel: {
    fontSize: 15,
    color: '#6B7280',
  },

  totalValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 5,
  },

  totalUnit: {
    fontSize: 13,
    color: '#9CA3AF',
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 15,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },

  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  infoText: {
    fontSize: 16,
    marginVertical: 4,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
  },

  sizeCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    borderRadius: 12,
    elevation: 2,
  },

  sizeItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  sizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sizeName: {
    fontSize: 17,
    fontWeight: 'bold',
  },

  quantity: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },

  trayQuantity: {
    color: '#2D6A4F',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 3,
  },

  threshold: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  normalStock: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
  },

  lowStock: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#C84D4D',
  },
});
