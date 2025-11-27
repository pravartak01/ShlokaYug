/**
 * NotesSection Component
 * Take and manage notes for each lecture
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotesSectionProps {
  courseId: string;
  lectureId?: string;
}

interface Note {
  id: string;
  lectureId: string;
  content: string;
  timestamp: number;
}

export default function NotesSection({ courseId, lectureId }: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
  }, [courseId, lectureId]);

  const loadNotes = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem(`notes_${courseId}`);
      if (storedNotes) {
        const allNotes = JSON.parse(storedNotes);
        const lectureNotes = lectureId
          ? allNotes.filter((note: Note) => note.lectureId === lectureId)
          : allNotes;
        setNotes(lectureNotes);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const saveNote = async () => {
    if (!currentNote.trim()) {
      Alert.alert('Error', 'Please enter some text');
      return;
    }

    try {
      const storedNotes = await AsyncStorage.getItem(`notes_${courseId}`);
      let allNotes: Note[] = storedNotes ? JSON.parse(storedNotes) : [];

      if (editingNoteId) {
        // Update existing note
        allNotes = allNotes.map((note) =>
          note.id === editingNoteId
            ? { ...note, content: currentNote, timestamp: Date.now() }
            : note
        );
      } else {
        // Create new note
        const newNote: Note = {
          id: Date.now().toString(),
          lectureId: lectureId || 'general',
          content: currentNote,
          timestamp: Date.now(),
        };
        allNotes.push(newNote);
      }

      await AsyncStorage.setItem(`notes_${courseId}`, JSON.stringify(allNotes));
      setCurrentNote('');
      setEditingNoteId(null);
      loadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
    }
  };

  const deleteNote = async (noteId: string) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const storedNotes = await AsyncStorage.getItem(`notes_${courseId}`);
            if (storedNotes) {
              const allNotes: Note[] = JSON.parse(storedNotes);
              const updatedNotes = allNotes.filter((note) => note.id !== noteId);
              await AsyncStorage.setItem(`notes_${courseId}`, JSON.stringify(updatedNotes));
              loadNotes();
            }
          } catch (error) {
            console.error('Error deleting note:', error);
          }
        },
      },
    ]);
  };

  const editNote = (note: Note) => {
    setCurrentNote(note.content);
    setEditingNoteId(note.id);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView className="flex-1 bg-gray-800 p-4">
      <Text className="text-white text-xl font-bold mb-4">Notes</Text>

      {/* Note Input */}
      <View className="bg-gray-700 rounded-lg p-4 mb-4">
        <TextInput
          className="bg-gray-600 text-white rounded-lg p-3 min-h-[120px] mb-3"
          placeholder="Take a note..."
          placeholderTextColor="#9ca3af"
          multiline
          textAlignVertical="top"
          value={currentNote}
          onChangeText={setCurrentNote}
        />

        <View className="flex-row justify-end space-x-2">
          {editingNoteId && (
            <TouchableOpacity
              onPress={() => {
                setCurrentNote('');
                setEditingNoteId(null);
              }}
              className="bg-gray-600 px-4 py-2 rounded-lg mr-2"
            >
              <Text className="text-white font-semibold">Cancel</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={saveNote}
            className="bg-orange-500 px-6 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">
              {editingNoteId ? 'Update' : 'Save'} Note
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notes List */}
      <Text className="text-white text-lg font-semibold mb-3">
        Your Notes ({notes.length})
      </Text>

      {notes.length > 0 ? (
        notes.map((note) => (
          <View key={note.id} className="bg-gray-700 rounded-lg p-4 mb-3">
            <View className="flex-row items-start justify-between mb-2">
              <Text className="text-gray-400 text-xs">{formatDate(note.timestamp)}</Text>
              <View className="flex-row space-x-3">
                <TouchableOpacity onPress={() => editNote(note)}>
                  <Ionicons name="create-outline" size={20} color="#f97316" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteNote(note.id)}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
            <Text className="text-white leading-6">{note.content}</Text>
          </View>
        ))
      ) : (
        <View className="items-center justify-center py-12">
          <Ionicons name="document-text-outline" size={64} color="#4b5563" />
          <Text className="text-gray-400 text-center mt-4">
            No notes yet. Start taking notes!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
