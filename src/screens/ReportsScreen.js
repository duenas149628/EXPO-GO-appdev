import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
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

  const totalInventory =
    inventory.pullet +
    inventory.small +
    inventory.medium +
    inventory.large +
    inventory.xlarge +
    inventory.jumbo;

  const totalEggsProduced = productions.reduce(
    (total, production) => total + production.totalEggs,
    0
  );

  const totalEggsSold = sales.reduce(
    (total, sale) => total + sale.totalEggs,
    0
  );

  const totalRevenue = sales.reduce(
    (total, sale) => total + sale.totalAmount,
    0
  );

  const productionBySize = {
    pullet: productions.reduce(
      (total, production) => total + production.pullet,
      0
    ),

    small: productions.reduce(
      (total, production) => total + production.small,
      0
    ),

    medium: productions.reduce(
      (total, production) => total + production.medium,
      0
    ),

    large: productions.reduce(
      (total, production) => total + production.large,
      0
    ),

    xlarge: productions.reduce(
      (total, production) => total + production.xlarge,
      0
    ),

    jumbo: productions.reduce(
      (total, production) => total + production.jumbo,
      0
    ),
  };

  /*
   * ==========================================
   * DAILY PRODUCTION
   * ==========================================
   *
   * Combine every production record that has
   * the same date.
   *
   * This means:
   *
   * Sep 27 - 100 eggs
   * Sep 27 - 80 eggs
   * Sep 27 - 65 eggs
   *
   * becomes:
   *
   * Sep 27 - 245 eggs
   */

  const dailyProduction = {};

  productions.forEach((production) => {
    if (!dailyProduction[production.date]) {
      dailyProduction[production.date] = 0;
    }

    dailyProduction[production.date] += production.totalEggs;
  });

  const productionDates = Object.keys(dailyProduction)
    .sort()
    .slice(-7);

  const productionLabels = productionDates.map(
    (date) => {
      const parts = date.split('-');

      return `${parts[1]}/${parts[2]}`;
    }
  );

  const productionValues = productionDates.map(
    (date) => dailyProduction[date]
  );

  /*
   * ==========================================
   * DAILY SALES
   * ==========================================
   *
   * Combine all sales made on the same date.
   */

  const dailySales = {};

  sales.forEach((sale) => {
    if (!dailySales[sale.date]) {
      dailySales[sale.date] = 0;
    }

    dailySales[sale.date] += sale.totalEggs;
  });

  const salesDates = Object.keys(dailySales)
    .sort()
    .slice(-7);

  const salesLabels = salesDates.map(
    (date) => {
      const parts = date.split('-');

      return `${parts[1]}/${parts[2]}`;
    }
  );

  const salesValues = salesDates.map(
    (date) => dailySales[date]
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Reports & Analytics
      </Text>

      {/* SUMMARY */}

      <Text style={styles.sectionTitle}>
        Summary
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          Current Inventory
        </Text>

        <Text style={styles.value}>
          {totalInventory} eggs
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Total Eggs Produced
        </Text>

        <Text style={styles.value}>
          {totalEggsProduced} eggs
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Total Eggs Sold
        </Text>

        <Text style={styles.value}>
          {totalEggsSold} eggs
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Total Revenue
        </Text>

        <Text style={styles.value}>
          ₱{totalRevenue.toFixed(2)}
        </Text>
      </View>

      {/* DAILY EGG HARVEST */}

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
            data={{
              labels: productionLabels,
              datasets: [
                {
                  data: productionValues,
                },
              ],
            }}
            width={screenWidth - 32}
            height={240}
            yAxisSuffix=""
            chartConfig={chartConfig}
            bezier
            fromZero
            style={styles.chart}
          />
        </View>
      )}

      {/* DAILY EGG SALES */}

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
            data={{
              labels: salesLabels,
              datasets: [
                {
                  data: salesValues,
                },
              ],
            }}
            width={screenWidth - 32}
            height={240}
            yAxisSuffix=""
            chartConfig={chartConfig}
            fromZero
            showValuesOnTopOfBars
            style={styles.chart}
          />
        </View>
      )}

      {/* PRODUCTION BY SIZE */}

      <Text style={styles.sectionTitle}>
        Production by Egg Size
      </Text>

      <View style={styles.card}>
        <Text style={styles.item}>
          Pullet: {productionBySize.pullet}
        </Text>

        <Text style={styles.item}>
          Small: {productionBySize.small}
        </Text>

        <Text style={styles.item}>
          Medium: {productionBySize.medium}
        </Text>

        <Text style={styles.item}>
          Large: {productionBySize.large}
        </Text>

        <Text style={styles.item}>
          X-Large: {productionBySize.xlarge}
        </Text>

        <Text style={styles.item}>
          Jumbo: {productionBySize.jumbo}
        </Text>
      </View>

      {/* CURRENT INVENTORY BY SIZE */}

      <Text style={styles.sectionTitle}>
        Current Inventory by Size
      </Text>

      <View style={styles.card}>
        <Text style={styles.item}>
          Pullet: {inventory.pullet}
        </Text>

        <Text style={styles.item}>
          Small: {inventory.small}
        </Text>

        <Text style={styles.item}>
          Medium: {inventory.medium}
        </Text>

        <Text style={styles.item}>
          Large: {inventory.large}
        </Text>

        <Text style={styles.item}>
          X-Large: {inventory.xlarge}
        </Text>

        <Text style={styles.item}>
          Jumbo: {inventory.jumbo}
        </Text>
      </View>
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  decimalPlaces: 0,

  color: (opacity = 1) =>
    `rgba(0, 0, 0, ${opacity})`,

  labelColor: (opacity = 1) =>
    `rgba(0, 0, 0, ${opacity})`,

  propsForDots: {
    r: '5',
    strokeWidth: '2',
  },
};

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

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 10,
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },

  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    marginBottom: 10,
    elevation: 2,
    overflow: 'hidden',
  },

  chart: {
    borderRadius: 10,
  },

  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },

  value: {
    fontSize: 23,
    fontWeight: 'bold',
  },

  item: {
    fontSize: 16,
    marginBottom: 8,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 10,
  },

  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
  },
});