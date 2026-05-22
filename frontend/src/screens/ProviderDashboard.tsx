import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useRole } from '../context/RoleContext';
import { ProviderBottomNav } from '../components/ProviderBottomNav';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProviderDashboard'>;

export const ProviderDashboard = () => {
  const navigation = useNavigation<NavigationProp>();
  const { toggleRole } = useRole();
  const [isJobLive, setIsJobLive] = React.useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Employer Panel</Text>
          <Text style={styles.headerTitle}>Hi, Suresh</Text>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={toggleRole} style={styles.switchRoleBtn}>
            <Text style={styles.switchRoleText}>Find Jobs</Text>
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>S</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#F1F5F9' }]}>
            <Text style={[styles.statNum, { color: '#0F172A' }]}>3</Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </View>
          <TouchableOpacity style={[styles.statCard, { backgroundColor: '#FFF7ED' }]} onPress={() => navigation.navigate('ProviderApplications')}>
            <Text style={[styles.statNum, { color: '#F97316' }]}>App</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </TouchableOpacity>
          <View style={[styles.statCard, { backgroundColor: '#F1F5F9' }]}>
            <Text style={[styles.statNum, { color: '#0F172A' }]}>5</Text>
            <Text style={styles.statLabel}>Workers Hired</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F1F5F9' }]}>
            <Text style={[styles.statNum, { color: '#64748B' }]}>2</Text>
            <Text style={styles.statLabel}>Reviews Due</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your job posts</Text>
        <View style={styles.jobCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.jobTitle}>Delivery Boy</Text>
            <Text style={isJobLive ? styles.badgeOrange : styles.badgeGray}>
              {isJobLive ? 'Active' : 'Closed'}
            </Text>
          </View>
          <Text style={styles.jobSub}>8 applications · 124 views</Text>
          <View style={styles.jobActions}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: isJobLive ? '#FEF2F2' : '#ECFDF5', borderColor: isJobLive ? '#FECACA' : '#A7F3D0' }]} 
              onPress={() => setIsJobLive(!isJobLive)}
            >
              <Text style={[styles.actionBtnText, { color: isJobLive ? '#EF4444' : '#10B981', fontWeight: 'bold' }]}>
                {isJobLive ? 'Close Job' : 'Make Live'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('JobPosting')}>
              <Text style={styles.actionBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => alert("Viewing job details...")}>
              <Text style={styles.actionBtnText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('JobPosting')}
      >
        <Text style={styles.fabText}>+ Post New Job</Text>
      </TouchableOpacity>

      <ProviderBottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#0F172A', padding: 20, paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  switchRoleBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginRight: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  switchRoleText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  content: { padding: 15, paddingBottom: 80 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { width: '48%', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  statNum: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 5 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 10 },
  jobCard: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jobTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  badgeOrange: { backgroundColor: '#FFF7ED', color: '#F97316', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 10, overflow: 'hidden' },
  badgeGray: { backgroundColor: '#F1F5F9', color: '#64748B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 10, overflow: 'hidden' },
  jobSub: { color: '#64748B', fontSize: 12, marginTop: 5, marginBottom: 10 },
  jobActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  actionBtn: { borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  actionBtnText: { fontSize: 12, color: '#64748B' },
  fab: { position: 'absolute', bottom: 80, right: 20, backgroundColor: '#F97316', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 30, elevation: 5, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84 },
  fabText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', padding: 15, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  navItem: { color: '#64748B', fontSize: 12 },
  navActive: { color: '#0F172A', fontWeight: 'bold' }
});
