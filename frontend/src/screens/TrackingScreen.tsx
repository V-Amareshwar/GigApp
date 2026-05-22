import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export const TrackingScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>←  Your Application Status</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Delivery Boy</Text>
          <Text style={styles.cardInfo}>Banjara Hills · Employer: Suresh</Text>
        </View>

        <View style={styles.timelineBox}>
          
          <View style={styles.timelineItem}>
            <View style={styles.iconCol}>
              <View style={[styles.dot, styles.dotDone]}>✓</View>
              <View style={styles.lineDone} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.titleDone}>Application Sent</Text>
              <Text style={styles.muted}>Oct 24, 10:30 AM</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.iconCol}>
              <View style={[styles.dot, styles.dotDone]}>✓</View>
              <View style={styles.lineHalf} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.titleDone}>Viewed by Employer</Text>
              <Text style={styles.muted}>Oct 24, 11:15 AM</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.iconCol}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.linePending} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.titleActive}>Shortlisted / Chat Pending</Text>
              <Text style={styles.activeText}>Employer has initiated a chat.</Text>
            </View>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.iconCol}>
              <View style={[styles.dot, styles.dotPending]} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.titlePending}>Hired</Text>
              <Text style={styles.muted}>Awaiting final confirmation</Text>
            </View>
          </View>

        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>💡 Keep your phone nearby. The employer might call or text you soon.</Text>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#0F172A', padding: 20, paddingTop: 40 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 15 },
  cardHeader: { backgroundColor: 'white', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  cardInfo: { color: '#64748B', fontSize: 13 },
  timelineBox: { padding: 10 },
  timelineItem: { flexDirection: 'row', marginBottom: 0 },
  iconCol: { width: 30, alignItems: 'center' },
  dot: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  dotDone: { backgroundColor: '#10B981' },
  dotActive: { backgroundColor: '#F97316', borderWidth: 4, borderColor: '#FFEDD5' },
  dotPending: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#CBD5E1' },
  lineDone: { width: 2, height: 50, backgroundColor: '#10B981', marginTop: -5, marginBottom: -5 },
  lineHalf: { width: 2, height: 50, backgroundColor: '#E2E8F0', marginTop: -5, marginBottom: -5 },
  linePending: { width: 2, height: 50, backgroundColor: '#E2E8F0', marginTop: -5, marginBottom: -5 },
  textCol: { flex: 1, paddingLeft: 15, paddingBottom: 30, paddingTop: 2 },
  titleDone: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  titleActive: { fontSize: 15, fontWeight: 'bold', color: '#F97316' },
  titlePending: { fontSize: 15, fontWeight: 'bold', color: '#94A3B8' },
  muted: { color: '#64748B', fontSize: 13, marginTop: 4 },
  activeText: { color: '#C2410C', fontSize: 13, marginTop: 4 },
  warningBox: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', padding: 15, borderRadius: 8, marginTop: 10 },
  warningText: { color: '#1E40AF', fontSize: 13, lineHeight: 18 }
});