import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export const SeekerBottomNav = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const currentRoute = route.name;

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity 
        style={{ flex: 1, alignItems: 'center' }} 
        onPress={() => { if(currentRoute !== 'SeekerDashboard') navigation.navigate('SeekerDashboard' as never) }}
      >
        <Text style={[styles.navItem, currentRoute === 'SeekerDashboard' && styles.navActive]}>Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={{ flex: 1, alignItems: 'center' }} 
        onPress={() => { if(currentRoute !== 'SeekerApplications') navigation.navigate('SeekerApplications' as never) }}
      >
        <Text style={[styles.navItem, currentRoute === 'SeekerApplications' && styles.navActive]}>Applications</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={{ flex: 1, alignItems: 'center' }} 
        onPress={() => { if(currentRoute !== 'SavedJobs') navigation.navigate('SavedJobs' as never) }}
      >
        <Text style={[styles.navItem, currentRoute === 'SavedJobs' && styles.navActive]}>Saved Jobs</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={{ flex: 1, alignItems: 'center' }} 
        onPress={() => { if(currentRoute !== 'Profile') navigation.navigate('Profile' as never) }}
      >
        <Text style={[styles.navItem, currentRoute === 'Profile' && styles.navActive]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    padding: 15, 
    backgroundColor: 'white', 
    borderTopWidth: 1, 
    borderTopColor: '#E2E8F0',
    ...(Platform.OS === 'web' ? { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 } : { position: 'absolute', bottom: 0, left: 0, right: 0 }) as any
  },
  navItem: { color: '#64748B', fontSize: 12 },
  navActive: { color: '#0F172A', fontWeight: 'bold' }
});
