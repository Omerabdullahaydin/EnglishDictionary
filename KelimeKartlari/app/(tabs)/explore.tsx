import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, View, Alert } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useWords } from '../../contexts/word-context';

export default function ExploreScreen() {
  const { words, selectedCategory, showFavorites } = useWords();
  const [currentWord, setCurrentWord] = useState<any>(null);
  const [guess, setGuess] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [streak, setStreak] = useState(0);

  const filteredWords = words.filter(word => {
    const matchesCategory = selectedCategory === 'Tümü' || word.category === selectedCategory;
    const matchesFavorites = !showFavorites || word.isFavorite;
    return matchesCategory && matchesFavorites;
  });

  useEffect(() => {
    if (filteredWords.length > 0) {
      nextWord();
    }
  }, [filteredWords]);

  const nextWord = () => {
    if (filteredWords.length === 0) return;

    const newWord = filteredWords[Math.floor(Math.random() * filteredWords.length)];
    setCurrentWord(newWord);
    setGuess('');
    setShowAnswer(false);
    setMessage('');
  };

  const checkGuess = () => {
    if (!currentWord) return;

    const isCorrect = guess.toLowerCase().trim() === currentWord.turkish.toLowerCase();
    setTotalQuestions(prev => prev + 1);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      setMessage(`🎉 Doğru! (${streak + 1} doğru üst üste)`);
    } else {
      setStreak(0);
      setMessage(`❌ Yanlış. Doğru cevap: ${currentWord.turkish}`);
    }
    setShowAnswer(true);
  };

  const resetQuiz = () => {
    setScore(0);
    setTotalQuestions(0);
    setStreak(0);
    nextWord();
  };

  if (words.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Kelime ekleyin!</ThemedText>
        <ThemedText style={styles.emptyText}>
          Sözlüğünüzde hiç kelime yok. Ana sayfadan kelime ekleyebilirsiniz.
        </ThemedText>
      </ThemedView>
    );
  }

  if (filteredWords.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Filtrelere uygun kelime yok</ThemedText>
        <ThemedText style={styles.emptyText}>
          Seçili kategoride veya favorilerde kelime bulunamadı.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Kelime Quiz</ThemedText>

      <View style={styles.statsContainer}>
        <ThemedText style={styles.statsText}>Skor: {score}/{totalQuestions}</ThemedText>
        <ThemedText style={styles.statsText}>Seri: {streak}</ThemedText>
      </View>

      {currentWord && (
        <>
          <View style={styles.wordContainer}>
            <ThemedText style={styles.category}>{currentWord.category || 'Genel'}</ThemedText>
            <ThemedText type="subtitle" style={styles.word}>{currentWord.english}</ThemedText>
            <View style={[styles.difficultyIndicator, { backgroundColor: getDifficultyColor(currentWord.difficulty) }]} />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Türkçe anlamını yazın"
            value={guess}
            onChangeText={setGuess}
            editable={!showAnswer}
            autoCapitalize="none"
          />

          {!showAnswer ? (
            <TouchableOpacity style={styles.button} onPress={checkGuess}>
              <ThemedText style={styles.buttonText}>Tahmin Et</ThemedText>
            </TouchableOpacity>
          ) : (
            <>
              <ThemedText style={[styles.message, message.includes('Doğru') ? styles.correctMessage : styles.wrongMessage]}>
                {message}
              </ThemedText>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={nextWord}>
                  <ThemedText style={styles.buttonText}>Sonraki Kelime</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetButton} onPress={resetQuiz}>
                  <ThemedText style={styles.resetButtonText}>Sıfırla</ThemedText>
                </TouchableOpacity>
              </View>
            </>
          )}
        </>
      )}
    </ThemedView>
  );
}

const getDifficultyColor = (difficulty?: string) => {
  switch (difficulty) {
    case 'easy': return '#4CAF50';
    case 'medium': return '#FF9800';
    case 'hard': return '#F44336';
    default: return '#9E9E9E';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#fafafa',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  word: {
    fontSize: 28,
    marginBottom: 15,
    textAlign: 'center',
    color: '#2c3e50',
  },
  difficultyIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
  },
  resetButton: {
    backgroundColor: '#ff6b6b',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    padding: 15,
    borderRadius: 12,
    width: '100%',
  },
  correctMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  wrongMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
});
