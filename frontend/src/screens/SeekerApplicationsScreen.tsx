import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SeekerBottomNav } from '../components/SeekerBottomNav';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

const TABS = ['Pending', 'Accepted', 'Rejected', 'Completed'];

export const SeekerApplicationsScreen = () => {
  const [activeTab, setActiveTab] = useState('Pending');
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      fetchApplications();
    }
  }, [user?.uid, activeTab]);

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('applications')
      .select('*, jobs(*)')
      .eq('seeker_id', user?.uid)
      .eq('status', activeTab);
      
    if (!error && data) {
      setApplications(data);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Applications</Text>
      </View>

      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 50 }} />
        ) : applications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} applications.</Text>
          </View>
        ) : (
          applications.map(app => (
            <View key={app.id} style={styles.jobCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.jobTitle}>{app.jobs?.title || 'Unknown Job'}</Text>
                <Text style={[
                  styles.statusBadge, 
                  app.status === 'Accepted' ? { backgroundColor: '#ECFDF5', color: '#10B981' } : 
                  app.status === 'Pending' ? { backgroundColor: '#F1F5F9', color: '#64748B' } :
                  { backgroundColor: '#FEE2E2', color: '#EF4444' }
                ]}>
                  {app.status}
                </Text>
              </View>
              <Text style={styles.companyName}>Provider ID: {app.jobs?.provider_id}</Text>
              <Text style={styles.dateText}>Applied on {new Date(app.created_at).toLocaleDateString()}</Text>
              
              {app.status === 'Accepted' && (
                <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'space-between' }}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { flex: 1, marginRight: 5 }]}
                    onPress={() => navigation.navigate('Chat', { 
                      name: 'Employer', 
                      role: 'Employer', 
                      jobTitle: app.jobs?.title,
                      jobId: app.job_id,
                      receiverId: app.jobs?.provider_id
                    })}
                  >
                    <Text style={styles.actionBtnText}>Chat</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionBtn, { flex: 1, marginLeft: 5, backgroundColor: '#10B981' }]}
                    onPress={() => navigation.navigate('Review', {
                      applicationId: app.id,
                      revieweeId: app.jobs?.provider_id,
                      jobId: app.job_id
                    })}
                  >
                    <Text style={[styles.actionBtnText, { color: 'white' }]}>Complete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <SeekerBottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#0F172A', padding: 20, paddingTop: 40 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  tabContainer: { flexDirection: 'row', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#F97316' },
  tabText: { color: '#64748B', fontSize: 13, fontWeight: '500' },
  activeTabText: { color: '#F97316', fontWeight: 'bold' },
  content: { padding: 15 },
  jobCard: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  jobTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, fontSize: 12, fontWeight: 'bold', overflow: 'hidden' },
  companyName: { fontSize: 14, color: '#475569', marginBottom: 10 },
  dateText: { fontSize: 12, color: '#94A3B8' },
  actionBtn: { marginTop: 15, backgroundColor: '#0F172A', padding: 12, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  emptyState: { padding: 30, alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 14 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', padding: 15, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  navItem: { color: '#64748B', fontSize: 12 },
  navActive: { color: '#0F172A', fontWeight: 'bold' }
});
