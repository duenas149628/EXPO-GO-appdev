import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useThemedStyles } from '../ThemeContext';
import { initializeBusinessWorkspace } from '../utils/businessSetup';

export default function BusinessSetupScreen() {
  const styles = useThemedStyles(baseStyles);
  const [businessName, setBusinessName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [setupError, setSetupError] = useState('');

  const finishSetup = async () => {
    if (!businessName.trim()) {
      setSetupError('Enter your business name to continue.');
      return;
    }
    setIsSaving(true);
    setSetupError('');
    try {
      await initializeBusinessWorkspace(auth.currentUser, businessName);
    } catch (error) {
      console.log('Business setup failed:', error);
      const errorCode = error?.code ? ` (${error.code})` : '';
      setSetupError(`${error?.message || 'Check your connection and try again.'}${errorCode}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set up your business</Text>
      <Text style={styles.description}>This will link your Owner account and securely bring your existing test records into the business workspace.</Text>
      <TextInput
        style={styles.input}
        value={businessName}
        onChangeText={value => {
          setBusinessName(value);
          if (setupError) setSetupError('');
        }}
        placeholder="Business name"
        autoCapitalize="words"
        editable={!isSaving}
      />
      {!!setupError && <Text style={styles.errorText}>{setupError}</Text>}
      <TouchableOpacity style={styles.button} onPress={finishSetup} disabled={isSaving}>
        {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Finish setup</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.signOutButton} onPress={() => signOut(auth)} disabled={isSaving}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const baseStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F5F7FA' },
  title: { color: '#111827', fontSize: 26, fontWeight: '800', marginBottom: 10 },
  description: { color: '#6B7280', fontSize: 15, lineHeight: 22, marginBottom: 20 },
  input: { color: '#111827', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, padding: 14, marginBottom: 12 },
  button: { backgroundColor: '#111827', padding: 15, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  signOutButton: { alignItems: 'center', padding: 16 },
  signOutText: { color: '#536258', fontWeight: '700' },
  errorText: { color: '#B43C3C', fontSize: 14, lineHeight: 20, marginBottom: 12 },
});
