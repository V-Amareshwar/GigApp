import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export const ProviderBottomNav = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const currentRoute = route.name;

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity 
        style={{ flex: 1, alignItems: 'center' }} 
        onPress={() => { if(currentRoute !== 'ProviderDashboard') navigation.navigate('ProviderDashboard' as never) }}
      >
        <Text style={[styles.navItem, currentRoute === 'ProviderDashboard' && styles.navActive]}>Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={{ flex: 1, alignItems: 'center' }} 
        onPress={() => { if(currentRoute !== 'ProviderJobs') navigation.navigate('ProviderJobs' as never) }}
      >
        <Text style={[styles.navItem, currentRoute === 'ProviderJobs' && styles.navActive]}>Jobs</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={{ flex: 1, alignItems: 'center' }} 
        onPress={() => { if(currentRoute !== 'ProviderWorkers') navigation.navigate('ProviderWorkers' as never) }}
      >
        <Text style={[styles.navItem, currentRoute === 'ProviderWorkers' && styles.navActive]}>Workers</Text>
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
