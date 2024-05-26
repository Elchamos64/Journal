import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


type JournalEntry = {
  id: string;
  content: string;
  timestamp: string;
};

const App = () => {
  // State variables
  const [input, setInput] = useState<string>(''); // Input for journal entry
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]); // Array to store journal entries
  const [placeholder, setPlaceholder] = useState<string>('Write your journal entry'); // Placeholder text for journal entry input
  const prompts = [ // Array of prompts for placeholder text rotation
    'What are you grateful for today?',
    'What made you smile today?',
    'What challenges did you face today?',
    'Describe a memorable moment from today.',
    'What did you learn today?',
    'How did you feel today?',
    'What are your goals for tomorrow?'
  ];

  // Fetch stored journal entries and rotate placeholder text on component mount
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

    const placeholderInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * prompts.length);
      setPlaceholder(prompts[randomIndex]);
    }, 5000); // Change placeholder every 5 seconds

    return () => clearInterval(placeholderInterval); // Cleanup interval on unmount
  }, []);

  // Save journal entry to AsyncStorage
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

  // Delete journal entry
  const handleDelete = async (id: string) => {
    const updatedEntries = journalEntries.filter(entry => entry.id !== id);

    try {
      await AsyncStorage.setItem('@journal_entries', JSON.stringify(updatedEntries));
      setJournalEntries(updatedEntries);
    } catch (e) {
      console.error(e);
    }
  };

  // Render individual journal entry
  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <View style={styles.entry}>
      <View style={styles.entryText}>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
        <Text style={styles.content}>{item.content}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  // Render component
  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Placeholder text */}
        <Text style={styles.placeholder}>{placeholder}</Text>
        {/* Journal entry input */}
        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          value={input}
          onChangeText={setInput}
        />
        {/* Save button */}
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Entry</Text>
        </TouchableOpacity>
        {/* List of journal entries */}
        <FlatList
          data={journalEntries}
          renderItem={renderEntry}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      </ScrollView>
    </View>
  );
};

// Styles
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
  placeholder: {
    paddingBottom: 20,
    textAlign: 'center',
    fontSize: 25,
  },
  list: {
    marginTop: 20,
  },
  entry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  entryText: {
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: 'gray',
  },
  content: {
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#0077b6',
    padding: 10,
    marginVertical: 10,
    marginHorizontal: 130,
    borderRadius: 30,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default App;
