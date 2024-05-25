import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type JournalEntry = {
  id: string;
  content: string;
  timestamp: string;
};

const App = () => {
  const [input, setInput] = useState<string>('');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const storedEntries = await AsyncStorage.getItem('@journal_entries');
        if (storedEntries) {
          setJournalEntries(JSON.parse(storedEntries) as JournalEntry[]);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchEntries();
  }, []);

  const handleSave = async () => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      content: input,
      timestamp: new Date().toLocaleString(),
    };
    const updatedEntries = [...journalEntries, newEntry];

    try {
      await AsyncStorage.setItem('@journal_entries', JSON.stringify(updatedEntries));
      setJournalEntries(updatedEntries);
      setInput('');
    } catch (e) {
      console.error(e);
    }
  };

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <View style={styles.entry}>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
      <Text style={styles.content}>{item.content}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Write your journal entry"
        value={input}
        onChangeText={setInput}
      />
      <Button title="Save Entry" onPress={handleSave} />
      <FlatList
        data={journalEntries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  list: {
    marginTop: 20,
  },
  entry: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  timestamp: {
    fontSize: 12,
    color: 'gray',
  },
  content: {
    fontSize: 16,
  },
});

export default App;
