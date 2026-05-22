import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ProviderBottomNav } from '../components/ProviderBottomNav';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

export const ProviderWorkersScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      fetchWorkers();
    }
  }, [user?.uid]);

  const fetchWorkers = async () => {
    setLoading(true);
    
    // We need applications that are accepted, for jobs created by this provider
    // Supabase allows inner joins to filter parent rows based on child filters.
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs!inner(title, provider_id),
        profiles:seeker_id(name)
      `)
      .eq('jobs.provider_id', user?.uid)
      .eq('status', 'Accepted');

    if (!error && data) {
      setWorkers(data);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hired Workers</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 50 }} />
        ) : workers.length === 0 ? (
          <View style={{ padding: 30, alignItems: 'center' }}>
            <Text style={{ color: '#64748B' }}>You have not hired any workers yet.</Text>
          </View>
        ) : (
          workers.map((worker: any) => {
            const workerName = worker.profiles?.name || 'Unknown Worker';
            const initial = workerName.charAt(0).toUpperCase();
            const jobTitle = worker.jobs?.title || 'Unknown Job';
            
            return (
              <View key={worker.id} style={styles.workerCard}>
                <View style={styles.workerTopRow}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View>
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.workerName}>{workerName}</Text>
                    <Text style={styles.workerJob}>Hired for: {jobTitle}</Text>
                    <Text style={styles.workerStatus}>● Active Worker</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', marginTop: 15, justifyContent: 'space-between' }}>
                  <TouchableOpacity 
                    style={[styles.chatBtn, { flex: 1, marginRight: 5 }]}
                    onPress={() => navigation.navigate('Chat', { 
                      name: workerName, 
                      role: 'Worker', 
                      jobTitle: jobTitle,
                      jobId: worker.job_id,
                      receiverId: worker.seeker_id
                    })}
                  >
                    <Text style={styles.chatBtnText}>Chat</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.chatBtn, { flex: 1, marginLeft: 5, backgroundColor: '#10B981' }]}
                    onPress={() => navigation.navigate('Review', {
                      applicationId: worker.id,
                      revieweeId: worker.seeker_id,
                      jobId: worker.job_id
                    })}
                  >
                    <Text style={[styles.chatBtnText, { color: 'white' }]}>Complete</Text>
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
  emptyText: { color: '#64748B', textAlign: 'center', marginTop: 50 },
  workerCard: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  workerTopRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  workerName: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  workerJob: { fontSize: 13, color: '#64748B', marginTop: 2 },
  workerStatus: { fontSize: 12, color: '#10B981', marginTop: 4, fontWeight: 'bold' },
  chatBtn: { marginTop: 15, backgroundColor: '#F97316', padding: 12, borderRadius: 8, alignItems: 'center' },
  chatBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 }
});
