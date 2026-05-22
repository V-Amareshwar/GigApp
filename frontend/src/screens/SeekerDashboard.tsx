import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getOptimizedFeed, Job, UserPreferences } from '../utils/algorithms';
import * as Location from 'expo-location';
import { useRole } from '../context/RoleContext';
import { useProfile } from '../context/ProfileContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SeekerBottomNav } from '../components/SeekerBottomNav';
import { supabase } from '../utils/supabase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SeekerDashboard'>;

const CATEGORIES = [
  { name: "Delivery", icon: "🛵" }, { name: "Driver", icon: "🚗" }, { name: "Warehouse", icon: "🏭" },
  { name: "Construction", icon: "🏗️" }, { name: "Cleaning", icon: "🧹" }, { name: "Cooking", icon: "👨‍🍳" },
  { name: "Security", icon: "👮" }, { name: "Shop Helper", icon: "🏪" }, { name: "Office Assistant", icon: "💼" },
  { name: "Electrician", icon: "⚡" }, { name: "Plumber", icon: "🔧" }, { name: "Mechanic", icon: "🛠️" },
  { name: "Painter", icon: "🎨" }, { name: "Carpenter", icon: "🪚" }, { name: "Event Staff", icon: "🎉" },
  { name: "Hotel Staff", icon: "🏨" }, { name: "Restaurant Staff", icon: "🍽️" }, { name: "Factory Worker", icon: "🏭" },
  { name: "Household Work", icon: "🏠" }, { name: "Gardening", icon: "🪴" }, { name: "Caregiver", icon: "🫂" },
  { name: "Technician", icon: "💻" }, { name: "Sales Promoter", icon: "📢" }, { name: "Loading/Unloading", icon: "📦" },
  { name: "Other", icon: "📌" }
];

