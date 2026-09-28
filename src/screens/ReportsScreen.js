import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageBackground,
} from 'react-native';

import { LineChart, BarChart } from 'react-native-chart-kit';

import { EggContext } from '../EggContext';

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
  const {
    productions,
    sales,
    inventory,
  } = useContext(EggContext);

  // =========================
  // TOTAL INVENTORY
  // =========================

  const totalInventory =
    inventory.pullet +
    inventory.small +
    inventory.medium +
    inventory.large +
    inventory.xlarge +
    inventory.jumbo;

  // =========================
  // TOTAL PRODUCTION
  // =========================

  const totalEggsProduced = productions.reduce(
    (total, production) =>
      total + Number(production.totalEggs || 0),
    0
  );

  // =========================
  // TOTAL SALES
  // =========================

  const totalEggsSold = sales.reduce(
    (total, sale) =>
      total + Number(sale.totalEggs || 0),
    0
  );

  // =========================
  // TOTAL REVENUE
  // =========================

  const totalRevenue = sales.reduce(
    (total, sale) =>
      total + Number(sale.totalAmount || 0),
    0
  );

  // =========================
  // PRODUCTION BY SIZE
  // =========================

  const productionBySize = {
    pullet: productions.reduce(
      (total, production) =>
        total + Number(production.pullet || 0),
      0
    ),

    small: productions.reduce(
      (total, production) =>
        total + Number(production.small || 0),
      0
    ),

    medium: productions.reduce(
      (total, production) =>
        total + Number(production.medium || 0),
      0
    ),

    large: productions.reduce(
      (total, production) =>
        total + Number(production.large || 0),
      0
    ),

    xlarge: productions.reduce(
      (total, production) =>
        total + Number(production.xlarge || 0),
      0
    ),

    jumbo: productions.reduce(
      (total, production) =>
        total + Number(production.jumbo || 0),
      0
    ),
  };

  // =========================
  // DAILY PRODUCTION
  // =========================

  const dailyProduction = {};

  productions.forEach(production => {
    const date = production.date;

    if (!dailyProduction[date]) {
      dailyProduction[date] = 0;
    }

    dailyProduction[date] += Number(
      production.totalEggs || 0
    );
  });

  const productionDates = Object.keys(dailyProduction)
    .sort()
    .slice(-7);

  const productionLabels = productionDates.map(date => {
    const parts = date.split('-');

    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}`;
    }

    return date;
  });

  const productionValues = productionDates.map(
    date => dailyProduction[date]
  );

  // =========================
  // DAILY SALES
  // =========================

  const dailySales = {};

  sales.forEach(sale => {
    const date = sale.date;

    if (!dailySales[date]) {
      dailySales[date] = 0;
    }

    dailySales[date] += Number(
      sale.totalEggs || 0
    );
  });

  const salesDates = Object.keys(dailySales)
    .sort()
    .slice(-7);

  const salesLabels = salesDates.map(date => {
    const parts = date.split('-');

    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}`;
    }

    return date;
  });

  const salesValues = salesDates.map(
    date => dailySales[date]
  );

  // =========================
  // CHART DATA
  // =========================

  const productionChartData = {
    labels:
      productionLabels.length > 0
        ? productionLabels
        : ['No Data'],

    datasets: [
      {
        data:
          productionValues.length > 0
            ? productionValues
            : [0],
      },
    ],
  };

  const salesChartData = {
    labels:
      salesLabels.length > 0
        ? salesLabels
        : ['No Data'],

    datasets: [
      {
        data:
          salesValues.length > 0
            ? salesValues
            : [0],
      },
    ],
  };

  return (
    <ImageBackground
      source={{
        uri:
          'https://img.freepik.com/premium-photo/side-profile-chicken-against-pink-background-concept-animal-photography-still-life-pink-backgrounds_864588-56895.jpg',
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
              Reports & Analytics
            </Text>

            <Text style={styles.subtitle}>
              Egg production, sales and inventory overview
            </Text>

          </View>

          {/* =========================
              SUMMARY
          ========================= */}

          <Text style={styles.sectionTitle}>
            Summary
          </Text>

          <View style={styles.summaryGrid}>

            <View style={styles.summaryCard}>

              <Text style={styles.cardLabel}>
                Current Inventory
              </Text>

              <Text style={styles.cardValue}>
                {totalInventory}
              </Text>

              <Text style={styles.cardUnit}>
                eggs
              </Text>

            </View>

            <View style={styles.summaryCard}>

              <Text style={styles.cardLabel}>
                Eggs Produced
              </Text>

              <Text style={styles.cardValue}>
                {totalEggsProduced}
              </Text>

              <Text style={styles.cardUnit}>
                eggs
              </Text>

            </View>

            <View style={styles.summaryCard}>

              <Text style={styles.cardLabel}>
                Eggs Sold
              </Text>

              <Text style={styles.cardValue}>
                {totalEggsSold}
              </Text>

              <Text style={styles.cardUnit}>
                eggs
              </Text>

            </View>

            <View style={styles.summaryCard}>

              <Text style={styles.cardLabel}>
                Total Revenue
              </Text>

              <Text style={styles.revenueValue}>
                ₱{totalRevenue.toFixed(2)}
              </Text>

              <Text style={styles.cardUnit}>
                sales
              </Text>

            </View>

          </View>

          {/* =========================
              DAILY EGG HARVEST
          ========================= */}

          <Text style={styles.sectionTitle}>
            Daily Egg Harvest
          </Text>

          {productionDates.length === 0 ? (

            <View style={styles.emptyCard}>

              <Text style={styles.emptyText}>
                No production data available yet.
              </Text>

            </View>

          ) : (

            <View style={styles.chartCard}>

              <LineChart
                data={productionChartData}
                width={screenWidth - 40}
                height={240}
                fromZero
                bezier
                yAxisSuffix=""
                chartConfig={chartConfig}
                style={styles.chart}
              />

            </View>

          )}

          {/* =========================
              DAILY EGG SALES
          ========================= */}

          <Text style={styles.sectionTitle}>
            Daily Egg Sales
          </Text>

          {salesDates.length === 0 ? (

            <View style={styles.emptyCard}>

              <Text style={styles.emptyText}>
                No sales data available yet.
              </Text>

            </View>

          ) : (

            <View style={styles.chartCard}>

              <BarChart
                data={salesChartData}
                width={screenWidth - 40}
                height={240}
                fromZero
                yAxisSuffix=""
                chartConfig={chartConfig}
                showValuesOnTopOfBars
                style={styles.chart}
              />

            </View>

          )}

          {/* =========================
              PRODUCTION BY SIZE
          ========================= */}

          <Text style={styles.sectionTitle}>
            Production by Egg Size
          </Text>

          <View style={styles.dataCard}>

            <View style={styles.dataRow}>
              <Text style={styles.dataName}>
                Pullet
              </Text>

              <Text style={styles.dataValue}>
                {productionBySize.pullet} eggs
              </Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataName}>
                Small
              </Text>

              <Text style={styles.dataValue}>
                {productionBySize.small} eggs
              </Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataName}>
                Medium
              </Text>

              <Text style={styles.dataValue}>
                {productionBySize.medium} eggs
              </Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataName}>
                Large
              </Text>

              <Text style={styles.dataValue}>
                {productionBySize.large} eggs
              </Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataName}>
                X-Large
              </Text>

              <Text style={styles.dataValue}>
                {productionBySize.xlarge} eggs
              </Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataName}>
                Jumbo
              </Text>

              <Text style={styles.dataValue}>
                {productionBySize.jumbo} eggs
              </Text>
            </View>

          </View>

          {/* =========================
              CURRENT INVENTORY BY SIZE
          ========================= */}

          <Text style={styles.sectionTitle}>
            Current Inventory by Size
          </Text>

          <View style={styles.dataCard}>

            <View style={styles.dataRow}>
              <Text style={styles.dataName}>
                Pullet
              </Text>

              <Text style={styles.dataValue}>
                {inventory.pullet} eggs
              </Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataName}>
                Small
              </Text>

              <Text style={styles.dataValue}>
                {inventory.small} eggs
              </Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataName}>
                Medium
              </Text>

              <Text style={styles.dataValue}>
                {inventory.medium} eggs
              </Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataName}>
                Large
              </Text>

              <Text style={styles.dataValue}>
                {inventory.large} eggs
              </Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataName}>
                X-Large
              </Text>

              <Text style={styles.dataValue}>
                {inventory.xlarge} eggs
              </Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataName}>
                Jumbo
              </Text>

              <Text style={styles.dataValue}>
                {inventory.jumbo} eggs
              </Text>
            </View>

          </View>

          {/* BOTTOM SPACE */}

          <View style={styles.bottomSpace} />

        </ScrollView>

      </View>

    </ImageBackground>
  );
}

