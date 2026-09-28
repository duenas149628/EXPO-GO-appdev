import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
} from 'react-native';

import { EggContext } from '../EggContext';

export default function InventoryScreen() {
  const { inventory, thresholds } = useContext(EggContext);

  // =========================
  // TOTAL INVENTORY
  // =========================

  const totalEggs =
    inventory.pullet +
    inventory.small +
    inventory.medium +
    inventory.large +
    inventory.xlarge +
    inventory.jumbo;

  const completeTrays = Math.floor(totalEggs / 30);
  const looseEggs = totalEggs % 30;

  // =========================
  // EGG SIZE DATA
  // =========================

  const eggSizes = [
    {
      key: 'pullet',
      label: 'Pullet',
    },
    {
      key: 'small',
      label: 'Small',
    },
    {
      key: 'medium',
      label: 'Medium',
    },
    {
      key: 'large',
      label: 'Large',
    },
    {
      key: 'xlarge',
      label: 'X-Large',
    },
    {
      key: 'jumbo',
      label: 'Jumbo',
    },
  ];

  // =========================
  // STATUS
  // =========================

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
    <ImageBackground
      source={{
        uri: 'https://img.freepik.com/premium-photo/side-profile-chicken-against-pink-background-concept-animal-photography-still-life-pink-backgrounds_864588-56895.jpg',
      }}
      style={styles.background}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* LIGHT OVERLAY */}
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
              Egg Inventory
            </Text>

            <Text style={styles.subtitle}>
              Monitor current egg stock and individual
              low-stock thresholds.
            </Text>
          </View>

          {/* =========================
              INVENTORY OVERVIEW
          ========================= */}

          <Text style={styles.sectionTitle}>
            Inventory Overview
          </Text>

          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>
              Total Eggs
            </Text>

            <Text style={styles.totalValue}>
              {totalEggs}
            </Text>

            <Text style={styles.totalUnit}>
              eggs currently in inventory
            </Text>
          </View>

          {/* =========================
              STORAGE SUMMARY
          ========================= */}

          <Text style={styles.sectionTitle}>
            Storage Summary
          </Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Complete Trays
              </Text>

              <Text style={styles.infoValue}>
                {completeTrays}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                Loose Eggs
              </Text>

              <Text style={styles.infoValue}>
                {looseEggs}
              </Text>
            </View>

            <View
              style={[
                styles.infoRow,
                styles.lastInfoRow,
              ]}
            >
              <Text style={styles.infoLabel}>
                Eggs per Tray
              </Text>

              <Text style={styles.infoValue}>
                30
              </Text>
            </View>
          </View>

          {/* =========================
              INVENTORY BY SIZE
          ========================= */}

          <Text style={styles.sectionTitle}>
            Inventory by Size
          </Text>

          <View style={styles.sizeCard}>
            {eggSizes.map((egg, index) => {
              const quantity = inventory[egg.key];
              const threshold = thresholds[egg.key];

              const isLowStock = quantity <= threshold;

              return (
                <View
                  key={egg.key}
                  style={[
                    styles.sizeItem,
                    index === eggSizes.length - 1 &&
                      styles.lastSizeItem,
                  ]}
                >
                  {/* SIZE HEADER */}

                  <View style={styles.sizeHeader}>
                    <Text style={styles.sizeName}>
                      {egg.label}
                    </Text>

                    <View
                      style={[
                        styles.statusBadge,
                        isLowStock &&
                          styles.lowStockBadge,
                      ]}
                    >
                      <Text
                        style={getStatusStyle(
                          quantity,
                          threshold
                        )}
                      >
                        {getStatus(
                          quantity,
                          threshold
                        )}
                      </Text>
                    </View>
                  </View>

                  {/* QUANTITY */}

                  <Text style={styles.quantity}>
                    {quantity} eggs
                  </Text>

                  {/* THRESHOLD */}

                  <Text style={styles.threshold}>
                    Low-stock threshold: {threshold}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* BOTTOM SPACE */}

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
  // TOTAL CARD
  // =========================

  totalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',

    marginHorizontal: 20,
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

  totalLabel: {
    fontSize: 15,
    color: '#6B7280',
  },

  totalValue: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#1F2937',

    marginTop: 5,
  },

  totalUnit: {
    fontSize: 13,
    color: '#9CA3AF',

    marginTop: 2,
  },

  // =========================
  // STORAGE SUMMARY
  // =========================

  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',

    marginHorizontal: 20,
    padding: 10,

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

  infoRow: {
    flexDirection: 'row',

    justifyContent: 'space-between',
    alignItems: 'center',

    paddingVertical: 13,
    paddingHorizontal: 10,

    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  lastInfoRow: {
    borderBottomWidth: 0,
  },

  infoLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#374151',
  },

  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
  },

  // =========================
  // INVENTORY SIZE CARD
  // =========================

  sizeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',

    marginHorizontal: 20,
    paddingHorizontal: 15,

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

  // =========================
  // SIZE ITEM
  // =========================

  sizeItem: {
    paddingVertical: 17,

    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  lastSizeItem: {
    borderBottomWidth: 0,
  },

  sizeHeader: {
    flexDirection: 'row',

    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sizeName: {
    fontSize: 17,
    fontWeight: 'bold',

    color: '#1F2937',
  },

  // =========================
  // STATUS BADGE
  // =========================

  statusBadge: {
    backgroundColor: '#DCFCE7',

    paddingHorizontal: 10,
    paddingVertical: 5,

    borderRadius: 20,
  },

  lowStockBadge: {
    backgroundColor: '#FEF3C7',
  },

  normalStock: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#16A34A',
  },

  lowStock: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#D97706',
  },

  // =========================
  // QUANTITY
  // =========================

  quantity: {
    fontSize: 22,
    fontWeight: 'bold',

    color: '#2563EB',

    marginTop: 10,
  },

  // =========================
  // THRESHOLD
  // =========================

  threshold: {
    fontSize: 13,

    color: '#6B7280',

    marginTop: 4,
  },

  // =========================
  // BOTTOM SPACE
  // =========================

  bottomSpace: {
    height: 35,
  },
});