export const SeekerDashboard = () => {
  const navigation = useNavigation<NavigationProp>();
  const { toggleRole } = useRole();
  const { profile } = useProfile();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;
  const contentMaxWidth = 1200;
  const [currentLocation, setCurrentLocation] = useState('Fetching location...');
  const [locationCoords, setLocationCoords] = useState<{lat: number, lon: number} | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Urgent');
  const [activeFilter, setActiveFilter] = useState('All');
  const [optimizedJobs, setOptimizedJobs] = useState<Job[]>([]);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const [dbJobs, setDbJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase.from('jobs').select('*');
      if (data) {
        // Map snake_case or specific column formats if needed
        const mappedJobs = data.map(j => ({
          ...j,
          created_at: new Date(j.created_at),
          provider_trust_score: j.provider_trust_score || 5.0,
          urgency_score: j.urgency_score || 5.0
        })) as Job[];
        setDbJobs(mappedJobs);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCurrentLocation('Location permission denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocationCoords({ lat: location.coords.latitude, lon: location.coords.longitude });
      try {
        let geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
        if (geocode.length > 0 && geocode[0].city) {
          setCurrentLocation(`${geocode[0].city}, ${geocode[0].region}`);
        } else {
          throw new Error('No geocode');
        }
      } catch (e) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.coords.latitude}&lon=${location.coords.longitude}`);
          const data = await res.json();
          if (data && data.address) {
            const suburb = data.address.suburb || data.address.neighbourhood || data.address.village;
            const city = data.address.city || data.address.town || data.address.county;
            if (suburb && city) setCurrentLocation(`${suburb}, ${city}`);
            else if (city) setCurrentLocation(city);
            else setCurrentLocation('Location found');
          } else {
            setCurrentLocation('Location found');
          }
        } catch (err) {
          setCurrentLocation('Location found');
        }
      }
    })();
  }, []);

  // Algorithm Engine trigger: Runs whenever location or category changes
  useEffect(() => {
    if (locationCoords) {
      const prefs: UserPreferences = {
        latitude: locationCoords.lat,
        longitude: locationCoords.lon,
        preferred_categories: activeCategory === 'Urgent' ? CATEGORIES.map(c => c.name) : [activeCategory],
        max_distance_km: 50000, // Very large radius so jobs aren't filtered out by emulator location
        needs_urgent: activeCategory === 'Urgent'
      };
      
      const results = getOptimizedFeed(dbJobs, prefs);
      setOptimizedJobs(results);
    }
  }, [locationCoords, activeCategory, dbJobs]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { alignItems: 'center' }]}>
        <View style={{ width: '100%', maxWidth: contentMaxWidth }}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.greeting}>Good morning 👋</Text>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 2 }}>{profile?.name ? profile.name.split(' ')[0] : 'User'}</Text>
              <Text style={styles.location} numberOfLines={1}>📍 {currentLocation}</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity onPress={toggleRole} style={styles.switchRoleBtn}>
                <Text style={styles.switchRoleText}>Post a Job</Text>
              </TouchableOpacity>
              <View style={styles.notification}>
                <Text style={styles.notiIcon}>🔔</Text>
                <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
              </View>
            </View>
          </View>
          <TextInput 
            style={styles.searchBar} 
            placeholder="Search nearby jobs..." 
            placeholderTextColor="rgba(255,255,255,0.7)"
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.mainContent} contentContainerStyle={{ alignItems: 'center', paddingBottom: 80 }}>
        <View style={{ width: '100%', maxWidth: contentMaxWidth, paddingBottom: 20 }}>
          {/* Horizontal Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitleCategories}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            <TouchableOpacity 
              style={activeCategory === 'Urgent' ? styles.categoryItemActive : styles.categoryItem}
              onPress={() => setActiveCategory('Urgent')}
            >
              <View style={activeCategory === 'Urgent' ? styles.iconCircleActive : styles.iconCircle}>
                <Text style={styles.categoryIcon}>🔥</Text>
              </View>
              <Text style={activeCategory === 'Urgent' ? styles.categoryTextActive : styles.categoryText}>Urgent</Text>
            </TouchableOpacity>
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.name;
              return (
                <TouchableOpacity 
                  key={cat.name} 
                  style={isActive ? styles.categoryItemActive : styles.categoryItem}
                  onPress={() => setActiveCategory(cat.name)}
                >
                  <View style={isActive ? styles.iconCircleActive : styles.iconCircle}>
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  </View>
                  <Text style={isActive ? styles.categoryTextActive : styles.categoryText}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.paddingContent}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {['All', 'Hourly', 'Daily', 'Monthly', 'High Pay', 'Urgent'].map((filter, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.filterChip, activeFilter === filter && styles.filterActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterText, activeFilter === filter && styles.filterActiveText]}>{filter}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>
            {activeCategory === 'Urgent' ? 'Urgent Deliveries & High Pay' : `Recommended in ${activeCategory}`}
          </Text>

          {optimizedJobs.length === 0 && (
             <Text style={{color: '#64748B', textAlign: 'center', marginVertical: 20}}>
               No gigs matching your criteria right now.
             </Text>
          )}

          {/* Render Algorithmic Jobs */}
          <View style={isLargeScreen ? styles.jobGrid : undefined}>
            {optimizedJobs.map(job => (
              <TouchableOpacity 
                key={job.id} 
                style={[
                  job.urgency_score > 7 ? styles.jobCardUrgent : styles.jobCard, 
                  isLargeScreen && { width: '48%', marginBottom: 15 }
                ]}
                onPress={() => navigation.navigate('JobDetails', { job })}
              >
                <View style={styles.jobTop}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={job.urgency_score > 7 ? styles.jobTitleUrgent : styles.jobTitle}>{job.title}</Text>
                    {/* Since GPS distances are mocked against real queries, we just show categorized data roughly */}
                    <Text style={styles.jobCity}>{job.category} · Algorithmic Match</Text>
                    <Text style={styles.jobMeta}>★ {job.provider_trust_score.toFixed(1)} · Auto-ranked</Text>
                  </View>
                  <Text style={job.urgency_score > 7 ? styles.salaryUrgent : styles.salary}>
                    {job.hourly_rate ? `₹${job.hourly_rate}/hr` : job.daily_rate ? `₹${job.daily_rate}/day` : job.monthly_rate ? `₹${job.monthly_rate}/mo` : 'Negotiable'}
                  </Text>
                </View>
                <View style={styles.jobTags}>
                  {job.urgency_score > 7 && <Text style={styles.tagUrgent}>High Urgency</Text>}
                  <Text style={job.urgency_score > 7 ? styles.tagTime : styles.tag}>{job.hourly_rate ? 'Flexible' : 'Full Shift'}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
        </View>
        </View>
      </ScrollView>

      <SeekerBottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#0F172A', padding: 20, paddingTop: 40, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, zIndex: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  location: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  switchRoleBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginRight: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  switchRoleText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  notification: { position: 'relative' },
  notiIcon: { fontSize: 24 },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#EF4444', width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  searchBar: { backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', padding: 12, borderRadius: 8, marginTop: 20 },
  mainContent: { flex: 1 },
  categoriesSection: { backgroundColor: 'white', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginBottom: 15 },
  sectionTitleCategories: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginLeft: 15, marginBottom: 15 },
  categoriesScroll: { paddingHorizontal: 15, gap: 15 },
  categoryItem: { alignItems: 'center', width: 75 },
  categoryItemActive: { alignItems: 'center', width: 75 },
  iconCircle: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  iconCircleActive: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#FFF7ED', borderWidth: 2, borderColor: '#F97316', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryIcon: { fontSize: 24 },
  categoryText: { fontSize: 12, color: '#475569', textAlign: 'center' },
  categoryTextActive: { fontSize: 12, color: '#C2410C', fontWeight: 'bold', textAlign: 'center' },
  paddingContent: { paddingHorizontal: 15, paddingBottom: 20 },
  filterScroll: { flexDirection: 'row', marginBottom: 15, height: 40, flexGrow: 0 },
  filterChip: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20, backgroundColor: 'white', borderWidth: 1, borderColor: '#CBD5E1', marginRight: 10, height: 32, justifyContent: 'center' },
  filterActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  filterText: { color: '#64748B', fontSize: 13, fontWeight: '500' },
  filterActiveText: { color: 'white', fontSize: 13, fontWeight: 'bold' },
  urgentBanner: { backgroundColor: '#FEF2F2', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#FCA5A5', marginBottom: 20 },
  urgentTitle: { color: '#DC2626', fontWeight: 'bold', fontSize: 14, marginBottom: 10 },
  jobGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  jobCardUrgent: { backgroundColor: 'white', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#FCA5A5', marginBottom: 15 },
  jobTitleUrgent: { fontSize: 15, fontWeight: 'bold', color: '#7F1D1D' },
  salaryUrgent: { fontSize: 15, fontWeight: 'bold', color: '#DC2626' },
  tagUrgent: { backgroundColor: '#FEE2E2', color: '#B91C1C', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontSize: 11, fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 15 },
  jobCard: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  jobTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'flex-start' },
  jobTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', flex: 1 },
  jobCity: { color: '#64748B', fontSize: 12, marginTop: 3 },
  jobMeta: { color: '#F59E0B', fontSize: 11, marginTop: 3, fontWeight: '600' },
  salary: { fontSize: 15, fontWeight: 'bold', color: '#10B981' },
  jobTags: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tag: { backgroundColor: '#F1F5F9', color: '#475569', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontSize: 11 },
  tagTime: { backgroundColor: '#FFF7ED', color: '#C2410C', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontSize: 11 },
  bottomNavWrapper: { backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', padding: 15 },
  navItemContainer: { alignItems: 'center', flex: 1 },
  navItem: { color: '#64748B', fontSize: 12 },
  navActive: { color: '#0F172A', fontWeight: 'bold' }
});