import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Platform, Dimensions, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const categories = [
  { id: 'work', name: 'งาน', color: '#3b82f6', icon: 'briefcase', emoji: '💼' },
  { id: 'personal', name: 'ส่วนตัว', color: '#10b981', icon: 'home', emoji: '🏠' },
  { id: 'health', name: 'สุขภาพ', color: '#f59e0b', icon: 'run', emoji: '🏃' },
  { id: 'study', name: 'การเรียน', color: '#8b5cf6', icon: 'book', emoji: '📚' },
  { id: 'general', name: 'ทั่วไป', color: '#6b7280', icon: 'note', emoji: '📝' }
];
const priorities = [
  { id: 'high', name: 'สูง', color: '#ef4444' },
  { id: 'medium', name: 'ปานกลาง', color: '#f59e0b' },
  { id: 'low', name: 'ต่ำ', color: '#10b981' }
];

export default function App() {
  useEffect(() => {
    Notifications.requestPermissionsAsync();
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }, []);
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('medium');
  const [showStats, setShowStats] = useState(false);

  const addTask = async () => {
    if (task.trim() === '') {
      Alert.alert('กรุณากรอกกิจกรรม');
      return;
    }
    const newTask = {
      key: Date.now().toString(),
      name: task,
      date: date,
      category,
      priority,
      done: false,
    };
    setTasks([...tasks, newTask]);
    setTask('');
    setCategory('general');
    setPriority('medium');
    setDate(new Date());
    // ตั้งเวลาแจ้งเตือน
    const trigger = date > new Date() ? { type: 'date', date } : null;
    if (trigger) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'แจ้งเตือนกิจกรรม',
          body: `ถึงเวลาทำ: ${task}`,
        },
        trigger,
      });
    }
  };

  const markDone = (key) => {
    setTasks(tasks.map(t => t.key === key ? { ...t, done: !t.done } : t));
  };

  const onChangeDate = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  // สถิติ
  const stats = {
    total: tasks.length,
    realtimeClock: {
        textAlign: 'center',
        fontSize: Math.max(16, 18 * scale),
        color: '#636e72',
        marginBottom: Math.max(8, 12 * scale),
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    completed: tasks.filter(t => t.done).length,
    pending: tasks.filter(t => !t.done).length,
    today: tasks.filter(t => {
      const d = new Date(t.date);
      const now = new Date();
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length
  };
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My life Balance</Text>
      <TouchableOpacity style={styles.statsBtn} onPress={() => setShowStats(!showStats)}>
        <Ionicons name="stats-chart" size={28} color="#636e72" />
      </TouchableOpacity>
      {showStats && (
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statsItem}><Ionicons name="list" size={24} color="#636e72" /><Text style={styles.statsText}>ทั้งหมด: {stats.total}</Text></View>
            <View style={styles.statsItem}><Ionicons name="checkmark-circle" size={24} color="#00b894" /><Text style={styles.statsText}>เสร็จแล้ว: {stats.completed}</Text></View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statsItem}><Ionicons name="time" size={24} color="#f59e0b" /><Text style={styles.statsText}>ค้าง: {stats.pending}</Text></View>
            <View style={styles.statsItem}><Ionicons name="calendar" size={24} color="#8b5cf6" /><Text style={styles.statsText}>วันนี้: {stats.today}</Text></View>
          </View>
          <View style={styles.statsRow}><Text style={styles.statsText}>ความสำเร็จ: {completionRate}%</Text></View>
        </View>
      )}
      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="เพิ่มกิจกรรมของวันนี้"
          value={task}
          onChangeText={setTask}
          placeholderTextColor="#b2bec3"
        />
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)}>
            <Ionicons name="calendar" size={18} color="#fff" />
            <Text style={styles.dateBtnText}> เลือกวันที่และเวลา</Text>
          </TouchableOpacity>
          <Text style={styles.dateText}>
            {date.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
          </Text>
        </View>
        {showPicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            display="default"
            onChange={onChangeDate}
          />
        )}
        <View style={styles.selectRowWrap}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>หมวดหมู่</Text>
            <View style={styles.categoryScroll}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCard, category === cat.id && { backgroundColor: cat.color, shadowColor: cat.color, shadowOpacity: 0.25, elevation: 4 }]}
                  onPress={() => setCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name={cat.icon} size={22} color={category === cat.id ? '#fff' : cat.color} style={{ marginRight: 6 }} />
                  <Text style={[styles.categoryText, category === cat.id && { color: '#fff', fontWeight: 'bold' }]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.selectRowWrap}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>ความสำคัญ</Text>
            <View style={styles.selectRow}>
              {priorities.map(p => (
                <TouchableOpacity key={p.id} style={[styles.prioBtn, priority === p.id && { backgroundColor: p.color, shadowColor: p.color, shadowOpacity: 0.2, elevation: 2 }]} onPress={() => setPriority(p.id)}>
                  <Ionicons name={p.id === 'high' ? 'alert' : p.id === 'medium' ? 'warning' : 'checkmark'} size={18} color={priority === p.id ? '#fff' : p.color} />
                  <Text style={[styles.prioBtnText, priority === p.id && { color: '#fff', fontWeight: 'bold' }]}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={addTask}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.addBtnText}> เพิ่มกิจกรรม</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>กิจกรรมที่ต้องทำ</Text>
      <FlatList
        data={tasks.filter(t => !t.done).sort((a, b) => new Date(a.date) - new Date(b.date))}
        ListEmptyComponent={<Text style={styles.emptyText}>ไม่มีรายการกิจกรรม</Text>}
        renderItem={({ item }) => {
          const cat = categories.find(c => c.id === item.category) || categories[4];
          const prio = priorities.find(p => p.id === item.priority) || priorities[1];
          return (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name={cat.icon} size={18} color={cat.color} />
                  <Text style={[styles.catBtnText, { color: cat.color, marginLeft: 4 }]}>{cat.name}</Text>
                  <Ionicons name={item.priority === 'high' ? 'alert' : item.priority === 'medium' ? 'warning' : 'checkmark'} size={16} color={prio.color} style={{ marginLeft: 8 }} />
                  <Text style={[styles.prioBtnText, { color: prio.color, marginLeft: 2 }]}>{prio.name}</Text>
                </View>
                <Text style={styles.task}>{item.name}</Text>
                <Text style={styles.dateSmall}>
                  {new Date(item.date).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                </Text>
              </View>
              <TouchableOpacity style={styles.doneBtn} onPress={() => markDone(item.key)}>
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={styles.doneBtnText}> เสร็จแล้ว</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        style={{ marginBottom: 16 }}
      />
      <Text style={styles.sectionTitle}>กิจกรรมที่เสร็จแล้ว</Text>
      <FlatList
        data={tasks.filter(t => t.done).sort((a, b) => new Date(a.date) - new Date(b.date))}
        ListEmptyComponent={<Text style={styles.emptyText}>ยังไม่มีรายการที่เสร็จ</Text>}
        renderItem={({ item }) => {
          const cat = categories.find(c => c.id === item.category) || categories[4];
          const prio = priorities.find(p => p.id === item.priority) || priorities[1];
          return (
            <View style={styles.cardDone}>
              <View style={{ flex: 1 }}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name={cat.icon} size={18} color={cat.color} />
                  <Text style={[styles.catBtnText, { color: cat.color, marginLeft: 4 }]}>{cat.name}</Text>
                  <Ionicons name={item.priority === 'high' ? 'alert' : item.priority === 'medium' ? 'warning' : 'checkmark'} size={16} color={prio.color} style={{ marginLeft: 8 }} />
                  <Text style={[styles.prioBtnText, { color: prio.color, marginLeft: 2 }]}>{prio.name}</Text>
                </View>
                <Text style={styles.done}>{item.name}</Text>
                <Text style={styles.dateSmall}>
                  {new Date(item.date).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                </Text>
              </View>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => markDone(item.key)}>
                <Ionicons name="arrow-undo" size={18} color="#fff" />
                <Text style={styles.cancelBtnText}> ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
      <Text style={styles.summary}>
        ทำสำเร็จ {tasks.filter(t => t.done).length} / {tasks.length} รายการ
      </Text>
    </View>
  );
}

const { width, height } = Dimensions.get('window');
const scale = width / 375; // iPhone 11 base width
const styles = StyleSheet.create({
  categoryScroll: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 6,
    paddingBottom: 2,
    flexWrap: 'wrap',
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f2f6',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 6,
    shadowColor: '#636e72',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryText: {
    fontSize: 16,
    color: '#636e72',
    marginLeft: 2,
  },
  pickerWrap: {
    backgroundColor: '#f1f2f6',
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    overflow: 'hidden',
  },
  picker: {
    height: 40,
    color: '#636e72',
    fontSize: 16,
    width: '100%',
  },
  pickerItem: {
    fontSize: 16,
    color: '#636e72',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  selectRowWrap: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  statsBtn: {
    alignSelf: 'flex-end',
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#636e72',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 3,
    elevation: 2,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#636e72',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 3,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsText: {
    fontSize: 16,
    color: '#636e72',
    marginLeft: 4,
  },
  label: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  selectRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f2f6',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 4,
  },
  catBtnText: {
    fontSize: 14,
    marginLeft: 2,
    color: '#636e72',
  },
  prioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f2f6',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 4,
  },
  prioBtnText: {
    fontSize: 14,
    marginLeft: 2,
    color: '#636e72',
  },
  container: {
    flex: 1,
    padding: Math.max(12, 16 * scale),
    backgroundColor: '#f5f6fa',
  },
  title: {
    fontSize: Math.max(28, 36 * scale),
    fontWeight: 'bold',
    marginBottom: Math.max(8, 12 * scale),
    marginTop: Math.max(24, 40 * scale),
    color: '#0984e3',
    textAlign: 'center',
    letterSpacing: 1,
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: Math.max(10, 16 * scale),
    padding: Math.max(10, 16 * scale),
    marginBottom: Math.max(10, 16 * scale),
    shadowColor: '#636e72',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dfe6e9',
    padding: Math.max(8, 12 * scale),
    borderRadius: Math.max(8, 12 * scale),
    fontSize: Math.max(16, 18 * scale),
    marginBottom: Math.max(6, 8 * scale),
    backgroundColor: '#f9f9f9',
    color: '#2d3436',
  },
  dateBtn: {
    backgroundColor: '#00b894',
    borderRadius: Math.max(6, 8 * scale),
    paddingVertical: Math.max(6, 8 * scale),
    paddingHorizontal: Math.max(8, 12 * scale),
    alignSelf: 'flex-start',
    marginBottom: Math.max(2, 4 * scale),
  },
  dateBtnText: {
    color: '#fff',
    fontSize: Math.max(14, 16 * scale),
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: Math.max(14, 16 * scale),
    color: '#636e72',
    marginBottom: Math.max(6, 8 * scale),
    textAlign: 'center',
  },
  addBtn: {
    backgroundColor: '#0984e3',
    borderRadius: Math.max(6, 8 * scale),
    paddingVertical: Math.max(8, 10 * scale),
    alignItems: 'center',
    marginTop: Math.max(2, 4 * scale),
  },
  addBtnText: {
    color: '#fff',
    fontSize: Math.max(16, 18 * scale),
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: Math.max(18, 22 * scale),
    fontWeight: 'bold',
    color: '#636e72',
    marginBottom: Math.max(6, 8 * scale),
    marginTop: Math.max(6, 8 * scale),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: Math.max(8, 12 * scale),
    padding: Math.max(10, 16 * scale),
    marginBottom: Math.max(6, 10 * scale),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#636e72',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 3,
    elevation: 2,
  },
  cardDone: {
    backgroundColor: '#dff9fb',
    borderRadius: Math.max(8, 12 * scale),
    padding: Math.max(10, 16 * scale),
    marginBottom: Math.max(6, 10 * scale),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#636e72',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 3,
    elevation: 2,
  },
  task: {
    fontSize: Math.max(16, 20 * scale),
    color: '#2d3436',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  done: {
    fontSize: Math.max(16, 20 * scale),
    textDecorationLine: 'line-through',
    color: '#00b894',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  dateSmall: {
    fontSize: Math.max(12, 14 * scale),
    color: '#636e72',
  },
  doneBtn: {
    backgroundColor: '#00b894',
    borderRadius: Math.max(6, 8 * scale),
    paddingVertical: Math.max(6, 8 * scale),
    paddingHorizontal: Math.max(8, 12 * scale),
    marginLeft: Math.max(4, 8 * scale),
  },
  doneBtnText: {
    color: '#fff',
    fontSize: Math.max(14, 16 * scale),
    fontWeight: 'bold',
  },
  cancelBtn: {
    backgroundColor: '#636e72',
    borderRadius: Math.max(6, 8 * scale),
    paddingVertical: Math.max(6, 8 * scale),
    paddingHorizontal: Math.max(8, 12 * scale),
    marginLeft: Math.max(4, 8 * scale),
  },
  cancelBtnText: {
    color: '#fff',
    fontSize: Math.max(14, 16 * scale),
    fontWeight: 'bold',
  },
  summary: {
    marginTop: Math.max(10, 16 * scale),
    fontSize: Math.max(16, 18 * scale),
    textAlign: 'center',
    color: '#636e72',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#b2bec3',
    fontSize: Math.max(14, 16 * scale),
    marginVertical: Math.max(6, 8 * scale),
  },
});
