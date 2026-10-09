import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useTheme, useThemedStyles } from '../ThemeContext';

export default function LoginScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useThemedStyles(baseStyles);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(
        'Missing Information',
        'Please enter your email and password.'
      );
      return;
    }

    try {
      setIsLoading(true);

      if (isCreatingAccount) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }

    } catch (error) {
      console.log('Login error:', error);

      Alert.alert(
        isCreatingAccount ? 'Account Setup Failed' : 'Login Failed',
        error?.message || 'Incorrect email or password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.themeRow}>
        <Text style={styles.brandMark}>EGGTRACK</Text>
        <TouchableOpacity style={styles.themeButton} onPress={toggleTheme} accessibilityLabel="Toggle light or dark mode">
          <Text style={styles.themeButtonText}>{isDark ? 'Light mode' : 'Dark mode'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.intro}>
        <Text style={styles.title}>A clearer view of your flock.</Text>
        <Text style={styles.subtitle}>Production, inventory, and sales—together.</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>{isCreatingAccount ? 'Create a business account' : 'Welcome back'}</Text>
        <Text style={styles.formSubtitle}>{isCreatingAccount ? 'Set up your business and Owner login.' : 'Sign in to your EggTrack workspace.'}</Text>
        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View style={styles.passwordRow}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor={colors.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(value => !value)} accessibilityRole="button" accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
            <Text style={styles.passwordToggle}>{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{isCreatingAccount ? 'Create Owner account' : 'Sign in'}</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsCreatingAccount(value => !value)} disabled={isLoading} style={styles.switchMode}>
          <Text style={styles.switchModeText}>{isCreatingAccount ? 'Already have an account? Sign in' : 'New business? Create an account'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 22,
    backgroundColor: '#F5F7FA',
  },
  themeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandMark: { color: '#6B7280', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  themeButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  themeButtonText: { color: '#536258', fontSize: 12, fontWeight: '700' },
  intro: { flex: 1, justifyContent: 'center', paddingBottom: 16 },
  title: {
    color: '#111827',
    fontSize: 35,
    lineHeight: 42,
    fontWeight: '800',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 9,
  },
  formCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20, padding: 20, marginBottom: 30 },
  formTitle: { color: '#111827', fontSize: 20, fontWeight: '800' },
  formSubtitle: { color: '#6B7280', fontSize: 13, marginTop: 4, marginBottom: 20 },
  input: {
    backgroundColor: '#FFFFFF',
    color: '#111827',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 11, borderWidth: 1, borderColor: '#E5E7EB', paddingRight: 14 },
  passwordInput: { flex: 1, color: '#111827', paddingHorizontal: 14, paddingVertical: 14 },
  passwordToggle: { color: '#536258', fontSize: 13, fontWeight: '700', paddingVertical: 10, paddingLeft: 8 },
  button: {
    backgroundColor: '#111827',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchMode: { paddingTop: 16, alignItems: 'center' },
  switchModeText: { color: '#536258', fontSize: 13, fontWeight: '700' },
});
