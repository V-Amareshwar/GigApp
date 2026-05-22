import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProfile } from '../context/ProfileContext';
import { useRole } from '../context/RoleContext';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ProviderBottomNav } from '../components/ProviderBottomNav';
import { SeekerBottomNav } from '../components/SeekerBottomNav';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useProfile();
  const { role, setRole } = useRole();
  const { logout } = useAuth();

  const toggleRole = () => {
    const newRole = role === 'Seeker' ? 'Provider' : 'Seeker';
    setRole(newRole as any);
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate(role === 'Seeker' ? 'SeekerDashboard' as never : 'ProviderDashboard' as never);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. PROFILE HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.avatarBig}><Text style={styles.avatarBigText}>{getInitials(profile.name)}</Text></View>
        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.profileCity}>📍 {profile.city}</Text>
        
        <View style={styles.badgesRow}>
          {profile.phoneVerified && <Text style={styles.verifiedBadge}>✓ Phone Verified</Text>}
          {profile.idVerified && <Text style={styles.verifiedBadge}>✓ ID Verified</Text>}
          <Text style={styles.trustedBadge}>★ Trusted User</Text>
        </View>

        <View style={styles.headerStatsRow}>
          <Text style={styles.headerStatText}>⭐ {profile.rating} Rating</Text>
          <Text style={styles.headerStatText}>•</Text>
          <Text style={styles.headerStatText}>{profile.jobsCompleted} Jobs Completed</Text>
        </View>

        {/* Role Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleBtn, role === 'Seeker' && styles.toggleBtnActive]}
            onPress={() => setRole('Seeker')}
          >
            <Text style={[styles.toggleText, role === 'Seeker' && styles.toggleTextActive]}>Find Work</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, role === 'Provider' && styles.toggleBtnActive]}
            onPress={() => setRole('Provider')}
          >
            <Text style={[styles.toggleText, role === 'Provider' && styles.toggleTextActive]}>Post Jobs</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* 2. BASIC INFORMATION */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Phone:</Text><Text style={styles.infoVal}>{profile.phone}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Gender:</Text><Text style={styles.infoVal}>{profile.gender}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Age:</Text><Text style={styles.infoVal}>{profile.age}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Location:</Text><Text style={styles.infoVal}>{profile.city} (Lat/Lng stored)</Text></View>
          
          <Text style={[styles.infoLabel, { marginTop: 10, marginBottom: 5 }]}>Languages Known:</Text>
          <View style={styles.tagsRow}>
            {profile.languages.map(lang => (
              <Text key={lang} style={styles.tag}>{lang}</Text>
            ))}
          </View>
        </View>

        {/* 3. WORK INFORMATION */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Work Information</Text>
          
          {role === 'Seeker' ? (
            <>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Experience:</Text><Text style={styles.infoVal}>{profile.experience}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Work Type:</Text><Text style={styles.infoVal}>{profile.preferredWorkType}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Expected Pay:</Text><Text style={styles.infoVal}>{profile.salaryExpectation}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Status:</Text><Text style={[styles.infoVal, { color: '#10B981', fontWeight: 'bold' }]}>{profile.availability}</Text></View>
              
              <Text style={[styles.infoLabel, { marginTop: 10, marginBottom: 5 }]}>Skills:</Text>
              <View style={styles.tagsRow}>
                {profile.skills.map(skill => (
                  <Text key={skill} style={styles.tag}>{skill}</Text>
                ))}
              </View>
              <Text style={[styles.infoLabel, { marginTop: 10, marginBottom: 5 }]}>Preferred Categories:</Text>
              <View style={styles.tagsRow}>
                {profile.preferredCategories.map(cat => (
                  <Text key={cat} style={styles.tag}>{cat}</Text>
                ))}
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Business Name:</Text><Text style={styles.infoVal}>{profile.businessName}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Active Jobs:</Text><Text style={styles.infoVal}>{profile.activeJobs}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Success Rate:</Text><Text style={styles.infoVal}>{profile.hiringSuccessRate}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Response Time:</Text><Text style={styles.infoVal}>{profile.responseTime}</Text></View>
            </>
          )}
        </View>

        {/* 4. TRUST & RATINGS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Trust & Ratings</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>⭐ {profile.rating}</Text>
              <Text style={styles.statLabel}>Overall</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#10B981' }]}>{profile.attendanceScore}</Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: '#EF4444' }]}>{profile.cancellationRate}</Text>
              <Text style={styles.statLabel}>Cancellation</Text>
            </View>
          </View>
          <View style={styles.verifyRow}>
            <Text style={styles.verifyIcon}>✓</Text>
            <Text style={styles.verifyText}>Verified User</Text>
          </View>
        </View>

        {/* 5. REVIEWS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reviews ({profile.reviews.length})</Text>
          {profile.reviews.map(review => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <Text style={styles.reviewRating}>{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</Text>
              <Text style={styles.reviewMessage}>{review.message}</Text>
            </View>
          ))}
          <Text style={styles.reviewNotice}>Only users from completed jobs can leave reviews.</Text>
        </View>

        {/* 6. ACTIVITY & PERFORMANCE */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Activity & Performance</Text>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Jobs Completed:</Text><Text style={styles.infoVal}>{profile.jobsCompleted}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Total Applications:</Text><Text style={styles.infoVal}>{profile.totalApplications}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Response Rate:</Text><Text style={styles.infoVal}>{profile.responseRate}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Status:</Text><Text style={styles.infoVal}>{profile.lastActive}</Text></View>
        </View>

        {/* 7. SETTINGS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <TouchableOpacity style={styles.settingsRow} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.settingsText}>Edit Profile</Text>
            <Text style={styles.settingsArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsRow} onPress={() => navigation.navigate('NotificationSettings')}>
            <Text style={styles.settingsText}>Notification Settings</Text>
            <Text style={styles.settingsArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsRow} onPress={() => navigation.navigate('PrivacySettings')}>
            <Text style={styles.settingsText}>Privacy Settings</Text>
            <Text style={styles.settingsArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsRow} onPress={toggleRole}>
            <Text style={styles.settingsText}>Switch Role (Current: {role})</Text>
            <Text style={styles.settingsArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingsRow, { borderBottomWidth: 0 }]} onPress={logout}>
            <Text style={[styles.settingsText, { color: '#EF4444' }]}>Logout</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
      
      {role === 'Provider' && <ProviderBottomNav />}
      {role === 'Seeker' && <SeekerBottomNav />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#0F172A', padding: 15, paddingTop: 30, paddingBottom: 20, alignItems: 'center', position: 'relative' },
  backBtn: { position: 'absolute', top: 30, left: 15, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, zIndex: 10 },
  backBtnText: { color: 'white', fontSize: 24, lineHeight: 28 },
  avatarBig: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarBigText: { fontSize: 24, color: 'white', fontWeight: 'bold' },
  profileName: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 2 },
  profileCity: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 8 },
  badgesRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  verifiedBadge: { color: '#10B981', backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: 'bold' },
  trustedBadge: { color: '#F59E0B', backgroundColor: '#FFFBEB', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: 'bold' },
  headerStatsRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 15 },
  headerStatText: { color: 'white', fontSize: 14, fontWeight: '500' },
  toggleContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 4, width: '100%', maxWidth: 300 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  toggleBtnActive: { backgroundColor: 'white' },
  toggleText: { color: 'white', fontWeight: 'bold' },
  toggleTextActive: { color: '#0F172A' },
  
  content: { padding: 15 },
  card: { backgroundColor: 'white', borderRadius: 10, padding: 15, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 10 },
  
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { color: '#64748B', fontSize: 14, fontWeight: '500' },
  infoVal: { color: '#0F172A', fontSize: 14, fontWeight: '600' },
  
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#F1F5F9', color: '#334155', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, fontSize: 13, borderWidth: 1, borderColor: '#E2E8F0' },
  
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  statBox: { alignItems: 'center', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 8, flex: 1, marginHorizontal: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  statNum: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#64748B' },
  
  verifyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ECFDF5', padding: 10, borderRadius: 8 },
  verifyIcon: { color: 'white', backgroundColor: '#10B981', width: 20, height: 20, borderRadius: 10, textAlign: 'center', fontWeight: 'bold', marginRight: 10, fontSize: 12, lineHeight: 20 },
  verifyText: { color: '#10B981', fontSize: 14, fontWeight: 'bold' },
  
  reviewItem: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 12, marginBottom: 12 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewerName: { fontWeight: 'bold', color: '#0F172A' },
  reviewDate: { color: '#94A3B8', fontSize: 12 },
  reviewRating: { color: '#F59E0B', fontSize: 14, marginBottom: 4 },
  reviewMessage: { color: '#475569', fontSize: 14 },
  reviewNotice: { fontSize: 12, color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
  
  settingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  settingsText: { fontSize: 15, color: '#334155', fontWeight: '500' },
  settingsArrow: { fontSize: 20, color: '#94A3B8' }
});