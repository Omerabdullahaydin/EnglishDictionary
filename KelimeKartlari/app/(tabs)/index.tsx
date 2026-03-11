import React from 'react';
import { StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ScrollView, View } from 'react-native';
import { Link } from 'expo-router';
import * as Speech from 'expo-speech';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useWords, Word } from '../../contexts/word-context';

export default function HomeScreen() {
  const {
    words,
    removeWord,
    toggleFavorite,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    showFavorites,
    setShowFavorites,
    isLoading
  } = useWords();

  const categories = ['Tümü', ...Array.from(new Set(words.map(word => word.category || 'Genel')))];

  const filteredWords = words.filter(word => {
    const matchesSearch = word.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         word.turkish.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tümü' || word.category === selectedCategory;
    const matchesFavorites = !showFavorites || word.isFavorite;
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const speakWord = (text: string) => {
    Speech.speak(text, { language: 'en' });
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const renderWord = ({ item }: { item: Word }) => (
    <ThemedView style={styles.wordItem}>
      <TouchableOpacity onPress={() => speakWord(item.english)} style={styles.wordContent}>
        <View style={styles.wordHeader}>
          <ThemedText type="subtitle" style={styles.english}>{item.english}</ThemedText>
          <TouchableOpacity onPress={() => toggleFavorite(item.id)} style={styles.favoriteButton}>
            <ThemedText style={[styles.favoriteIcon, item.isFavorite && styles.favoriteActive]}>
              {item.isFavorite ? '❤️' : '🤍'}
            </ThemedText>
          </TouchableOpacity>
        </View>
        <ThemedText style={styles.turkish}>{item.turkish}</ThemedText>
        <View style={styles.wordMeta}>
          <ThemedText style={[styles.category, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
            {item.category || 'Genel'}
          </ThemedText>
          <View style={[styles.difficulty, { backgroundColor: getDifficultyColor(item.difficulty) }]} />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            'Kelimeyi Sil',
            'Bu kelimeyi silmek istediğinizden emin misiniz?',
            [
              { text: 'İptal', style: 'cancel' },
              { text: 'Sil', onPress: () => removeWord(item.id) },
            ]
          );
        }}
        style={styles.deleteButton}
      >
        <ThemedText style={styles.deleteText}>🗑️</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>İngilizce Sözlük</ThemedText>

      <TextInput
        style={styles.searchInput}
        placeholder="Kelime ara..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryButton, selectedCategory === category && styles.categoryButtonActive]}
              onPress={() => setSelectedCategory(category)}
            >
              <ThemedText style={[styles.categoryButtonText, selectedCategory === category && styles.categoryButtonTextActive]}>
                {category}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.favoritesButton, showFavorites && styles.favoritesButtonActive]}
          onPress={() => setShowFavorites(!showFavorites)}
        >
          <ThemedText style={[styles.favoritesButtonText, showFavorites && styles.favoritesButtonTextActive]}>
            ⭐ Favoriler
          </ThemedText>
        </TouchableOpacity>
      </View>

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>İngilizce Sözlük</ThemedText>

      <TextInput
        style={styles.searchInput}
        placeholder="Kelime ara..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryButton, selectedCategory === category && styles.categoryButtonActive]}
              onPress={() => setSelectedCategory(category)}
            >
              <ThemedText style={[styles.categoryButtonText, selectedCategory === category && styles.categoryButtonTextActive]}>
                {category}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.favoritesButton, showFavorites && styles.favoritesButtonActive]}
          onPress={() => setShowFavorites(!showFavorites)}
        >
          <ThemedText style={[styles.favoritesButtonText, showFavorites && styles.favoritesButtonTextActive]}>
            ⭐ Favoriler
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ThemedText style={styles.resultsCount}>
        {isLoading ? 'Yükleniyor...' : `${filteredWords.length} kelime bulundu`}
      </ThemedText>

      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>📚 Kelimeler yükleniyor...</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={filteredWords}
          keyExtractor={(item) => item.id}
          renderItem={renderWord}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Link href="/modal" asChild>
        <TouchableOpacity style={styles.addButton}>
          <ThemedText style={styles.addButtonText}>+ Yeni Kelime</ThemedText>
        </TouchableOpacity>
      </Link>
    </ThemedView>
  );

      <Link href="/modal" asChild>
        <TouchableOpacity style={styles.addButton}>
          <ThemedText style={styles.addButtonText}>+ Yeni Kelime</ThemedText>
        </TouchableOpacity>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  filters: {
    marginBottom: 15,
  },
  categoryScroll: {
    marginBottom: 10,
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
  favoritesButton: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  favoritesButtonActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
  },
  favoritesButtonText: {
    fontSize: 14,
    color: '#856404',
  },
  favoritesButtonTextActive: {
    color: '#8B4513',
    fontWeight: 'bold',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  list: {
    flex: 1,
  },
  wordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fafafa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wordContent: {
    flex: 1,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  english: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  favoriteButton: {
    padding: 5,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  favoriteActive: {
    color: '#FFD700',
  },
  turkish: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  wordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  category: {
    fontSize: 12,
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontWeight: 'bold',
  },
  difficulty: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  deleteText: {
    color: 'white',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
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
});
