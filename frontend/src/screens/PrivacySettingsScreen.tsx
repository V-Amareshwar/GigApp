import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const PrivacySettingsScreen = () => {
  const navigation = useNavigation();
  const [profileVisible, setProfileVisible] = useState(true);
  const [locationShared, setLocationShared] = useState(true);
  const [showEarnings, setShowEarnings] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>Public Profile</Text>
            <Text style={styles.settingDesc}>Allow employers to find you</Text>
          </View>
          <Switch value={profileVisible} onValueChange={setProfileVisible} trackColor={{ false: '#CBD5E1', true: '#10B981' }} />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>Share Location</Text>
            <Text style={styles.settingDesc}>Use GPS for better matches</Text>
          </View>
          <Switch value={locationShared} onValueChange={setLocationShared} trackColor={{ false: '#CBD5E1', true: '#10B981' }} />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>Show Earnings</Text>
            <Text style={styles.settingDesc}>Display total earned on profile</Text>
          </View>
          <Switch value={showEarnings} onValueChange={setShowEarnings} trackColor={{ false: '#CBD5E1', true: '#10B981' }} />
        </View>
        
        <TouchableOpacity style={styles.dangerBtn}>
          <Text style={styles.dangerBtnText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0F172A', padding: 20, paddingTop: 50, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  backBtnText: { color: 'white', fontSize: 24, lineHeight: 28 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  settingTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 5 },
  settingDesc: { fontSize: 13, color: '#64748B' },
  dangerBtn: { marginTop: 30, borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FEF2F2', padding: 15, borderRadius: 10, alignItems: 'center' },
  dangerBtnText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 }
});
