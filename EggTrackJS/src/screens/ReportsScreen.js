import React, { useContext, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { EggContext } from '../EggContext';
import { useTheme, useThemedStyles } from '../ThemeContext';

const EGG_SIZES = [
  ['pullet', 'Pullet'],
  ['small', 'Small'],
  ['medium', 'Medium'],
  ['large', 'Large'],
  ['xlarge', 'X-Large'],
  ['jumbo', 'Jumbo'],
];

function summarizeByPeriod(records, period) {
  const totals = {};
  records.forEach(record => {
    if (typeof record.date !== 'string') return;
    const key = period === 'monthly' ? record.date.slice(0, 7) : record.date.slice(0, 10);
    if (!/^\d{4}-\d{2}(-\d{2})?$/.test(key)) return;
    totals[key] = (totals[key] || 0) + Number(record.totalEggs || 0);
  });

  const keys = Object.keys(totals).sort().slice(period === 'monthly' ? -12 : -14);
  return {
    labels: keys.map(key => {
      const [year, month, day] = key.split('-');
      if (period === 'daily') return `${month}/${day}`;
      return new Date(Number(year), Number(month) - 1, 1)
        .toLocaleDateString(undefined, { month: 'short' }) + ` '${year.slice(-2)}`;
    }),
    values: keys.map(key => totals[key]),
  };
}

function PeriodPicker({ value, onChange, styles }) {
  return (
    <View style={styles.periodPicker}>
      {['daily', 'monthly'].map(period => (
        <Text
          key={period}
          accessibilityRole="button"
          onPress={() => onChange(period)}
          style={[styles.periodOption, value === period && styles.periodOptionActive]}
        >
          {period === 'daily' ? 'Daily' : 'Monthly'}
        </Text>
      ))}
    </View>
  );
}

export default function ReportsScreen() {
  const { productions, sales, inventory } = useContext(EggContext);
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(baseStyles);
  const { width } = useWindowDimensions();
  const [productionPeriod, setProductionPeriod] = useState('daily');
  const [salesPeriod, setSalesPeriod] = useState('daily');

  const inventoryTotal = useMemo(
    () => EGG_SIZES.reduce((sum, [key]) => sum + Number(inventory[key] || 0), 0),
    [inventory]
  );
  const totalEggsProduced = useMemo(
    () => productions.reduce((sum, record) => sum + Number(record.totalEggs || 0), 0),
    [productions]
  );
  const totalEggsSold = useMemo(
    () => sales.reduce((sum, record) => sum + Number(record.totalEggs || 0), 0),
    [sales]
  );
  const totalRevenue = useMemo(
    () => sales.reduce((sum, record) => sum + Number(record.totalAmount || 0), 0),
    [sales]
  );

  const productionBySize = useMemo(
    () => Object.fromEntries(EGG_SIZES.map(([key]) => [
      key,
      productions.reduce((sum, record) => sum + Number(record[key] || 0), 0),
    ])),
    [productions]
  );
  const productionSummary = useMemo(
    () => summarizeByPeriod(productions, productionPeriod),
    [productions, productionPeriod]
  );
  const salesSummary = useMemo(
    () => summarizeByPeriod(sales, salesPeriod),
    [sales, salesPeriod]
  );
  const chartWidth = Math.max(280, width - 68);
  const chartColor = isDark ? 'rgba(139, 211, 165, 1)' : 'rgba(45, 106, 79, 1)';
  const chartConfig = useMemo(() => ({
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: opacity => chartColor.replace(', 1)', `, ${opacity})`),
    labelColor: opacity => isDark
      ? `rgba(169, 184, 172, ${opacity})`
      : `rgba(102, 117, 106, ${opacity})`,
    propsForBackgroundLines: { stroke: colors.chartGrid, strokeDasharray: '4 5' },
    propsForDots: { r: '3', strokeWidth: '2', stroke: colors.surface },
  }), [chartColor, colors.chartGrid, colors.surface, isDark]);

  const summaryItems = useMemo(() => [
    { label: 'IN INVENTORY', value: inventoryTotal.toLocaleString(), unit: 'eggs' },
    { label: 'HARVESTED', value: totalEggsProduced.toLocaleString(), unit: 'eggs' },
    { label: 'SOLD', value: totalEggsSold.toLocaleString(), unit: 'eggs' },
    { label: 'REVENUE', value: `₱${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, unit: 'total sales' },
  ], [inventoryTotal, totalEggsProduced, totalEggsSold, totalRevenue]);

  const renderChart = (title, caption, summary, period, setPeriod, emptyText) => (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <View style={styles.chartTitleGroup}>
          <Text style={styles.chartTitle}>{title}</Text>
          <Text style={styles.chartCaption}>{caption}</Text>
        </View>
        <PeriodPicker value={period} onChange={setPeriod} styles={styles} />
      </View>
      {summary.values.length === 0 ? (
        <View style={styles.emptyChart}><Text style={styles.emptyText}>{emptyText}</Text></View>
      ) : (
        <LineChart
          data={{ labels: summary.labels, datasets: [{ data: summary.values, color: () => chartColor }] }}
          width={chartWidth}
          height={230}
          chartConfig={chartConfig}
          bezier
          fromZero
          withShadow={false}
          withInnerLines
          withOuterLines={false}
          withVerticalLines={false}
          withDots
          yAxisInterval={1}
          style={styles.chart}
        />
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>YOUR BUSINESS AT A GLANCE</Text>
      <Text style={styles.title}>Reports & analytics</Text>
      <Text style={styles.subtitle}>Track egg movement over time.</Text>

      <View style={styles.summaryGrid}>
        {summaryItems.map(item => (
          <View key={item.label} style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{item.label}</Text>
            <Text style={styles.summaryValue} numberOfLines={1} adjustsFontSizeToFit>{item.value}</Text>
            <Text style={styles.summaryUnit}>{item.unit}</Text>
          </View>
        ))}
      </View>

      {renderChart('Egg harvest', 'Eggs collected', productionSummary, productionPeriod, setProductionPeriod, 'No harvest data for this period yet.')}
      {renderChart('Egg sales', 'Eggs sold', salesSummary, salesPeriod, setSalesPeriod, 'No sales data for this period yet.')}

      <Text style={styles.sectionTitle}>Harvest by egg size</Text>
      <View style={styles.sizeCard}>
        {EGG_SIZES.map(([key, label], index) => (
          <View key={key} style={[styles.sizeRow, index === EGG_SIZES.length - 1 && styles.lastSizeRow]}>
            <Text style={styles.sizeName}>{label}</Text>
            <Text style={styles.sizeValue}>{Number(productionBySize[key] || 0).toLocaleString()} eggs</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Current stock by size</Text>
      <View style={styles.sizeCard}>
        {EGG_SIZES.map(([key, label], index) => (
          <View key={key} style={[styles.sizeRow, index === EGG_SIZES.length - 1 && styles.lastSizeRow]}>
            <Text style={styles.sizeName}>{label}</Text>
            <Text style={styles.sizeValue}>{Number(inventory[key] || 0).toLocaleString()} eggs</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const baseStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  content: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 32 },
  eyebrow: { color: '#6B7280', fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  title: { color: '#111827', fontSize: 27, fontWeight: '800', marginTop: 5 },
  subtitle: { color: '#6B7280', fontSize: 14, marginTop: 5, marginBottom: 18 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5, marginBottom: 8 },
  summaryCard: { width: '48%', flexGrow: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 15, padding: 14, margin: 4 },
  summaryLabel: { color: '#6B7280', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  summaryValue: { color: '#111827', fontSize: 22, fontWeight: '800', marginTop: 7 },
  summaryUnit: { color: '#9CA3AF', fontSize: 11, marginTop: 2 },
  chartCard: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderWidth: 1, borderRadius: 17, padding: 12, marginBottom: 13, overflow: 'hidden' },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  chartTitleGroup: { flexShrink: 1, marginRight: 7 },
  chartTitle: { color: '#111827', fontSize: 17, fontWeight: '800' },
  chartCaption: { color: '#6B7280', fontSize: 12, marginTop: 3 },
  periodPicker: { flexDirection: 'row', padding: 3, borderRadius: 9, backgroundColor: '#F9FAFB' },
  periodOption: { color: '#6B7280', fontSize: 11, fontWeight: '700', paddingHorizontal: 9, paddingVertical: 7, borderRadius: 7, overflow: 'hidden' },
  periodOptionActive: { color: '#FFFFFF', backgroundColor: '#111827' },
  chart: { borderRadius: 12, marginLeft: -9 },
  emptyChart: { height: 180, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#6B7280', fontSize: 13, textAlign: 'center' },
  sectionTitle: { color: '#111827', fontSize: 18, fontWeight: '800', marginTop: 12, marginBottom: 9 },
  sizeCard: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, marginBottom: 8 },
  sizeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  lastSizeRow: { borderBottomWidth: 0 },
  sizeName: { color: '#536258', fontSize: 14 },
  sizeValue: { color: '#111827', fontSize: 14, fontWeight: '700' },
});
