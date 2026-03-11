import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, View, Alert } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useWords } from '../../contexts/word-context';

/**
 * ExploreScreen - Quiz component'i
 *
 * Quiz state'ini yönetir ve interaktif test arayüzü sağlar
 */
export default function ExploreScreen() {
  // Context'ten ana kelime listesi ve seçilen filtreler alınıyor
  const { words, selectedCategory, showFavorites } = useWords();

  // ============ QUIZ STATE'LERİ ============
  // currentWord: Şu anda sorulaması gereken İngilizce kelime
  const [currentWord, setCurrentWord] = useState<any>(null);
  
  // guess: Kullanıcının girdiği tahmin (Türkçe anlam)
  const [guess, setGuess] = useState('');
  
  // showAnswer: Cevap gösterildi mi? (tahmin sonrası true olur)
  const [showAnswer, setShowAnswer] = useState(false);
  
  // message: Doğru/Yanlış mesajı ve doğru cevap gösterilir
  const [message, setMessage] = useState('');
  
  // score: Kaç doğru cevap verdiğini tutar
  const [score, setScore] = useState(0);
  
  // totalQuestions: Toplam kaç soru sorulduğunu tutar (doğru + yanlış)
  const [totalQuestions, setTotalQuestions] = useState(0);
  
  // streak: Ardışık doğru cevap sayısı (bir tanesi yanlış olunca 0'a düşer)
  const [streak, setStreak] = useState(0);

  // ============ FİLTRELENMİŞ KELIME LİSTESİ ============
  // Ana sayfada seçilen filtreler burada da uygulanıyor
  // Bu sayede Quiz ekranında da kategori ve favori filtreleri etkili oluyor
  const filteredWords = words.filter(word => {
    // Seçilen kategoriye uyuyor mu? ("Tümü" seçiliyse tüm kelimeler geçer)
    const matchesCategory = selectedCategory === 'Tümü' || word.category === selectedCategory;
    
    // Favori filtresi aktif ise sadece favorileri göster
    const matchesFavorites = !showFavorites || word.isFavorite;
    
    return matchesCategory && matchesFavorites;
  });

  // ============ FONKSİYON: nextWord ============
  // Rastgele bir kelime seçer ve quiz state'ini temiz hale getirir
  // Her soru başında çağrılır
  const nextWord = useCallback(() => {
    if (filteredWords.length === 0) return;

    // Filtrelenmiş kelimelerden rastgele bir tanesini seç
    const newWord = filteredWords[Math.floor(Math.random() * filteredWords.length)];
    setCurrentWord(newWord);

    // Quiz state'ini sıfırla (yeni soru için temiz başla)
    setGuess('');           // Tahmin kutusunu boşalt
    setShowAnswer(false);   // Cevab gizle
    setMessage('');         // Mesajı temizle
  }, [filteredWords]);

  // ============ QUIZ BAŞLATIÇ ============
  // Filtreler değiştiğinde (kategori veya favori durumu) yeni kelime seç
  // Böylece Quiz ekranından kategori değiştirince otomatik kelime güncellenir
  useEffect(() => {
    if (filteredWords.length > 0) {
      nextWord();
    }
  }, [nextWord]);

  // ============ FONKSİYON: checkGuess ============
  // Kullanıcının yazdığı tahmini kontrol eder ve sonucu gösterir
  // Skor ve seri bilgisini günceller
  const checkGuess = useCallback(() => {
    if (!currentWord) return;

    // Kullanıcının tahmini ve doğru cevabı karşılaştır
    // toLowerCase(): Büyük/küçük harf farkı önemli olmasın
    // trim(): Başında/sonunda boşluk olmasın
    const isCorrect = guess.toLowerCase().trim() === currentWord.turkish.toLowerCase();
    
    // Sorulmuş soru sayısını artır (doğru olsun, yanlış olsun)
    setTotalQuestions(prev => prev + 1);

    if (isCorrect) {
      // ✅ DOĞRU CEVAPta yapılacaklar:
      // Doğru cevap sayısını artır
      setScore(prev => prev + 1);
      
      // Ardışık doğru sayısını artır
      setStreak(prev => prev + 1);
      
      // Kullanıcıya başarı mesajı göster (seri sayısıyla)
      setMessage(`🎉 Doğru! (${streak + 1} doğru üst üste)`);
    } else {
      // ❌ YANLIŞ CEVAPta yapılacaklar:
      // Ardışık doğru sayısını sıfırla (seri bitti)
      setStreak(0);
      
      // Yanlış cevap mesajı ve doğru cevabı göster
      setMessage(`❌ Yanlış. Doğru cevap: ${currentWord.turkish}`);
    }
    
    // Cevabı göster (Sonraki soru butonunu gösterebilmek için)
    setShowAnswer(true);
  }, [currentWord, guess, streak]);

  // ============ FONKSİYON: resetQuiz ============
  // Tüm sonuçları sıfırlayarak yakından oyun başlatır
  // "Oyunu Baştan Başlat" butonuna basıldığında çağrılır
  const resetQuiz = useCallback(() => {
    setScore(0);             // Skor sıfırla
    setTotalQuestions(0);    // Toplam soru sıfırla
    setStreak(0);            // Dizi sıfırla
    nextWord();              // İlk kelimeyi yükle
  }, [nextWord]);

  // ============ FONKSİYON: getDifficultyColor ============
  // Zorluk seviyesine göre renk kodunu döndürür
  // Kolay (easy) = Yeşil, Orta (medium) = Turuncu, Zor (hard) = Kırmızı
  const getDifficultyColor = useMemo(() => (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';   // Yeşil - Kolay
      case 'medium': return '#FF9800'; // Turuncu - Orta  
      case 'hard': return '#F44336';   // Kırmızı - Zor
      default: return '#9E9E9E';       // Gri - Tanımlanmamış
    }
  }, []);

  // Kelime yoksa veya filtreler uyumsuzsa uygun mesaj göster
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

  /**
   * Ana Quiz UI
   *
   * Skor göstergesi, kelime kartı, tahmin girişi ve kontrol butonlarını render eder
   */
  return (
    <ThemedView style={styles.container}>
      {/* Ana başlık */}
      <ThemedText type="title" style={styles.title}>Kelime Quiz</ThemedText>

      {/* Skor ve istatistikler */}
      <View style={styles.statsContainer}>
        <ThemedText style={styles.statsText}>Skor: {score}/{totalQuestions}</ThemedText>
        <ThemedText style={styles.statsText}>Seri: {streak}</ThemedText>
      </View>

      {/* Kelime kartı - sadece currentWord varsa göster */}
      {currentWord && (
        <>
          {/* Kelime gösterimi bölümü */}
          <View style={styles.wordContainer}>
            <ThemedText style={styles.category}>{currentWord.category || 'Genel'}</ThemedText>
            <ThemedText type="subtitle" style={styles.word}>{currentWord.english}</ThemedText>
            <View style={[styles.difficultyIndicator, { backgroundColor: getDifficultyColor(currentWord.difficulty) }]} />
          </View>

          {/* Tahmin girişi */}
          <TextInput
            style={styles.input}
            placeholder="Türkçe anlamını yazın"
            value={guess}
            onChangeText={setGuess}
            editable={!showAnswer} // Cevap gösterildikten sonra girişi kilitle
          />

          {/* Kontrol butonları */}
          {!showAnswer ? (
            // Tahmin butonu - cevap gösterilmeden önce
            <TouchableOpacity style={styles.button} onPress={checkGuess}>
              <ThemedText style={styles.buttonText}>Tahmin Et</ThemedText>
            </TouchableOpacity>
          ) : (
            // Cevap gösterildikten sonraki butonlar
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
