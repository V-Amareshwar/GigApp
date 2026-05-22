import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRole } from '../context/RoleContext';

export const RoleSelectionScreen = () => {
  const { setRole } = useRole();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What would you like to do right now?</Text>
      <Text style={styles.subtitle}>You can switch anytime</Text>
      
      <TouchableOpacity 
        style={[styles.card, { borderColor: '#0F172A', backgroundColor: '#F1F5F9' }]} 
        onPress={() => setRole('Seeker')}
      >
        <Text style={styles.cardIcon}>🔍 💼</Text>
        <Text style={[styles.cardTitle, { color: '#0F172A' }]}>Find Work</Text>
        <Text style={styles.cardSubtitle}>Browse & apply to nearby jobs</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.card, { borderColor: '#F97316' }]} 
        onPress={() => setRole('Provider')}
      >
        <Text style={styles.cardIcon}>➕ 👥</Text>
        <Text style={[styles.cardTitle, { color: '#F97316' }]}>Post a Job</Text>
        <Text style={styles.cardSubtitle}>Hire workers fast</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 40,
    marginTop: 5,
  },
  card: {
    padding: 30,
    borderRadius: 15,
    borderWidth: 2,
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
  }
});
