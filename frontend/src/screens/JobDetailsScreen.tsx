import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type JobDetailsRouteProp = RouteProp<RootStackParamList, 'JobDetails'>;

export const JobDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<JobDetailsRouteProp>();
  const { user } = useAuth();
  const { job } = route.params;
  
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    if (!user?.uid) return;
    setApplying(true);
    
    const application = {
      job_id: job.id,
      seeker_id: user.uid,
      status: 'Pending'
    };
    
    const { error } = await supabase.from('applications').insert(application);
    
    setApplying(false);
    
    if (error) {
      alert('Error applying: ' + error.message);
    } else {
      alert('Application submitted successfully!');
      navigation.navigate('SeekerApplications');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.category}>{job.category} · {job.urgency_score > 7 ? 'High Urgency' : 'Standard'}</Text>
          
          <View style={styles.salaryContainer}>
            <Text style={styles.salaryLabel}>Pay Rate</Text>
            <Text style={styles.salaryText}>
              {job.hourly_rate ? `₹${job.hourly_rate}/hr` : job.daily_rate ? `₹${job.daily_rate}/day` : job.monthly_rate ? `₹${job.monthly_rate}/mo` : 'Negotiable'}
            </Text>
          </View>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{job.description || 'No description provided.'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          {job.requirements && job.requirements.length > 0 ? (
            job.requirements.map((req: string, index: number) => (
              <Text key={index} style={styles.listItem}>• {req}</Text>
            ))
          ) : (
            <Text style={styles.descriptionText}>None specified.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.descriptionText}>{job.location_name || 'Not specified'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <Text style={styles.descriptionText}>
            Start Date: {job.start_date ? new Date(job.start_date).toLocaleDateString() : 'Immediate'}{'\n'}
            Timing: {job.start_time ? new Date(job.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Flexible'} - {job.end_time ? new Date(job.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Flexible'}
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.applyBtn, applying && styles.applyBtnDisabled]} 
          onPress={handleApply}
          disabled={applying}
        >
          {applying ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.applyBtnText}>Apply Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0F172A', padding: 20, paddingTop: 50, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  backBtnText: { color: 'white', fontSize: 24, lineHeight: 28 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 15 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', marginBottom: 5 },
  category: { fontSize: 14, color: '#64748B', marginBottom: 15 },
  salaryContainer: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  salaryLabel: { fontSize: 14, color: '#475569', fontWeight: '500' },
  salaryText: { fontSize: 18, color: '#10B981', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 10 },
  descriptionText: { fontSize: 15, color: '#475569', lineHeight: 22 },
  listItem: { fontSize: 15, color: '#475569', lineHeight: 24, marginBottom: 4 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 10 },
  applyBtn: { backgroundColor: '#F97316', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  applyBtnDisabled: { backgroundColor: '#FDBA74' },
  applyBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});