import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

import { auth, db } from './firebaseConfig';
import EggProvider, { EggContext } from './src/EggContext';
import { ThemeProvider, useTheme, useThemedStyles } from './src/ThemeContext';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProductionScreen from './src/screens/ProductionScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import SalesScreen from './src/screens/SalesScreen';
import LedgerScreen from './src/screens/LedgerScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import MoreScreen from './src/screens/MoreScreen';
import BusinessSetupScreen from './src/screens/BusinessSetupScreen';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();
const MoreStack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [businessId, setBusinessId] = useState(null);
  const [accountDisabled, setAccountDisabled] = useState(false);
  const [businessReady, setBusinessReady] = useState(false);
  const [isBusinessLoading, setIsBusinessLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const authCheckId = useRef(0);
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(accessStyles);

  useEffect(() => {
    let unsubscribeProfile;
    let unsubscribeBusiness;
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      const checkId = ++authCheckId.current;
      unsubscribeProfile?.();
      unsubscribeBusiness?.();
      unsubscribeProfile = null;
      unsubscribeBusiness = null;
      setUser(currentUser);
      setRole(null);
      setBusinessId(null);
      setAccountDisabled(false);
      setBusinessReady(false);
      setIsBusinessLoading(false);
      setIsAuthLoading(true);

      if (currentUser) {
        unsubscribeProfile = onSnapshot(doc(db, 'users', currentUser.uid), userSnapshot => {
          if (checkId !== authCheckId.current) return;
          const profile = userSnapshot.exists() ? userSnapshot.data() : null;
          const normalizedRole = typeof profile?.role === 'string'
            ? profile.role.trim().toLowerCase()
            : null;
          setRole(normalizedRole);
          setBusinessId(profile?.businessId || null);
          setAccountDisabled(profile?.disabled === true);
          setIsAuthLoading(false);
          unsubscribeBusiness?.();
          unsubscribeBusiness = null;
          if (profile?.businessId) {
            setIsBusinessLoading(true);
            unsubscribeBusiness = onSnapshot(doc(db, 'businesses', profile.businessId), businessSnapshot => {
              if (checkId !== authCheckId.current) return;
              setBusinessReady(businessSnapshot.exists() && businessSnapshot.data().status === 'active');
              setIsBusinessLoading(false);
            }, error => {
              console.log('Error loading business:', error);
              setBusinessReady(false);
              setIsBusinessLoading(false);
            });
          }
        }, error => {
          if (checkId !== authCheckId.current) return;
          console.log('Error loading user profile:', error);
          setIsAuthLoading(false);
        });
      } else {
        setIsAuthLoading(false);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeProfile?.();
      unsubscribeBusiness?.();
    };
  }, []);

  if (isAuthLoading) {
    return <View style={styles.loading}><StatusBar style={isDark ? 'light' : 'dark'} /></View>;
  }

  if (user && businessId && isBusinessLoading) {
    return <View style={styles.loading}><StatusBar style={isDark ? 'light' : 'dark'} /></View>;
  }

  if (user && (role === 'owner' || !role) && !businessReady) {
    return <><StatusBar style={isDark ? 'light' : 'dark'} /><BusinessSetupScreen /></>;
  }

  if (user && (accountDisabled || !['owner', 'staff'].includes(role) || !businessId || !businessReady)) {
    return (
      <View style={styles.accessError}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Text style={styles.accessTitle}>{accountDisabled ? 'Staff account disabled' : 'Account access is not configured'}</Text>
        <Text style={styles.accessMessage}>
          {accountDisabled
            ? 'The business owner has disabled this staff account. Contact the owner if you need access restored.'
            : `EggTrack could not verify this account's business access. Role: ${role || 'missing'}; business link: ${businessId ? 'present' : 'missing'}; workspace: ${businessReady ? 'ready' : 'not ready'}. Sign in with the Owner account to finish setup, or ask the Owner to create/link this Staff account.`}
        </Text>
        <TouchableOpacity style={styles.accessButton} onPress={() => signOut(auth)}>
          <Text style={styles.accessButtonText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.accent,
    },
  };

  return (
    <EggProvider user={user} role={role} businessId={businessId}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer theme={navigationTheme}>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {!user ? (
            <RootStack.Screen name="Login" component={LoginScreen} />
          ) : (
            <RootStack.Screen name="App" component={AuthenticatedTabs} />
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </EggProvider>
  );
}

function AuthenticatedTabs() {
  const { colors } = useTheme();
  const { role } = useContext(EggContext);

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text, fontWeight: '700', fontSize: 18 },
        headerTitle: () => <HeaderBrand />,
        headerTitleAlign: 'left',
        headerRight: () => <HeaderActions role={role} />,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 72,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarItemStyle: { flex: 1, alignItems: 'center', justifyContent: 'center' },
        tabBarIconStyle: { marginTop: 1 },
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: 1 },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Overview', tabBarLabel: 'Home', tabBarIcon: props => <TabIcon {...props} name="Dashboard" /> }} />
      <Tab.Screen name="Production" component={ProductionScreen} options={{ title: 'Production', tabBarIcon: props => <TabIcon {...props} name="Production" /> }} />
      <Tab.Screen name="Inventory" component={InventoryScreen} options={{ title: 'Inventory', tabBarIcon: props => <TabIcon {...props} name="Inventory" /> }} />
      <Tab.Screen name="Sales" component={SalesScreen} options={{ title: 'Sales', tabBarIcon: props => <TabIcon {...props} name="Sales" /> }} />
      <Tab.Screen
        name="More"
        component={MoreStackNavigator}
        options={{
          title: 'More',
          headerShown: false,
          tabBarLabel: 'More',
          tabBarIcon: props => <TabIcon {...props} name="More" />,
        }}
      />
    </Tab.Navigator>
  );
}

