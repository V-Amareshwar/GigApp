import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export const NotificationsScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.dayGroup}>
          <Text style={styles.dayTitle}>Today</Text>
          
          <TouchableOpacity style={[styles.notificationCard, styles.unread]}>
            <View style={styles.iconCircleBlue}>
              <Text style={styles.iconEmoji}>✉️</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.notifTitle}>Suresh sent you a message</Text>
              <Text style={styles.notifDesc} numberOfLines={1}>"Yes, I am available from 9 AM..."</Text>
              <Text style={styles.timeText}>10:34 AM</Text>
            </View>
            <View style={styles.unreadDot} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.notificationCard}>
            <View style={styles.iconCircleGreen}>
              <Text style={styles.iconEmoji}>🎉</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.notifTitle}>Application Accepted</Text>
              <Text style={styles.notifDesc}>You were hired for "Delivery Boy" in Banjara Hills.</Text>
              <Text style={styles.timeText}>9:00 AM</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.dayGroup}>
          <Text style={styles.dayTitle}>Yesterday</Text>

          <TouchableOpacity style={styles.notificationCard}>
            <View style={styles.iconCircleOrange}>
              <Text style={styles.iconEmoji}>⭐</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.notifTitle}>New Review Received</Text>
              <Text style={styles.notifDesc}>Ramesh rated you 5 stars. Keep it up!</Text>
              <Text style={styles.timeText}>Yesterday</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.notificationCard}>
            <View style={styles.iconCircleGray}>
              <Text style={styles.iconEmoji}>⚠️</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.notifTitle}>Profile Incomplete</Text>
              <Text style={styles.notifDesc}>Upload your ID proof to get verified badge.</Text>
              <Text style={styles.timeText}>Yesterday</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#0F172A', padding: 20, paddingTop: 40, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  content: { padding: 15 },
  dayGroup: { marginBottom: 20 },
  dayTitle: { fontSize: 14, fontWeight: 'bold', color: '#64748B', marginBottom: 10, paddingLeft: 5 },
  notificationCard: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10, alignItems: 'flex-start' },
  unread: { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' },
  iconCircleBlue: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  iconCircleGreen: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  iconCircleOrange: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFEDD5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  iconCircleGray: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  iconEmoji: { fontSize: 18 },
  textContainer: { flex: 1 },
  notifTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 3 },
  notifDesc: { fontSize: 13, color: '#475569', lineHeight: 18, marginBottom: 5 },
  timeText: { fontSize: 11, color: '#94A3B8' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0EA5E9', marginTop: 5 }
});