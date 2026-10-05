import React, { useContext } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth';
import { EggContext } from '../EggContext';
import { useThemedStyles } from '../ThemeContext';
import { auth } from '../../firebaseConfig';

const MENU_ITEMS = [
  { route: 'Ledger', title: 'Ledger', description: 'Browse production and sales records', mark: '01' },
  { route: 'Reports', title: 'Reports & Analytics', description: 'Compare daily and monthly activity', mark: '02' },
];

export default function MoreScreen({ navigation }) {
  const { role } = useContext(EggContext);
  const styles = useThemedStyles(baseStyles);
  const items = role === 'owner'
    ? [...MENU_ITEMS, { route: 'Settings', title: 'Settings', description: 'Manage low-stock thresholds', mark: '03' }]
    : MENU_ITEMS;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log('Logout error:', error);
      Alert.alert('Logout failed', 'Unable to sign out right now. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>YOUR WORKSPACE</Text>
      <Text style={styles.title}>More tools</Text>
      <Text style={styles.subtitle}>Records, insights, and account options.</Text>

      {items.map(item => (
        <TouchableOpacity
          key={item.route}
          style={styles.menuCard}
          onPress={() => navigation.navigate(item.route)}
          accessibilityRole="button"
          accessibilityLabel={`Open ${item.title}`}
        >
          <View style={styles.mark}><Text style={styles.markText}>{item.mark}</Text></View>
          <View style={styles.menuCopy}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuDescription}>{item.description}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} accessibilityRole="button">
        <Text style={styles.logoutText}>Sign out</Text>
      </TouchableOpacity>

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>EggTrack</Text>
        <Text style={styles.noteText}>Production, inventory, and sales in one place.</Text>
      </View>
    </ScrollView>
  );
}

const baseStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  content: { padding: 20, paddingBottom: 32 },
  eyebrow: { color: '#6B7280', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginTop: 12 },
  title: { color: '#111827', fontSize: 30, fontWeight: '800', marginTop: 7 },
  subtitle: { color: '#6B7280', fontSize: 15, marginTop: 5, marginBottom: 24 },
  menuCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 11 },
  mark: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' },
  markText: { color: '#6B7280', fontSize: 12, fontWeight: '800' },
  menuCopy: { flex: 1, marginLeft: 13 },
  menuTitle: { color: '#111827', fontSize: 16, fontWeight: '700' },
  menuDescription: { color: '#6B7280', fontSize: 13, marginTop: 4 },
  arrow: { color: '#9CA3AF', fontSize: 26, marginLeft: 10 },
  noteCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderColor: '#E5E7EB', borderWidth: 1, padding: 18, marginTop: 16 },
  noteTitle: { color: '#111827', fontSize: 15, fontWeight: '700' },
  noteText: { color: '#6B7280', fontSize: 13, lineHeight: 19, marginTop: 5 },
  logoutButton: { alignItems: 'center', paddingVertical: 15, marginTop: 8 },
  logoutText: { color: '#C84D4D', fontSize: 14, fontWeight: '700' },
});
