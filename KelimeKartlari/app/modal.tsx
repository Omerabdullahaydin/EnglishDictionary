import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, View } from 'react-native';
import { Link, router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useWords } from '../contexts/word-context';

export default function ModalScreen() {
  const { addWord } = useWords();
  const [english, setEnglish] = useState('');
  const [turkish, setTurkish] = useState('');
  const [category, setCategory] = useState('Genel');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const categories = ['Genel', 'Temel', 'Teknoloji', 'Eğitim', 'Sıfatlar', 'Fiiller', 'İsimler'];

  const handleAddWord = () => {
    if (!english.trim() || !turkish.trim()) {
      Alert.alert('Hata', 'Lütfen hem İngilizce hem Türkçe kelimeyi girin.');
      return;
    }
    addWord(english.trim(), turkish.trim(), category, difficulty);
    setEnglish('');
    setTurkish('');
    setCategory('Genel');
    setDifficulty('medium');
    router.back();
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Yeni Kelime Ekle</ThemedText>

        <TextInput
          style={styles.input}
          placeholder="İngilizce kelime"
          value={english}
          onChangeText={setEnglish}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Türkçe anlamı"
          value={turkish}
          onChangeText={setTurkish}
          autoCapitalize="none"
        />

        <ThemedText style={styles.label}>Kategori:</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryButton, category === cat && styles.categoryButtonActive]}
              onPress={() => setCategory(cat)}
            >
              <ThemedText style={[styles.categoryButtonText, category === cat && styles.categoryButtonTextActive]}>
                {cat}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ThemedText style={styles.label}>Zorluk Seviyesi:</ThemedText>
        <View style={styles.difficultyContainer}>
          {(['easy', 'medium', 'hard'] as const).map(level => (
            <TouchableOpacity
              key={level}
              style={[styles.difficultyButton, difficulty === level && styles.difficultyButtonActive]}
              onPress={() => setDifficulty(level)}
            >
              <ThemedText style={[styles.difficultyButtonText, difficulty === level && styles.difficultyButtonTextActive]}>
                {level === 'easy' ? 'Kolay' : level === 'medium' ? 'Orta' : 'Zor'}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddWord}>
          <ThemedText style={styles.addButtonText}>Kelimeyi Ekle</ThemedText>
        </TouchableOpacity>

        <Link href="/" dismissTo style={styles.cancelLink}>
          <ThemedText type="link">İptal</ThemedText>
        </Link>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 30,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginTop: 10,
  },
  categoryScroll: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#2196F3',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  difficultyButton: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  difficultyButtonActive: {
    backgroundColor: '#FF9800',
  },
  difficultyButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  difficultyButtonTextActive: {
    color: 'white',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelLink: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
