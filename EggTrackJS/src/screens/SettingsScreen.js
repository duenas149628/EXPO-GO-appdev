import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { createUserWithEmailAndPassword, deleteUser, signOut } from 'firebase/auth';
import { collection, doc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, db, staffProvisioningAuth } from '../../firebaseConfig';

import { EggContext } from '../EggContext';
import { useThemedStyles } from '../ThemeContext';

export default function SettingsScreen() {
  const styles = useThemedStyles(baseStyles);
  const {
    thresholds,
    updateThresholds,
    role,
    businessId,
  } = useContext(EggContext);

  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffAccounts, setStaffAccounts] = useState([]);
  const [isManagingStaff, setIsManagingStaff] = useState(false);

  const refreshStaff = useCallback(async () => {
    if (role !== 'owner') return;
    try {
      const staffQuery = query(
        collection(db, 'users'),
        where('businessId', '==', businessId),
        where('role', '==', 'staff')
      );
      const response = await getDocs(staffQuery);
      setStaffAccounts(response.docs.map(staffDoc => ({ uid: staffDoc.id, ...staffDoc.data() })));
    } catch (error) {
      console.log('Could not load staff accounts:', error);
    }
  }, [role, businessId]);

  useEffect(() => {
    if (role !== 'owner' || !businessId) return undefined;
    const staffQuery = query(
      collection(db, 'users'),
      where('businessId', '==', businessId),
      where('role', '==', 'staff')
    );
    return onSnapshot(staffQuery, snapshot => {
      setStaffAccounts(snapshot.docs.map(staffDoc => ({ uid: staffDoc.id, ...staffDoc.data() })));
    }, error => console.log('Could not load staff accounts:', error));
  }, [role, businessId]);

  const handleCreateStaff = async () => {
    if (!staffName.trim() || !staffEmail.trim() || staffPassword.length < 8) {
      Alert.alert('Missing information', 'Enter the staff member’s name, email, and a temporary password of at least 8 characters.');
      return;
    }
    setIsManagingStaff(true);
    let createdStaffUser = null;
    try {
      const credential = await createUserWithEmailAndPassword(
        staffProvisioningAuth,
        staffEmail.trim(),
        staffPassword
      );
      createdStaffUser = credential.user;
      await setDoc(doc(db, 'users', credential.user.uid), {
        uid: credential.user.uid,
        email: staffEmail.trim(),
        displayName: staffName.trim(),
        role: 'staff',
        businessId,
        disabled: false,
        createdAt: Date.now(),
      });
      setStaffName('');
      setStaffEmail('');
      setStaffPassword('');
      await refreshStaff();
      Alert.alert('Staff account created', 'Give the staff member their sign-in email and temporary password securely.');
    } catch (error) {
      if (createdStaffUser) {
        try { await deleteUser(createdStaffUser); } catch (cleanupError) {
          console.log('Could not remove incomplete staff login:', cleanupError);
        }
      }
      Alert.alert('Could not create account', error?.message || 'Please try again.');
    } finally {
      try {
        if (staffProvisioningAuth.currentUser) await signOut(staffProvisioningAuth);
      } catch (error) {
        console.log('Could not close temporary staff sign-in:', error);
      }
      setIsManagingStaff(false);
    }
  };

  const handleDisableStaff = uid => Alert.alert(
    'Disable staff account?',
    'This blocks access to the business in EggTrack. Their Firebase credentials remain active.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Disable', style: 'destructive', onPress: async () => {
        try {
          await updateDoc(doc(db, 'users', uid), { disabled: true });
          await refreshStaff();
        } catch (error) {
          Alert.alert('Could not disable account', error?.message || 'Please try again.');
        }
      } },
    ]
  );


  const [pullet, setPullet] = useState(
    String(thresholds.pullet)
  );

  const [small, setSmall] = useState(
    String(thresholds.small)
  );

  const [medium, setMedium] = useState(
    String(thresholds.medium)
  );

  const [large, setLarge] = useState(
    String(thresholds.large)
  );

  const [xlarge, setXlarge] = useState(
    String(thresholds.xlarge)
  );

  const [jumbo, setJumbo] = useState(
    String(thresholds.jumbo)
  );


  // =====================================================
  // SAVE THRESHOLDS
  // =====================================================

  const handleSave = async () => {
    const values = [
      pullet,
      small,
      medium,
      large,
      xlarge,
      jumbo,
    ];


    const hasInvalidValue =
      values.some(
        value =>
          value.trim() === '' ||
          Number(value) < 0 ||
          !Number.isInteger(
            Number(value)
          )
      );


    if (hasInvalidValue) {
      Alert.alert(
        'Invalid Threshold',
        'Please enter a whole number that is 0 or greater for every egg size.'
      );

      return;
    }


    const success =
      await updateThresholds({
        pullet: Number(pullet),
        small: Number(small),
        medium: Number(medium),
        large: Number(large),
        xlarge: Number(xlarge),
        jumbo: Number(jumbo),
      });


    if (success) {
      Alert.alert(
        'Settings Saved',
        'Low-stock thresholds have been updated.'
      );
    } else {
      Alert.alert(
        'Save Failed',
        'The thresholds could not be saved. Please try again.'
      );
    }
  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    try {
      await signOut(auth);

    } catch (error) {
      console.log(
        'Logout error:',
        error
      );

      Alert.alert(
        'Logout Failed',
        'Unable to log out. Please try again.'
      );
    }
  };


  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>

        <Text style={styles.title}>
          Settings
        </Text>

        <Text style={styles.description}>
          Configure the minimum inventory level for each egg size.
        </Text>


        <View style={styles.infoCard}>

          <Text style={styles.infoTitle}>
            Low-Stock Thresholds
          </Text>

          <Text style={styles.infoText}>
            The Dashboard will show a warning when an egg size reaches or falls below its configured threshold.
          </Text>

        </View>


        <Text style={styles.sectionTitle}>
          Egg Size Thresholds
        </Text>


        <Text style={styles.label}>
          Pullet
        </Text>

        <TextInput
          style={styles.input}
          value={pullet}
          onChangeText={setPullet}
          keyboardType="numeric"
          placeholder="Enter threshold"
        />


        <Text style={styles.label}>
          Small
        </Text>

        <TextInput
          style={styles.input}
          value={small}
          onChangeText={setSmall}
          keyboardType="numeric"
          placeholder="Enter threshold"
        />


        <Text style={styles.label}>
          Medium
        </Text>

        <TextInput
          style={styles.input}
          value={medium}
          onChangeText={setMedium}
          keyboardType="numeric"
          placeholder="Enter threshold"
        />


        <Text style={styles.label}>
          Large
        </Text>

        <TextInput
          style={styles.input}
          value={large}
          onChangeText={setLarge}
          keyboardType="numeric"
          placeholder="Enter threshold"
        />


        <Text style={styles.label}>
          X-Large
        </Text>

        <TextInput
          style={styles.input}
          value={xlarge}
          onChangeText={setXlarge}
          keyboardType="numeric"
          placeholder="Enter threshold"
        />


        <Text style={styles.label}>
          Jumbo
        </Text>

        <TextInput
          style={styles.input}
          value={jumbo}
          onChangeText={setJumbo}
          keyboardType="numeric"
          placeholder="Enter threshold"
        />


        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            Save Thresholds
          </Text>
        </TouchableOpacity>

        {role === 'owner' && (
          <View style={styles.staffSection}>
            <Text style={styles.sectionTitle}>Staff accounts</Text>
            <Text style={styles.description}>Create individual sign-ins for people in this business. Staff accounts are linked to this workspace automatically.</Text>
            <TextInput style={styles.input} value={staffName} onChangeText={setStaffName} placeholder="Staff member name" placeholderTextColor="#738078" />
            <TextInput style={styles.input} value={staffEmail} onChangeText={setStaffEmail} placeholder="Staff email" placeholderTextColor="#738078" keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} value={staffPassword} onChangeText={setStaffPassword} placeholder="Temporary password (8+ characters)" placeholderTextColor="#738078" secureTextEntry />
            <TouchableOpacity style={styles.saveButton} onPress={handleCreateStaff} disabled={isManagingStaff}>
              <Text style={styles.saveButtonText}>{isManagingStaff ? 'Creating…' : 'Create staff account'}</Text>
            </TouchableOpacity>
            {staffAccounts.map(staff => (
              <View key={staff.uid} style={styles.staffRow}>
                <View style={styles.staffDetails}>
                  <Text style={styles.staffName}>{staff.displayName || 'Staff member'}</Text>
                  <Text style={styles.description}>{staff.email}{staff.disabled ? ' · Disabled' : ''}</Text>
                </View>
                {!staff.disabled && (
                  <TouchableOpacity onPress={() => handleDisableStaff(staff.uid)}>
                    <Text style={styles.disableText}>Disable</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}


        <View style={styles.currentCard}>

          <Text style={styles.currentTitle}>
            Current Thresholds
          </Text>

          <Text style={styles.currentText}>
            Pullet: {thresholds.pullet}
          </Text>

          <Text style={styles.currentText}>
            Small: {thresholds.small}
          </Text>

          <Text style={styles.currentText}>
            Medium: {thresholds.medium}
          </Text>

          <Text style={styles.currentText}>
            Large: {thresholds.large}
          </Text>

          <Text style={styles.currentText}>
            X-Large: {thresholds.xlarge}
          </Text>

          <Text style={styles.currentText}>
            Jumbo: {thresholds.jumbo}
          </Text>

        </View>


        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>
            Logout
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}


const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  content: {
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },

  description: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
    marginBottom: 20,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    elevation: 2,
  },

  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 15,
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 14,
    fontSize: 17,
    marginBottom: 18,
  },

  saveButton: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 10,
    marginTop: 5,
  },

  saveButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },

  currentCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginTop: 25,
    marginBottom: 20,
    elevation: 2,
  },

  currentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  currentText: {
    fontSize: 15,
    marginVertical: 4,
  },

  logoutButton: {
    backgroundColor: '#DC2626',
    padding: 16,
    borderRadius: 10,
    marginBottom: 30,
  },

  logoutButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  staffSection: { marginTop: 20, marginBottom: 20 },
  staffRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E9E3' },
  staffDetails: { flex: 1 },
  staffName: { fontSize: 15, fontWeight: '700' },
  disableText: { color: '#C84D4D', fontWeight: '700', padding: 8 },
});
