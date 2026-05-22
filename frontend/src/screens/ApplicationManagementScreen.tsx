import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export const ApplicationManagementScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>←  Applications (8)</Text>
        <Text style={styles.headerSub}>Delivery Boy · Banjara Hills</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.filterRow}>
          <TouchableOpacity style={[styles.filterChip, styles.filterActive]}><Text style={styles.filterActiveText}>All (8)</Text></TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}><Text style={styles.filterText}>Nearby</Text></TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}><Text style={styles.filterText}>Top rated</Text></TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.applicantHeader}>
            <View style={styles.avatar}><Text style={styles.avatarText}>RK</Text></View>
            <View style={styles.info}>
              <Text style={styles.name}>Ravi Kumar</Text>
              <Text style={styles.rating}>★★★★ <Text style={styles.muted}>4.6 · 1.2km</Text></Text>
            </View>
            <View style={styles.actionCol}>
              <TouchableOpacity style={styles.acceptBtn}><Text style={styles.acceptText}>Accept</Text></TouchableOpacity>
              <TouchableOpacity style={styles.rejectBtn}><Text style={styles.rejectText}>Reject</Text></TouchableOpacity>
            </View>
          </View>
          <View style={styles.skillsRow}>
            <Text style={styles.skillTag}>Bike riding</Text>
            <Text style={styles.skillTag}>Delivery exp.</Text>
          </View>
          <TouchableOpacity style={styles.chatBtn}>
            <Text style={styles.chatBtnText}>💬 Chat with Ravi</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#0F172A', padding: 20, paddingTop: 40 },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  content: { padding: 15 },
  filterRow: { flexDirection: 'row', marginBottom: 15, gap: 10 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: 'white' },
  filterActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  filterText: { color: '#64748B', fontSize: 12 },
  filterActiveText: { color: 'white', fontSize: 12 },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 15 },
  applicantHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 45, height: 45, backgroundColor: '#F1F5F9', borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  rating: { color: '#F59E0B', fontSize: 14, marginTop: 2 },
  muted: { color: '#64748B' },
  actionCol: { gap: 5 },
  acceptBtn: { backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, alignItems: 'center' },
  acceptText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  rejectBtn: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, alignItems: 'center' },
  rejectText: { color: '#EF4444', fontSize: 12, fontWeight: 'bold' },
  skillsRow: { flexDirection: 'row', gap: 8, marginTop: 15, marginBottom: 10 },
  skillTag: { backgroundColor: '#F1F5F9', color: '#0F172A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontSize: 12, borderWidth: 1, borderColor: '#CBD5E1' },
  chatBtn: { backgroundColor: '#FFF7ED', padding: 10, borderRadius: 6, alignItems: 'center', borderWidth: 1, borderColor: '#F97316' },
  chatBtnText: { color: '#F97316', fontWeight: 'bold', fontSize: 14 }
});