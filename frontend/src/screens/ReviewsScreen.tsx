import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';

export const ReviewsScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>←  Leave a Review</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>RK</Text></View>
          <View>
            <Text style={styles.name}>Ravi Kumar</Text>
            <Text style={styles.role}>Delivery Boy · Oct 24</Text>
          </View>
        </View>

        <Text style={styles.questionText}>How was your experience with Ravi?</Text>
        
        <View style={styles.starsRow}>
          <Text style={[styles.star, styles.starActive]}>★</Text>
          <Text style={[styles.star, styles.starActive]}>★</Text>
          <Text style={[styles.star, styles.starActive]}>★</Text>
          <Text style={[styles.star, styles.starActive]}>★</Text>
          <Text style={styles.star}>★</Text>
        </View>
        <Text style={styles.ratingLabel}>4 / 5 - Very Good</Text>

        <View style={styles.tagSection}>
          <Text style={styles.secTitle}>What went well?</Text>
          <View style={styles.tagsRow}>
            <TouchableOpacity style={[styles.tag, styles.tagSelected]}><Text style={styles.tagSelectedText}>On Time</Text></TouchableOpacity>
            <TouchableOpacity style={styles.tag}><Text style={styles.tagText}>Polite</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.tag, styles.tagSelected]}><Text style={styles.tagSelectedText}>Good Work</Text></TouchableOpacity>
            <TouchableOpacity style={styles.tag}><Text style={styles.tagText}>Clean</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.secTitle}>Write a review (optional)</Text>
          <TextInput 
            style={styles.textArea} 
            placeholder="Tell us more about your experience..." 
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn}>
          <Text style={styles.submitBtnText}>Submit Review</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#0F172A', padding: 20, paddingTop: 40 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 25 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  name: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  role: { fontSize: 13, color: '#64748B', marginTop: 2 },
  questionText: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginBottom: 15 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 10 },
  star: { fontSize: 40, color: '#E2E8F0' },
  starActive: { color: '#F59E0B' },
  ratingLabel: { textAlign: 'center', color: '#64748B', fontSize: 14, marginBottom: 30 },
  tagSection: { marginBottom: 25 },
  secTitle: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 10 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tag: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: 'white' },
  tagSelected: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  tagText: { color: '#475569', fontSize: 13 },
  tagSelectedText: { color: 'white', fontSize: 13 },
  inputSection: { marginBottom: 20 },
  textArea: { backgroundColor: 'white', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 15, fontSize: 14, color: '#0F172A', minHeight: 100 },
  footer: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  submitBtn: { backgroundColor: '#F97316', paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  submitBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});