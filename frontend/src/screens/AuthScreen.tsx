import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';

export const AuthScreen = () => {
  const { mockLogin } = useAuth() as any; 
  const { setProfileStatus } = useProfile();
  
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [otpSent, setOtpSent] = useState(false);

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
    setOtpSent(false); // reset flow when toggling
  };

  const handleVerifyOTP = () => {
    // If they clicked "Login" -> Existing User -> Bypasses Profile Setup
    if (mode === 'login') {
      setProfileStatus(true);
    } 
    // If they clicked "Sign Up" -> New User -> Forces Profile Setup
    else {
      setProfileStatus(false);
    }
    
    mockLogin();
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoIcon}>⚡</Text>
        <Text style={styles.logoText}>GigWork</Text>
      </View>

      <Text style={styles.title}>
        {mode === 'login' ? 'Welcome back' : 'Create an Account'}
      </Text>
      <Text style={styles.subtitle}>
        {mode === 'login' ? 'Sign in to continue' : 'Join GigWork today'}
      </Text>

      <View style={styles.formGroup}>
        {!otpSent ? (
          <>
            <Text style={styles.label}>Phone number</Text>
            <TextInput 
              style={styles.input} 
              placeholder="+91 98765 43210" 
              keyboardType="phone-pad" 
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setOtpSent(true)}>
              <Text style={styles.primaryBtnText}>Send OTP</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>Enter OTP</Text>
            <TextInput 
              style={styles.input} 
              placeholder="123456" 
              keyboardType="number-pad" 
              maxLength={6}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyOTP}>
              <Text style={styles.primaryBtnText}>Verify OTP</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity onPress={toggleMode}>
        <Text style={[styles.subtitle, { marginTop: 20 }]}>
          {mode === 'login' ? (
            <>New user? <Text style={{fontWeight: 'bold', color: '#0F172A'}}>Sign Up</Text></>
          ) : (
            <>Already have an account? <Text style={{fontWeight: 'bold', color: '#0F172A'}}>Login</Text></>
          )}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    fontSize: 40,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 30,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    color: '#0F172A',
  },
  primaryBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
