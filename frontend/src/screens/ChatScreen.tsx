import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

export const ChatScreen = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { name = 'User', role = 'User', jobTitle = 'Job Details', jobId, receiverId } = route.params || {};

  useEffect(() => {
    if (jobId && user?.uid && receiverId) {
      fetchMessages();
      
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `job_id=eq.${jobId}`
          },
          (payload) => {
            const newMsg = payload.new;
            if (
              (newMsg.sender_id === user.uid && newMsg.receiver_id === receiverId) ||
              (newMsg.sender_id === receiverId && newMsg.receiver_id === user.uid)
            ) {
              setMessages(prev => [...prev, newMsg]);
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [jobId, user?.uid, receiverId]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('job_id', jobId)
      .or(`and(sender_id.eq.${user?.uid},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user?.uid})`)
      .order('created_at', { ascending: true });
      
    if (!error && data) {
      setMessages(data);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    const newMsg = {
      job_id: jobId,
      sender_id: user?.uid,
      receiver_id: receiverId,
      content: inputText.trim()
    };
    
    setInputText('');
    const { error } = await supabase.from('messages').insert(newMsg);
    if (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => { setShowOptions(false); Keyboard.dismiss(); }}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View style={[styles.row, {justifyContent: 'space-between'}]}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 15, paddingVertical: 5 }}>
              <Text style={styles.headerTitle}>←</Text>
            </TouchableOpacity>
            <View style={styles.avatar}><Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text></View>
            <View>
              <Text style={styles.chatName}>{name} ({role})</Text>
              <Text style={styles.chatStatus}>● Online</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.optionsBtn} onPress={() => setShowOptions(!showOptions)}>
            <Text style={styles.optionsIcon}>⋮</Text>
          </TouchableOpacity>
        </View>

        {showOptions && (
          <View style={styles.optionsMenu}>
            <TouchableOpacity style={styles.optionItem}><Text style={styles.optionText}>🚫 Block User</Text></TouchableOpacity>
            <TouchableOpacity style={styles.optionItem}><Text style={[styles.optionText, {color: '#EF4444'}]}>⚠ Report User</Text></TouchableOpacity>
          </View>
        )}

        <View style={styles.contextBanner}>
          <Text style={styles.contextText}>💼 Re: {jobTitle}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.chatContent}>
        {messages.map(msg => {
          const isMe = msg.sender_id === user?.uid;
          const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return (
            <View key={msg.id} style={isMe ? styles.bubbleRight : styles.bubbleLeft}>
              <Text style={isMe ? styles.msgRight : styles.msgLeft}>{msg.content}</Text>
              <Text style={isMe ? styles.timeBgRight : styles.timeBgLeft}>{time}</Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput 
          style={styles.textInput} 
          placeholder="Type a message..." 
          placeholderTextColor="#64748B"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#0F172A', padding: 15, paddingTop: 30 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  avatar: { width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  chatName: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  chatStatus: { color: '#10B981', fontSize: 12, marginTop: 2 },
  optionsBtn: { padding: 10 },
  optionsIcon: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  optionsMenu: { position: 'absolute', top: 50, right: 15, backgroundColor: 'white', borderRadius: 8, padding: 5, zIndex: 100, elevation: 5, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84 },
  optionItem: { paddingVertical: 10, paddingHorizontal: 15 },
  optionText: { color: '#0F172A', fontSize: 14, fontWeight: '500' },
  contextBanner: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 8 },
  contextText: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },
  chatContent: { padding: 15, paddingBottom: 20 },
  bubbleLeft: { maxWidth: '75%', backgroundColor: '#F1F5F9', padding: 12, borderRadius: 12, borderTopLeftRadius: 0, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  msgLeft: { color: '#0F172A', fontSize: 14, lineHeight: 20 },
  timeBgLeft: { fontSize: 10, color: '#64748B', textAlign: 'right', marginTop: 5 },
  bubbleRight: { maxWidth: '75%', backgroundColor: '#FFF7ED', padding: 12, borderRadius: 12, borderTopRightRadius: 0, marginBottom: 15, alignSelf: 'flex-end', borderWidth: 1, borderColor: '#FFEDD5' },
  msgRight: { color: '#C2410C', fontSize: 14, lineHeight: 20 },
  timeBgRight: { fontSize: 10, color: '#FDBA74', textAlign: 'right', marginTop: 5 },
  inputArea: { flexDirection: 'row', padding: 15, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E2E8F0', alignItems: 'center' },
  textInput: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, fontSize: 14, color: '#0F172A', borderWidth: 1, borderColor: '#CBD5E1' },
  sendBtn: { width: 40, height: 40, backgroundColor: '#F97316', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  sendIcon: { color: 'white', fontSize: 16 }
});