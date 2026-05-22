import React, { useState, useEffect, createElement } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Switch, Platform, useWindowDimensions } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { differenceInMinutes } from 'date-fns';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../context/AuthContext';

let DateTimePicker: any;
let MapView: any;
let Marker: any;
let RegionType: any;

if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

const WebDatePicker = ({ value, onChange }: { value: Date, onChange: (d: Date) => void }) => {
  return createElement('input', {
    type: 'date',
    value: value.toISOString().split('T')[0],
    onChange: (e: any) => {
      if (e.target.value) {
        const d = new Date(e.target.value);
        if (!isNaN(d.getTime())) onChange(d);
      }
    },
    style: { padding: '15px', borderRadius: '8px', border: '1px solid #CBD5E1', width: '100%', fontSize: '16px', backgroundColor: 'white', color: '#0F172A', fontFamily: 'inherit', boxSizing: 'border-box' }
  });
};

const WebTimePicker = ({ value, onChange }: { value: Date, onChange: (d: Date) => void }) => {
  return createElement('input', {
    type: 'time',
    value: value.toTimeString().slice(0, 5),
    onChange: (e: any) => {
      if (e.target.value) {
        const [hours, minutes] = e.target.value.split(':');
        const newDate = new Date(value);
        newDate.setHours(parseInt(hours, 10));
        newDate.setMinutes(parseInt(minutes, 10));
        onChange(newDate);
      }
    },
    style: { padding: '15px', borderRadius: '8px', border: '1px solid #CBD5E1', width: '100%', fontSize: '16px', backgroundColor: 'white', color: '#0F172A', fontFamily: 'inherit', boxSizing: 'border-box' }
  });
};

const WebMap = ({ lat, lon, onLocationSelect }: { lat: number, lon: number, onLocationSelect: (lat: number, lon: number) => void }) => {
  const mapContainerRef = React.useRef<any>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const markerInstanceRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (Platform.OS !== 'web' || !mapContainerRef.current) return;
    
    const initMap = () => {
      const L = (window as any).L;
      if (!L || mapInstanceRef.current) return;
      
      const map = L.map(mapContainerRef.current).setView([lat, lon], 13);
      mapInstanceRef.current = map;
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map);
      
      const marker = L.marker([lat, lon], { draggable: true }).addTo(map);
      markerInstanceRef.current = marker;
      
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onLocationSelect(pos.lat, pos.lng);
      });
      
      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      });
    };

    if (!(window as any).L) {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css'; link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    if (mapInstanceRef.current && markerInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lon], 13);
      markerInstanceRef.current.setLatLng([lat, lon]);
    }
  }, [lat, lon]);

  return createElement('div', {
    ref: mapContainerRef,
    style: { width: '100%', height: '100%', borderRadius: '10px', zIndex: 1 }
  });
};

type WorkType = 'Hourly' | 'Daily' | 'Monthly' | '';

const CATEGORIES = [
  { name: "Delivery", icon: "🛵" }, { name: "Driver", icon: "🚗" }, { name: "Cook", icon: "👨‍🍳" }, 
  { name: "Cleaner", icon: "🧹" }, { name: "Plumber", icon: "🔧" }, { name: "Electrician", icon: "⚡" },
  { name: "Carpenter", icon: "🪚" }, { name: "Painter", icon: "🎨" }, { name: "Security Guard", icon: "🛡️" }, 
  { name: "Waiter", icon: "🍽️" }, { name: "Bartender", icon: "🍸" }, { name: "Cashier", icon: "💵" }, 
  { name: "Receptionist", icon: "📞" }, { name: "Sales", icon: "🛍️" }, { name: "Telecaller", icon: "🎧" }, 
  { name: "Maid", icon: "🧹" }, { name: "Babysitter", icon: "👶" }, { name: "Nurse/Caregiver", icon: "⚕️" }, 
  { name: "Beautician", icon: "💅" }, { name: "Gym Trainer", icon: "🏋️" }, { name: "Tutor", icon: "📚" }, 
  { name: "Event Helper", icon: "🎪" }, { name: "Warehouse/Loader", icon: "📦" }, { name: "Helper/Laborer", icon: "👷" }, 
  { name: "Other", icon: "💼" }
];

