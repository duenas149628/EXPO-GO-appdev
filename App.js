import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import EggProvider from './src/EggContext';

import DashboardScreen from './src/screens/DashboardScreen';
import ProductionScreen from './src/screens/ProductionScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import SalesScreen from './src/screens/SalesScreen';
import LedgerScreen from './src/screens/LedgerScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <EggProvider>
      <NavigationContainer>
        <Stack.Navigator>

          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
          />

          <Stack.Screen
            name="Production"
            component={ProductionScreen}
          />

          <Stack.Screen
            name="Inventory"
            component={InventoryScreen}
          />

          <Stack.Screen
            name="Sales"
            component={SalesScreen}
          />

          <Stack.Screen
            name="Ledger"
            component={LedgerScreen}
          />

          <Stack.Screen
            name="Reports"
            component={ReportsScreen}
          />

          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </EggProvider>
  );
}