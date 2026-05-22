import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useProfile } from '../context/ProfileContext';
import { useNavigation } from '@react-navigation/native';

export const EditProfileScreen = () => {
  const { profile, updateProfile, completeOnboarding } = useProfile();
  const navigation = useNavigation();
  
  const [name, setName] = useState(profile.name);
  const [city, setCity] = useState(profile.city);
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState(profile.gender);
  
  const handleSave = () => {
    if (!name || !city) {
      alert("Name and City are required!");
      return;
    }
    
    completeOnboarding({ name, city, age, gender });
  };

  return (
    <View style={styles.container}>
      {profile.isProfileComplete && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.headerTitle, { marginTop: profile.isProfileComplete ? 0 : 30 }]}>
          {profile.isProfileComplete ? 'Edit Profile' : 'Complete Your Profile'}
        </Text>
      
      {!profile.isProfileComplete && (
        <Text style={styles.subtitle}>Please fill out your basic information to continue.</Text>
      )}

      <Text style={styles.sectionTitle}>Basic Information</Text>

      <Text style={styles.label}>Full Name *</Text>
      <TextInput 
        style={styles.input} 
        value={name} 
        onChangeText={setName} 
        placeholder="e.g. Ravi Kumar" 
      />

      <Text style={styles.label}>Current City *</Text>
      <TextInput 
        style={styles.input} 
        value={city} 
        onChangeText={setCity} 
        placeholder="e.g. Hyderabad" 
      />

      <Text style={styles.label}>Age (Optional)</Text>
      <TextInput 
        style={styles.input} 
        value={age} 
        onChangeText={setAge} 
        keyboardType="numeric"
        placeholder="e.g. 28" 
      />

      <Text style={styles.label}>Gender (Optional)</Text>
      <View style={styles.row}>
        {['Male', 'Female', 'Other'].map(g => (
          <TouchableOpacity 
            key={g} 
            style={[styles.typeButton, gender === g && styles.typeButtonSelected]}
            onPress={() => setGender(g)}
          >
            <Text style={[styles.typeButtonText, gender === g && styles.typeButtonTextSelected]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save & Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#F8FAFC', padding: 20, paddingTop: 50, paddingBottom: 10, flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.1)', borderRadius: 20 },
  backBtnText: { color: '#0F172A', fontSize: 24, lineHeight: 28 },
  content: { padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginTop: 15, marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 5, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', padding: 12, borderRadius: 8, backgroundColor: '#FFF', color: '#0F172A' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
  typeButton: { flex: 1, paddingVertical: 12, marginHorizontal: 4, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', backgroundColor: '#fff' },
  typeButtonSelected: { backgroundColor: '#F97316', borderColor: '#F97316' },
  typeButtonText: { color: '#64748B', fontWeight: 'bold', fontSize: 13 },
  typeButtonTextSelected: { color: '#fff' },
  saveBtn: { backgroundColor: '#0F172A', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 40, marginBottom: 20 },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