function MoreStackNavigator() {
  const { colors } = useTheme();
  const { role } = useContext(EggContext);

  return (
    <MoreStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text, fontWeight: '700', fontSize: 18 },
        headerTitle: () => <HeaderBrand />,
        headerTitleAlign: 'left',
        headerRight: () => <HeaderActions role={role} />,
      }}
    >
      <MoreStack.Screen name="MoreHome" component={MoreScreen} options={{ title: 'More tools' }} />
      <MoreStack.Screen name="Ledger" component={LedgerScreen} options={{ title: 'Ledger' }} />
      <MoreStack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports & Analytics' }} />
      {role === 'owner' && <MoreStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />}
      {role === 'owner' && <MoreStack.Screen name="EggThresholds" component={SettingsScreen} options={{ title: 'Egg Size Thresholds' }} />}
      {role === 'owner' && <MoreStack.Screen name="SalePriceReferences" component={SettingsScreen} options={{ title: 'Sale Price References' }} />}
      {role === 'owner' && <MoreStack.Screen name="StaffAccounts" component={SettingsScreen} options={{ title: 'Staff Accounts' }} />}
    </MoreStack.Navigator>
  );
}

function TabIcon({ name, color, focused }) {
  const common = { fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const icon = {
    Dashboard: <><Path {...common} d="m3 10 9-7 9 7" /><Path {...common} d="M5 9v11h14V9M9 20v-7h6v7" /></>,
    Production: <><Path {...common} d="M12 3c-3.5 4-6 6.8-6 10a6 6 0 0 0 12 0c0-3.2-2.5-6-6-10Z" /><Path {...common} d="M9 14c.3 1.5 1.2 2.3 2.5 2.7" /></>,
    Inventory: <><Path {...common} d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><Path {...common} d="m4.5 7.7 7.5 4.4 7.5-4.4M12 12v8.5" /></>,
    Sales: <><Rect {...common} x="4" y="5" width="16" height="15" rx="2" /><Path {...common} d="M8 3v4m8-4v4M4 10h16M8 14h3m2 0h3m-8 3h3" /></>,
    More: <><Circle {...common} cx="5" cy="12" r="1" /><Circle {...common} cx="12" cy="12" r="1" /><Circle {...common} cx="19" cy="12" r="1" /></>,
  }[name];

  return (
    <View style={[tabIconStyles.wrap, focused && { backgroundColor: `${color}18` }]}>
      <Svg width={21} height={21} viewBox="0 0 24 24" accessibilityLabel={`${name} icon`}>
        {icon}
      </Svg>
    </View>
  );
}

const tabIconStyles = StyleSheet.create({
  wrap: { width: 34, height: 27, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});

function HeaderBrand() {
  const { colors } = useTheme();

  return (
    <View style={headerStyles.brand} accessibilityLabel="EggTrack">
      <Svg width={28} height={30} viewBox="0 0 28 30" accessible={false}>
        <Path
          d="M14 2.5c4.5 0 8.5 9.5 8.5 16.1a8.5 8.5 0 0 1-17 0C5.5 12 9.5 2.5 14 2.5Z"
          fill="none"
          stroke={colors.text}
          strokeWidth="1.6"
        />
        <Path d="M10 17.5c1 1 2.2 1.5 4 1.5" fill="none" stroke={colors.primary} strokeWidth="1.6" strokeLinecap="round" />
      </Svg>
      <Text style={[headerStyles.brandText, { color: colors.text }]}>EggTrack</Text>
    </View>
  );
}

function HeaderActions({ role }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const roleIsOwner = role === 'owner';

  return (
    <View style={headerStyles.actions}>
      <View style={[headerStyles.badge, { backgroundColor: roleIsOwner ? colors.primarySoft : `${colors.accent}22` }]}>
        <Text style={[headerStyles.badgeText, { color: roleIsOwner ? colors.primary : colors.accent }]}>
          {roleIsOwner ? 'OWNER' : 'STAFF'}
        </Text>
      </View>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        onPress={toggleTheme}
        style={[headerStyles.themeButton, { backgroundColor: colors.input, borderColor: colors.border }]}
      >
        <Svg width={18} height={18} viewBox="0 0 24 24" accessible={false}>
          {isDark ? (
            <>
              <Circle cx="12" cy="12" r="4" fill="none" stroke={colors.text} strokeWidth="1.8" />
              <Path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" fill="none" stroke={colors.text} strokeWidth="1.8" strokeLinecap="round" />
            </>
          ) : (
            <Path d="M20.5 15.6A8.5 8.5 0 0 1 8.4 3.5 8.6 8.6 0 1 0 20.5 15.6Z" fill="none" stroke={colors.text} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </Svg>
      </TouchableOpacity>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: { fontSize: 19, fontWeight: '700', letterSpacing: 0.1 },
  actions: { flexDirection: 'row', alignItems: 'center', marginRight: 14, gap: 9 },
  badge: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  themeButton: { width: 34, height: 34, borderWidth: 1, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});

const accessStyles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#F5F7FA' },
  accessError: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F5F7FA' },
  accessTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#111827' },
  accessMessage: { fontSize: 16, color: '#4B5563', lineHeight: 23, marginBottom: 20 },
  accessButton: { backgroundColor: '#111827', borderRadius: 10, alignItems: 'center', padding: 14 },
  accessButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
});