// =====================================================
// CHART CONFIGURATION
// =====================================================

const chartConfig = {
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',

  decimalPlaces: 0,

  color: (opacity = 1) =>
    `rgba(37, 99, 235, ${opacity})`,

  labelColor: (opacity = 1) =>
    `rgba(55, 65, 81, ${opacity})`,

  propsForDots: {
    r: '5',
    strokeWidth: '2',
  },

  propsForLabels: {
    fontSize: 11,
  },
};

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
  },

  overlay: {
    flex: 1,
    backgroundColor:
      'rgba(245, 247, 250, 0.35)',
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
    backgroundColor:
      'rgba(255, 255, 255, 0.90)',

    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,

    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',

    elevation: 2,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
  },

  // =========================
  // SECTION
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

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
  },

  summaryCard: {
    width: '46%',

    backgroundColor:
      'rgba(255, 255, 255, 0.93)',

    marginHorizontal: '2%',
    marginBottom: 12,

    padding: 16,

    borderRadius: 14,

    elevation: 3,

    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 5,

    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  cardLabel: {
    fontSize: 13,
    color: '#6B7280',
  },

  cardValue: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 6,
  },

  revenueValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16A34A',
    marginTop: 9,
  },

  cardUnit: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 3,
  },

  // =========================
  // CHART
  // =========================

  chartCard: {
    backgroundColor:
      'rgba(255, 255, 255, 0.95)',

    marginHorizontal: 20,

    padding: 10,

    borderRadius: 14,

    elevation: 3,

    overflow: 'hidden',
  },

  chart: {
    borderRadius: 10,
  },

  // =========================
  // EMPTY
  // =========================

  emptyCard: {
    backgroundColor:
      'rgba(255, 255, 255, 0.93)',

    marginHorizontal: 20,

    padding: 20,

    borderRadius: 14,

    elevation: 2,
  },

  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
  },

  // =========================
  // DATA CARD
  // =========================

  dataCard: {
    backgroundColor:
      'rgba(255, 255, 255, 0.93)',

    marginHorizontal: 20,

    paddingHorizontal: 15,

    borderRadius: 14,

    elevation: 3,
  },

  dataRow: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    paddingVertical: 14,

    borderBottomWidth: 1,

    borderBottomColor: '#E5E7EB',
  },

  dataName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },

  dataValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2563EB',
  },

  // =========================
  // BOTTOM SPACE
  // =========================

  bottomSpace: {
    height: 40,
  },

});