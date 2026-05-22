import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SeekerBottomNav } from '../components/SeekerBottomNav';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SavedJobs'>;

export const SavedJobsScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  // Dummy saved jobs data
  const savedJobs = [
    { id: 1, title: 'Delivery Driver', company: 'QuickKart', location: 'Hyderabad', salary: '₹15,000/month', tags: ['Urgent', 'Full-time'] },
    { id: 2, title: 'Warehouse Helper', company: 'LogiCorp', location: 'Secunderabad', salary: '₹500/day', tags: ['Daily', 'Shift'] },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Jobs</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {savedJobs.length === 0 ? (
          <Text style={styles.emptyText}>No saved jobs yet.</Text>
        ) : (
          savedJobs.map(job => (
            <View key={job.id} style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <TouchableOpacity style={styles.unsaveBtn}>
                  <Text style={styles.unsaveText}>♥</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.companyText}>{job.company} • {job.location}</Text>
              <Text style={styles.salaryText}>{job.salary}</Text>
              
              <View style={styles.tagsRow}>
                {job.tags.map(tag => (
                  <Text key={tag} style={styles.tag}>{tag}</Text>
                ))}
              </View>

              <TouchableOpacity style={styles.applyBtn}>
                <Text style={styles.applyBtnText}>Apply Now</Text>
              </TouchableOpacity>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0F172A', padding: 20, paddingTop: 50, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  backBtnText: { color: 'white', fontSize: 24, lineHeight: 28 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 15 },
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 50 },
  jobCard: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  jobTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  unsaveBtn: { padding: 5 },
  unsaveText: { color: '#EF4444', fontSize: 20 },
  companyText: { color: '#64748B', fontSize: 14, marginBottom: 5 },
  salaryText: { color: '#10B981', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  tagsRow: { flexDirection: 'row', gap: 8, marginBottom: 15 },
  tag: { backgroundColor: '#F1F5F9', color: '#475569', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontSize: 12 },
  applyBtn: { backgroundColor: '#0F172A', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  applyBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 }
});
