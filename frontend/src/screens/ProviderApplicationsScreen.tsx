import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ProviderBottomNav } from '../components/ProviderBottomNav';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

export const ProviderApplicationsScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      fetchApplications();
    }
  }, [user?.uid]);

  const fetchApplications = async () => {
    setLoading(true);
    
    // Fetch pending applications for jobs owned by the provider
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs!inner(title, provider_id),
        profiles:seeker_id(name, rating)
      `)
      .eq('jobs.provider_id', user?.uid)
      .eq('status', 'Pending');

    if (!error && data) {
      setApplications(data);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (appId: string, status: string) => {
    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', appId);
      
    if (!error) {
      // Remove from list
      setApplications(prev => prev.filter(app => app.id !== appId));
    } else {
      alert("Error updating application: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Applicants</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 50 }} />
        ) : applications.length === 0 ? (
          <View style={{ padding: 30, alignItems: 'center' }}>
            <Text style={{ color: '#64748B' }}>No pending applications right now.</Text>
          </View>
        ) : (
          applications.map((app: any) => {
            const seekerName = app.profiles?.name || 'Unknown Worker';
            const initial = seekerName.charAt(0).toUpperCase();
            const rating = app.profiles?.rating ? parseFloat(app.profiles.rating).toFixed(1) : '5.0';
            const jobTitle = app.jobs?.title || 'Unknown Job';
            
            return (
              <View key={app.id} style={styles.card}>
                <View style={styles.topRow}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View>
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.name}>{seekerName}</Text>
                    <Text style={styles.job}>Applied for: {jobTitle}</Text>
                    <Text style={styles.rating}>★ {rating}</Text>
                  </View>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={[styles.btn, styles.rejectBtn]}
                    onPress={() => handleUpdateStatus(app.id, 'Rejected')}
                  >
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.btn, styles.acceptBtn]}
                    onPress={() => handleUpdateStatus(app.id, 'Accepted')}
                  >
                    <Text style={styles.acceptText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <ProviderBottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0F172A', padding: 20, paddingTop: 50, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  backBtnText: { color: 'white', fontSize: 24, lineHeight: 28 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 15 },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  job: { fontSize: 13, color: '#64748B', marginTop: 2 },
  rating: { fontSize: 13, color: '#F59E0B', marginTop: 4, fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', marginTop: 15, justifyContent: 'space-between' },
  btn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  rejectBtn: { backgroundColor: '#FEF2F2', marginRight: 10, borderWidth: 1, borderColor: '#FECACA' },
  rejectText: { color: '#EF4444', fontWeight: 'bold' },
  acceptBtn: { backgroundColor: '#10B981', marginLeft: 10 },
  acceptText: { color: 'white', fontWeight: 'bold' }
});
