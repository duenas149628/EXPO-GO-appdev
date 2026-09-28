import React, { useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Animated,
} from 'react-native';

import SummaryCard from '../components/SummaryCard';
import ActionButton from '../components/ActionButton';
import { EggContext } from '../EggContext';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const { inventory, sales, thresholds } = useContext(EggContext);

  const chickenAnimation = useRef(new Animated.Value(0)).current;
  const eggAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(chickenAnimation, {
          toValue: -5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(chickenAnimation, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(eggAnimation, {
          toValue: -3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(eggAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const totalInventory =
    (inventory?.pullet || 0) +
    (inventory?.small || 0) +
    (inventory?.medium || 0) +
    (inventory?.large || 0) +
    (inventory?.xlarge || 0) +
    (inventory?.jumbo || 0);

  const totalEggsSold = sales.reduce(
    (total, sale) => total + (Number(sale.totalEggs) || 0),
    0
  );

  const totalRevenue = sales.reduce(
    (total, sale) => total + (Number(sale.totalAmount) || 0),
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
          <View style={styles.brandHeader}>
            <Animated.Text
              style={[
                styles.chickenMascot,
                {
                  transform: [
                    {
                      translateY: chickenAnimation,
                    },
                  ],
                },
              ]}
            >
              🐔
            </Animated.Text>

            <View style={styles.brandText}>
              <Text style={styles.brandTitle}>EggTrack</Text>
              <Text style={styles.brandSubtitle}>
                Poultry Management System
              </Text>
            </View>
          </View>

          <View style={styles.greetingCard}>
            <View style={styles.sunCircle}>
              <Text style={styles.sunIcon}>☀️</Text>
            </View>

            <View style={styles.greetingText}>
              <Text style={styles.greetingTitle}>
                Good Day, Farmer!
              </Text>

              <Text style={styles.greetingSubtitle}>
                Here's your farm summary for today.
              </Text>
            </View>

            <Animated.Text
              style={[
                styles.greetingEgg,
                {
                  transform: [
                    {
                      translateY: eggAnimation,
                    },
                  ],
                },
              ]}
            >
              🥚
            </Animated.Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Overview</Text>
          </View>

          <View style={styles.cardRow}>
            <View style={styles.summaryWrapper}>
              <SummaryCard
                label="Inventory"
                value={totalInventory}
                unit="eggs"
              />
            </View>

            <View style={styles.summaryWrapper}>
              <SummaryCard
                label="Eggs Sold"
                value={totalEggsSold}
                unit="eggs"
              />
            </View>
          </View>

          <View style={styles.cardRow}>
            <View style={styles.summaryWrapper}>
              <SummaryCard
                label="Revenue"
                value={`₱${totalRevenue.toFixed(2)}`}
                unit="total sales"
              />
            </View>

            <View style={styles.summaryWrapper}>
              <SummaryCard
                label="Egg Sizes"
                value="6"
                unit="categories"
              />
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Inventory Status</Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('Inventory')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAll}>View All ›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inventoryCard}>
            <View style={styles.inventoryHeader}>
              <View style={styles.inventoryIconCircle}>
                <Text style={styles.inventoryIcon}>📦</Text>
              </View>

              <Text style={styles.inventoryTitle}>
                Current Inventory
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.inventoryRow}>
              <Text style={styles.inventoryLabel}>Total Stock</Text>

              <Text style={styles.inventoryValue}>
                {totalInventory} eggs
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.inventoryRow}>
              <Text style={styles.inventoryLabel}>Complete Trays</Text>

              <Text style={styles.inventoryValue}>
                {Math.floor(totalInventory / 30)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.inventoryRow}>
              <Text style={styles.inventoryLabel}>Loose Eggs</Text>

              <Text style={styles.inventoryValue}>
                {totalInventory % 30}
              </Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Stock Alert</Text>

            {lowStockItems.length > 0 && (
              <View style={styles.alertBadge}>
                <Text style={styles.alertBadgeText}>
                  {lowStockItems.length} item
                  {lowStockItems.length > 1 ? 's' : ''} need attention
                </Text>
              </View>
            )}
          </View>

          <View
            style={[
              styles.alertCard,
              lowStockItems.length > 0
                ? styles.warningAlert
                : styles.successAlert,
            ]}
          >
            <View
              style={[
                styles.alertIconCircle,
                lowStockItems.length > 0
                  ? styles.warningIcon
                  : styles.successIcon,
              ]}
            >
              <Text style={styles.alertIcon}>
                {lowStockItems.length > 0 ? '⚠' : '✓'}
              </Text>
            </View>

            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                {lowStockItems.length > 0
                  ? 'Low Stock Detected'
                  : 'Inventory Looks Good'}
              </Text>

              <Text style={styles.alertDescription}>
                {lowStockItems.length > 0
                  ? `${lowStockItems.join(', ')} need attention.`
                  : 'All egg categories are currently within their thresholds.'}
              </Text>
            </View>

            {lowStockItems.length > 0 && (
              <Text style={styles.alertArrow}>›</Text>
            )}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Sales</Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('Sales')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAll}>View All ›</Text>
            </TouchableOpacity>
          </View>

          {sales.length === 0 ? (
            <View style={styles.emptySalesCard}>
              <View style={styles.emptyIconCircle}>
                <Text style={styles.emptyIcon}>🛒</Text>
              </View>

              <Text style={styles.emptySalesTitle}>
                No sales recorded yet.
              </Text>

              <Text style={styles.emptySalesText}>
                Your recent sales will appear here.
              </Text>
            </View>
          ) : (
            sales.slice(0, 3).map((sale) => (
              <View key={sale.id} style={styles.saleCard}>
                <View style={styles.saleIconCircle}>
                  <Text style={styles.saleIcon}>🥚</Text>
                </View>

                <View style={styles.saleInfo}>
                  <Text style={styles.saleTitle}>
                    Egg Sale
                  </Text>

                  <Text style={styles.saleDate}>
                    {sale.date}
                  </Text>
                </View>

                <View style={styles.saleAmountArea}>
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

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>

          <View style={styles.actionsGrid}>
            <View style={styles.actionItem}>
              <ActionButton
                title="Record Production"
                onPress={() => navigation.navigate('Production')}
              />
            </View>

            <View style={styles.actionItem}>
              <ActionButton
                title="Manage Inventory"
                onPress={() => navigation.navigate('Inventory')}
              />
            </View>

            <View style={styles.actionItem}>
              <ActionButton
                title="Record Sale"
                onPress={() => navigation.navigate('Sales')}
              />
            </View>

            <View style={styles.actionItem}>
              <ActionButton
                title="View Reports"
                onPress={() => navigation.navigate('Reports')}
              />
            </View>

            <View style={styles.actionItem}>
              <ActionButton
                title="View Ledger"
                onPress={() => navigation.navigate('Ledger')}
              />
            </View>

            <View style={styles.actionItem}>
              <ActionButton
                title="Settings"
                onPress={() => navigation.navigate('Settings')}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerChicken}>🐔</Text>

            <Text style={styles.footerText}>
              Healthy Hens • Better Eggs • Greater Profits
            </Text>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  backgroundImage: {
    opacity: 0.16,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 247, 250, 0.84)',
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 8,
    paddingBottom: 45,
  },

  brandHeader: {
    minHeight: 92,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  chickenMascot: {
    fontSize: 42,
    marginRight: 8,
  },

  brandText: {
    alignItems: 'center',
  },

  brandTitle: {
    fontSize: width < 380 ? 29 : 32,
    fontWeight: '900',
    color: '#BE185D',
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  brandSubtitle: {
    fontSize: 12,
    color: '#9D174D',
    marginTop: 1,
    textAlign: 'center',
  },

  greetingCard: {
    marginHorizontal: 18,
    marginTop: 3,
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.90)',
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#831843',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },

  sunCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  sunIcon: {
    fontSize: 25,
  },

  greetingText: {
    flex: 1,
  },

  greetingTitle: {
    fontSize: width < 380 ? 16 : 18,
    fontWeight: '800',
    color: '#3B174A',
  },

  greetingSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 3,
  },

  greetingEgg: {
    fontSize: 31,
    marginLeft: 5,
  },

  sectionHeader: {
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1F2937',
  },

  viewAll: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DB2777',
  },

  cardRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
  },

  summaryWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },

  inventoryCard: {
    marginHorizontal: 18,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.93)',
    borderWidth: 1,
    borderColor: '#FCE7F3',
    shadowColor: '#831843',
    shadowOpacity: 0.06,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },

  inventoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  inventoryIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  inventoryIcon: {
    fontSize: 20,
  },

  inventoryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3B174A',
  },

  divider: {
    height: 1,
    backgroundColor: '#F3E8EF',
    marginVertical: 2,
  },

  inventoryRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  inventoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  inventoryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DB2777',
  },

  alertBadge: {
    backgroundColor: '#FCE7F3',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  alertBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#BE185D',
  },

  alertCard: {
    marginHorizontal: 18,
    padding: 14,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#831843',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  warningAlert: {
    backgroundColor: 'rgba(255,245,247,0.94)',
    borderColor: '#FBCFE8',
  },

  successAlert: {
    backgroundColor: 'rgba(240,253,244,0.94)',
    borderColor: '#BBF7D0',
  },

  alertIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  warningIcon: {
    backgroundColor: '#FCE7F3',
  },

  successIcon: {
    backgroundColor: '#DCFCE7',
  },

  alertIcon: {
    fontSize: 21,
    fontWeight: '900',
    color: '#BE185D',
  },

  alertContent: {
    flex: 1,
  },

  alertTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#374151',
  },

  alertDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },

  alertArrow: {
    fontSize: 28,
    color: '#BE185D',
    marginLeft: 5,
  },

  emptySalesCard: {
    marginHorizontal: 18,
    paddingVertical: 23,
    paddingHorizontal: 20,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.91)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },

  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  emptyIcon: {
    fontSize: 25,
  },

  emptySalesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },

  emptySalesText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 3,
  },

  saleCard: {
    marginHorizontal: 18,
    marginBottom: 9,
    padding: 13,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.94)',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },

  saleIconCircle: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  saleIcon: {
    fontSize: 21,
  },

  saleInfo: {
    flex: 1,
  },

  saleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#374151',
  },

  saleDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 3,
  },

  saleAmountArea: {
    alignItems: 'flex-end',
  },

  saleEggs: {
    fontSize: 11,
    color: '#6B7280',
  },

  saleAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16A34A',
    marginTop: 2,
  },

  actionsGrid: {
    marginHorizontal: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  actionItem: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },

  footer: {
    alignItems: 'center',
    marginTop: 22,
    paddingHorizontal: 20,
  },

  footerChicken: {
    fontSize: 30,
    marginBottom: 5,
  },

  footerText: {
    fontSize: 11,
    color: '#9D174D',
    fontWeight: '600',
    textAlign: 'center',
  },
});