import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const NotificationSettingsScreen = () => {
  const navigation = useNavigation();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [updatesEnabled, setUpdatesEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingDesc}>Get alerts on your phone</Text>
          </View>
          <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ false: '#CBD5E1', true: '#10B981' }} />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>Email Notifications</Text>
            <Text style={styles.settingDesc}>Receive daily job summaries</Text>
          </View>
          <Switch value={emailEnabled} onValueChange={setEmailEnabled} trackColor={{ false: '#CBD5E1', true: '#10B981' }} />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>SMS Alerts</Text>
            <Text style={styles.settingDesc}>Urgent job opportunities via SMS</Text>
          </View>
          <Switch value={smsEnabled} onValueChange={setSmsEnabled} trackColor={{ false: '#CBD5E1', true: '#10B981' }} />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>App Updates</Text>
            <Text style={styles.settingDesc}>News and feature updates</Text>
          </View>
          <Switch value={updatesEnabled} onValueChange={setUpdatesEnabled} trackColor={{ false: '#CBD5E1', true: '#10B981' }} />
        </View>
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
  settingDesc: { fontSize: 13, color: '#64748B' }
});