export const DynamicJobForm = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;
  const contentMaxWidth = 800;

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
       title: '', category: '', description: '', workType: 'Hourly' as WorkType,
       genderPref: 'Any', city: '',
       totalAmount: '', dailyWage: '', monthlySalary: '',
       numberOfDays: '', daysPerWeek: '',
       contactMethod: 'In-App Chat', isPublic: true, acceptTerms: false
    }
  });

  const selectedWorkType = watch('workType');
  const selectedCategory = watch('category');
  const selectedGender = watch('genderPref');

  // Custom States for Better Reactivity
  const [personsCount, setPersonsCount] = useState(1);
  const [isLive, setIsLive] = useState(true);
  const [isUrgent, setIsUrgent] = useState(false);

  // Date and Time States
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDate, setShowStartDate] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [showStartTime, setShowStartTime] = useState(false);
  const [endTime, setEndTime] = useState(new Date(new Date().getTime() + 60 * 60 * 1000)); // +1 hour initially
  const [showEndTime, setShowEndTime] = useState(false);
  
  const [computedHours, setComputedHours] = useState('1.0');

  useEffect(() => {
    // Calculate difference when times change
    const diff = differenceInMinutes(endTime, startTime);
    if (diff > 0) {
      setComputedHours((diff / 60).toFixed(1));
    } else if (diff < 0) {
      // Handles overnight shift if end time is next day
      setComputedHours(((diff + 24 * 60) / 60).toFixed(1));
    } else {
      setComputedHours('0');
    }
  }, [startTime, endTime]);

  // Map & Location States
  const [mapRegion, setMapRegion] = useState<any>({
    latitude: 17.3850, longitude: 78.4867, latitudeDelta: 0.05, longitudeDelta: 0.05
  });
  const [markerCoord, setMarkerCoord] = useState({ latitude: 17.3850, longitude: 78.4867 });
  const { user } = useAuth();

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    const newCoords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
    setMapRegion({ ...newCoords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
    setMarkerCoord(newCoords);
  };

  const [pinnedAddress, setPinnedAddress] = useState('Fetching address...');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setPinnedAddress('Fetching address...');
      try {
        let geocode = await Location.reverseGeocodeAsync({
          latitude: markerCoord.latitude,
          longitude: markerCoord.longitude
        });
        if (geocode.length > 0 && isMounted) {
          const g = geocode[0];
          const parts = [g.name, g.street, g.subregion, g.city, g.region, g.postalCode, g.country].filter(Boolean);
          const uniqueParts = Array.from(new Set(parts));
          setPinnedAddress(uniqueParts.join(', '));
        } else {
          throw new Error('No geocode');
        }
      } catch (e) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${markerCoord.latitude}&lon=${markerCoord.longitude}`);
          const data = await res.json();
          if (data && data.display_name && isMounted) {
             setPinnedAddress(data.display_name);
          } else {
            if (isMounted) setPinnedAddress('Location pinned');
          }
        } catch (err) {
          if (isMounted) setPinnedAddress('Location pinned');
        }
      }
    })();
    return () => { isMounted = false; };
  }, [markerCoord]);

  const onSubmit = async (data: any) => {
    const finalPayload = {
      provider_id: user?.uid || null,
      title: data.title,
      category: data.category || 'Other',
      description: data.description || '',
      requirements: data.requirements ? data.requirements.split(',').map((r: string) => r.trim()) : [],
      hourly_rate: selectedWorkType === 'Hourly' ? data.amount : null,
      daily_rate: selectedWorkType === 'Daily' ? data.amount : null,
      monthly_rate: selectedWorkType === 'Monthly' ? data.amount : null,
      start_date: startDate.toISOString(),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      latitude: markerCoord.latitude,
      longitude: markerCoord.longitude,
      location_name: pinnedAddress,
      urgency_score: isUrgent ? 10.0 : 5.0
    };
    
    console.log('Submitting Job Form:', finalPayload);
    
    const { error } = await supabase.from('jobs').insert(finalPayload);
    
    if (error) {
      alert('Error posting job: ' + error.message);
    } else {
      alert('Job Posted Successfully!');
      navigation.goBack();
    }
  };

  return (
    <ScrollView style={{ backgroundColor: '#F8FAFC' }} contentContainerStyle={[styles.container, { alignItems: 'center' }]}>
      <View style={{ width: '100%', maxWidth: contentMaxWidth }}>
      
      {/* 1. BASIC JOB DETAILS */}
      <Text style={styles.sectionTitle}>1. Basic Details</Text>
      
      <Text style={styles.label}>Job Title *</Text>
      <Controller control={control} name="title" rules={{ required: true }} render={({ field: { onChange, value } }) => (
        <TextInput style={styles.input} placeholder="e.g. Delivery Boy Needed" value={value} onChangeText={onChange} />
      )}/>

      <Text style={styles.label}>Job Category *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity 
            key={cat.name} 
            style={[styles.chip, selectedCategory === cat.name && styles.chipSelected]}
            onPress={() => setValue('category', cat.name)}
          >
            <Text style={[styles.chipText, selectedCategory === cat.name && styles.chipTextSelected]}>{cat.icon} {cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Job Description</Text>
      <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
        <TextInput style={[styles.input, styles.textArea]} placeholder="Explain the work clearly..." value={value} onChangeText={onChange} multiline numberOfLines={4} />
      )}/>

      {/* 2. REQUIREMENTS & STATUS */}
      <Text style={styles.sectionTitle}>2. Requirements & Status</Text>

      <Text style={styles.label}>Gender Preference</Text>
      <View style={styles.row}>
        {['Any', 'Male', 'Female'].map(gen => (
          <TouchableOpacity 
            key={gen} 
            style={[styles.typeButton, selectedGender === gen && styles.typeButtonSelected]}
            onPress={() => setValue('genderPref', gen)}
          >
            <Text style={[styles.typeButtonText, selectedGender === gen && styles.typeButtonTextSelected]}>{gen}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.rowAlign}>
        <Text style={styles.labelLine}>Persons Required</Text>
        <View style={styles.counterRow}>
          <TouchableOpacity style={styles.counterBtn} onPress={() => setPersonsCount(Math.max(1, personsCount - 1))}>
            <Text style={styles.counterBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.counterValue}>{personsCount}</Text>
          <TouchableOpacity style={styles.counterBtn} onPress={() => setPersonsCount(personsCount + 1)}>
            <Text style={styles.counterBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.helperText}>Application auto-closes when requirement is fulfilled.</Text>

      <View style={styles.switchRowLine}>
         <Text style={styles.labelLineBold}>🔥 Mark as Urgent (Alert nearby)</Text>
         <Switch value={isUrgent} onValueChange={setIsUrgent} trackColor={{ false: "#767577", true: "#EF4444" }} thumbColor={isUrgent ? "#fff" : "#f4f3f4"} />
      </View>

      <View style={styles.switchRowLine}>
         <Text style={styles.labelLineBold}>{isLive ? '🟢 Application is Live' : '🔴 Application Stopped'}</Text>
         <Switch value={isLive} onValueChange={setIsLive} trackColor={{ false: "#767577", true: "#10B981" }} thumbColor={isLive ? "#fff" : "#f4f3f4"} />
      </View>


      {/* 3. WORK TYPE & SCHEDULE */}
      <Text style={styles.sectionTitle}>3. Work Type & Schedule</Text>
      <View style={styles.row}>
        {['Hourly', 'Daily', 'Monthly'].map(type => (
          <TouchableOpacity 
            key={type} 
            style={[styles.typeButton, selectedWorkType === type && styles.typeButtonSelected]}
            onPress={() => setValue('workType', type as WorkType)}
          >
            <Text style={[styles.typeButtonText, selectedWorkType === type && styles.typeButtonTextSelected]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.dynamicSection}>
        <View style={styles.row}>
            <View style={{flex: 1, marginRight: 5}}>
                <Text style={styles.labelSection}>Start Date</Text>
                {Platform.OS === 'web' ? (
                  <WebDatePicker value={startDate} onChange={setStartDate} />
                ) : (
                  <>
                    <TouchableOpacity onPress={() => setShowStartDate(true)} style={styles.pickerBtn}>
                      <Text style={styles.pickerText}>{startDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                    {showStartDate && DateTimePicker && (
                      <DateTimePicker value={startDate} mode="date" display="default" 
                        onChange={(_: any, date: any) => { setShowStartDate(false); if (date) setStartDate(date); }} 
                      />
                    )}
                  </>
                )}
            </View>
        </View>

        <View style={styles.row}>
            <View style={{flex: 1, marginRight: 5}}>
                <Text style={styles.labelSection}>Start Shift Time</Text>
                {Platform.OS === 'web' ? (
                  <WebTimePicker value={startTime} onChange={setStartTime} />
                ) : (
                  <>
                    <TouchableOpacity onPress={() => setShowStartTime(true)} style={styles.pickerBtn}>
                      <Text style={styles.pickerText}>{startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                    </TouchableOpacity>
                    {showStartTime && DateTimePicker && (
                      <DateTimePicker value={startTime} mode="time" display="default" 
                        onChange={(_: any, date: any) => { setShowStartTime(false); if (date) setStartTime(date); }} 
                      />
                    )}
                  </>
                )}
            </View>
            <View style={{flex: 1, marginLeft: 5}}>
                <Text style={styles.labelSection}>End Shift Time</Text>
                {Platform.OS === 'web' ? (
                  <WebTimePicker value={endTime} onChange={setEndTime} />
                ) : (
                  <>
                    <TouchableOpacity onPress={() => setShowEndTime(true)} style={styles.pickerBtn}>
                      <Text style={styles.pickerText}>{endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                    </TouchableOpacity>
                    {showEndTime && DateTimePicker && (
                      <DateTimePicker value={endTime} mode="time" display="default" 
                        onChange={(_: any, date: any) => { setShowEndTime(false); if (date) setEndTime(date); }} 
                      />
                    )}
                  </>
                )}
            </View>
        </View>

        {selectedWorkType === 'Hourly' && (
          <View style={styles.highlightBox}>
            <Text style={styles.highlightTitle}>Total Calculated Time: {computedHours} Hours</Text>
            <Text style={styles.labelSection}>Total Amount (₹) for {computedHours} hr</Text>
            <Controller control={control} name="totalAmount" render={({ field: { onChange, value } }) => (
              <TextInput style={styles.inputWhite} placeholder="e.g. 600" keyboardType="numeric" value={value} onChangeText={onChange} />
            )}/>
          </View>
        )}

        {selectedWorkType === 'Daily' && (
          <>
            <Text style={styles.labelSection}>Number of Days</Text>
            <Controller control={control} name="numberOfDays" render={({ field: { onChange, value } }) => (
              <TextInput style={styles.inputWhite} placeholder="e.g. 3" keyboardType="numeric" value={value} onChangeText={onChange} />
            )}/>
            <Text style={styles.labelSection}>Total Daily Rate (₹)</Text>
            <Controller control={control} name="dailyWage" render={({ field: { onChange, value } }) => (
              <TextInput style={styles.inputWhite} placeholder="e.g. 800" keyboardType="numeric" value={value} onChangeText={onChange} />
            )}/>
          </>
        )}

        {selectedWorkType === 'Monthly' && (
          <>
            <Text style={styles.labelSection}>Days per Week</Text>
            <Controller control={control} name="daysPerWeek" render={({ field: { onChange, value } }) => (
              <TextInput style={styles.inputWhite} placeholder="e.g. 6" keyboardType="numeric" value={value} onChangeText={onChange} />
            )}/>
            <Text style={styles.labelSection}>Monthly Salary (₹)</Text>
            <Controller control={control} name="monthlySalary" render={({ field: { onChange, value } }) => (
              <TextInput style={styles.inputWhite} placeholder="e.g. 18000" keyboardType="numeric" value={value} onChangeText={onChange} />
            )}/>
          </>
        )}
      </View>

      {/* 4. LOCATION */}
      <Text style={styles.sectionTitle}>4. Location</Text>
      
      <TouchableOpacity style={styles.gpsBtn} onPress={getCurrentLocation}>
        <Text style={styles.gpsBtnText}>📍 Use My Current Location</Text>
      </TouchableOpacity>

      <Text style={styles.helperText}>Drag the pin to precisely set the job location</Text>
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <WebMap 
            lat={markerCoord.latitude} 
            lon={markerCoord.longitude} 
            onLocationSelect={(lat, lon) => setMarkerCoord({ latitude: lat, longitude: lon })} 
          />
        ) : MapView && Marker ? (
          <MapView 
            style={styles.map} 
            region={mapRegion}
            onRegionChangeComplete={setMapRegion}
          >
            <Marker 
              coordinate={markerCoord} 
              draggable 
              onDragEnd={(e: any) => setMarkerCoord(e.nativeEvent.coordinate)}
            />
          </MapView>
        ) : (
          <View style={[styles.map, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text>Map is not supported.</Text>
          </View>
        )}
      </View>
      <View style={{ backgroundColor: '#F1F5F9', padding: 12, borderRadius: 8, marginTop: 10, flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, marginRight: 8 }}>📍</Text>
        <Text style={{ flex: 1, color: '#0F172A', fontSize: 14, fontWeight: '500' }}>{pinnedAddress}</Text>
      </View>

      {/* 5. TRUST & CONTACT */}
      <Text style={styles.sectionTitle}>5. Trust & Contact</Text>
      
      <View style={styles.verificationBadge}>
        <Text style={styles.verificationText}>✓ Phone Verified Employer</Text>
      </View>

      <Text style={styles.labelSection}>Preferred Contact Method</Text>
      <View style={styles.row}>
        {['In-App Chat', 'Phone Call', 'WhatsApp'].map(method => (
          <TouchableOpacity 
            key={method} 
            style={[styles.typeButton, watch('contactMethod') === method && styles.typeButtonSelected]}
            onPress={() => setValue('contactMethod', method)}
          >
            <Text style={[styles.typeButtonText, watch('contactMethod') === method && styles.typeButtonTextSelected]}>{method}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 6. FINAL ACTIONS */}
      <Text style={styles.sectionTitle}>6. Final Actions</Text>
      
      <View style={styles.switchRowLine}>
         <Text style={styles.labelLineBold}>Public Job (Visible to all)</Text>
         <Switch value={watch('isPublic') ?? true} onValueChange={(v) => setValue('isPublic', v)} trackColor={{ false: "#767577", true: "#10B981" }} thumbColor={"#fff"} />
      </View>

      <TouchableOpacity 
        style={styles.checkboxRow} 
        onPress={() => setValue('acceptTerms', !watch('acceptTerms'))}
      >
        <View style={[styles.checkbox, watch('acceptTerms') && styles.checkboxChecked]}>
          {watch('acceptTerms') && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxText}>I accept the Terms & Conditions</Text>
      </TouchableOpacity>

      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={styles.draftBtn}>
          <Text style={styles.draftBtnText}>Save Draft</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.previewBtn}>
          <Text style={styles.previewBtnText}>Preview</Text>
        </TouchableOpacity>
      </View>

      {/* SUBMIT */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit(onSubmit)}>
         <Text style={styles.submitBtnText}>Post Job</Text>
      </TouchableOpacity>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F8FAFC', flexGrow: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginTop: 25, marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 5, marginTop: 10 },
  labelSection: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 5, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', padding: 12, borderRadius: 8, backgroundColor: '#F1F5F9', color: '#0F172A' },
  inputWhite: { borderWidth: 1, borderColor: '#E2E8F0', padding: 12, borderRadius: 8, backgroundColor: '#FFF', color: '#0F172A' },
  textArea: { height: 80, textAlignVertical: 'top' },
  categoryScroll: { flexDirection: 'row', marginBottom: 10, marginTop: 5 },
  chip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', marginRight: 10, flexDirection: 'row', alignItems: 'center' },
  chipSelected: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  chipText: { color: '#475569', fontSize: 14, fontWeight: '500' },
  chipTextSelected: { color: '#FFF' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
  rowAlign: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 5 },
  labelLine: { fontSize: 15, color: '#0F172A', fontWeight: '600', flex: 1 },
  labelLineBold: { fontSize: 14, color: '#0F172A', fontWeight: 'bold' },
  counterRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1' },
  counterBtn: { paddingHorizontal: 15, paddingVertical: 8 },
  counterBtnText: { fontSize: 20, fontWeight: 'bold', color: '#F97316' },
  counterValue: { fontSize: 16, fontWeight: 'bold', minWidth: 30, textAlign: 'center', color: '#0F172A' },
  switchRowLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, backgroundColor: '#FFF', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  helperText: { fontSize: 12, color: '#64748B', marginTop: 5, marginBottom: 5 },
  typeButton: { flex: 1, paddingVertical: 12, marginHorizontal: 4, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center', backgroundColor: '#fff' },
  typeButtonSelected: { backgroundColor: '#F97316', borderColor: '#F97316' },
  typeButtonText: { color: '#64748B', fontWeight: 'bold', fontSize: 13 },
  typeButtonTextSelected: { color: '#fff' },
  dynamicSection: { backgroundColor: '#E2E8F0', padding: 15, borderRadius: 10, marginTop: 10 },
  pickerBtn: { backgroundColor: '#FFF', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1' },
  pickerText: { color: '#0F172A', fontSize: 14, fontWeight: '500', textAlign: 'center' },
  highlightBox: { backgroundColor: '#FFF7ED', padding: 15, borderRadius: 8, marginTop: 15, borderWidth: 1, borderColor: '#FDBA74' },
  highlightTitle: { color: '#C2410C', fontWeight: 'bold', fontSize: 15, textAlign: 'center', marginBottom: 10 },
  gpsBtn: { backgroundColor: '#DBEAFE', borderWidth: 1, borderColor: '#93C5FD', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  gpsBtnText: { color: '#1E40AF', fontWeight: 'bold', fontSize: 14 },
  mapContainer: { height: 200, width: '100%', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#CBD5E1', marginVertical: 10 },
  map: { flex: 1 },
  verificationBadge: { backgroundColor: '#ECFDF5', borderColor: '#10B981', borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 15 },
  verificationText: { color: '#10B981', fontWeight: 'bold', textAlign: 'center' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15, marginBottom: 10 },
  checkbox: { width: 24, height: 24, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 4, marginRight: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  checkboxChecked: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  checkmark: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  checkboxText: { color: '#334155', fontSize: 14 },
  actionButtonsRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  draftBtn: { flex: 1, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center' },
  draftBtnText: { color: '#475569', fontWeight: 'bold' },
  previewBtn: { flex: 1, padding: 15, borderRadius: 8, backgroundColor: '#F1F5F9', alignItems: 'center' },
  previewBtnText: { color: '#0F172A', fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#0F172A', padding: 18, borderRadius: 8, alignItems: 'center', marginTop: 15, marginBottom: 40 },
  submitBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});