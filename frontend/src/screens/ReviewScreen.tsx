import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type ReviewRouteProp = RouteProp<RootStackParamList, 'Review'>;

export const ReviewScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<ReviewRouteProp>();
  const { user } = useAuth();
  
  // If we just navigated directly, ensure we have these params. 
  // applicationId: the specific job app, revieweeId: who is getting rated, jobId: the job context
  const { applicationId, revieweeId, jobId } = route.params;

  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [reportAbuse, setReportAbuse] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user?.uid) return;
    setSubmitting(true);
    
    // 1. Mark application as Completed
    const { error: appError } = await supabase
      .from('applications')
      .update({ status: 'Completed' })
      .eq('id', applicationId);
      
    if (appError) {
      alert("Error finalizing job: " + appError.message);
      setSubmitting(false);
      return;
    }
    
    // 2. Fetch Reviewer Name
    const { data: reviewerData } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.uid)
      .single();
      
    const reviewerName = reviewerData?.name || 'Anonymous';
    
    const finalFeedback = reportAbuse ? `[REPORTED ABUSE] ${feedback}` : feedback;

    // 3. Insert Review
    const { error: reviewError } = await supabase
      .from('reviews')
      .insert({
        profile_id: revieweeId,
        reviewer_name: reviewerName,
        rating: rating,
        message: finalFeedback,
        date: new Date().toLocaleDateString()
      });
      
    if (reviewError) {
      alert("Error submitting review: " + reviewError.message);
      setSubmitting(false);
      return;
    }

    // 4. Update reviewee's average rating & jobs completed
    // Since we don't have a backend function calculating average, we do a basic approximation or full fetch.
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('profile_id', revieweeId);
      
    if (allReviews) {
      const sum = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
      const avg = sum / allReviews.length;
      
      await supabase
        .from('profiles')
        .update({ 
          rating: avg, 
          jobs_completed: allReviews.length // Or fetch from applications completed
        })
        .eq('id', revieweeId);
    }
    
    setSubmitting(false);
    alert('Thank you! Your review has been submitted.');
    // Go back to the root of whatever stack they are in
    navigation.popToTop();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave a Review</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Job Completed! 🎉</Text>
        <Text style={styles.subtitle}>Please leave a review for the other party. This helps maintain trust in our community.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Rate your experience</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Text style={star <= rating ? styles.starFilled : styles.starEmpty}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Written Feedback</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={4}
            placeholder="How was it working with them? (Required)"
            placeholderTextColor="#94A3B8"
            value={feedback}
            onChangeText={setFeedback}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity 
          style={styles.checkboxRow} 
          onPress={() => setReportAbuse(!reportAbuse)}
        >
          <View style={[styles.checkbox, reportAbuse && styles.checkboxChecked]}>
            {reportAbuse && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View>
            <Text style={styles.checkboxText}>Report Abuse / Issue</Text>
            <Text style={styles.checkboxSub}>Check this if the user violated our terms</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.submitBtn, (!feedback.trim() || submitting) && styles.submitBtnDisabled]} 
          onPress={handleSubmit}
          disabled={!feedback.trim() || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Review</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0F172A', padding: 20, paddingTop: 50, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  backBtnText: { color: 'white', fontSize: 24, lineHeight: 28 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 30, paddingHorizontal: 20, lineHeight: 22 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  label: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 15 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center' },
  starFilled: { fontSize: 40, color: '#F59E0B', marginHorizontal: 5 },
  starEmpty: { fontSize: 40, color: '#E2E8F0', marginHorizontal: 5 },
  textInput: { backgroundColor: '#F1F5F9', borderRadius: 8, padding: 15, fontSize: 15, color: '#0F172A', minHeight: 100, borderWidth: 1, borderColor: '#CBD5E1' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingHorizontal: 10 },
  checkbox: { width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: '#CBD5E1', marginRight: 15, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  checkmark: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  checkboxText: { fontSize: 16, fontWeight: 'bold', color: '#EF4444' },
  checkboxSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  bottomBar: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  submitBtn: { backgroundColor: '#F97316', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#FDBA74' },
  submitBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
