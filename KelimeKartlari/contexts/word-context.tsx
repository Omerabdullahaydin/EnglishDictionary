import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Word {
  id: string;
  english: string;
  turkish: string;
  category?: string;
  isFavorite?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface WordContextType {
  words: Word[];
  addWord: (english: string, turkish: string, category?: string, difficulty?: 'easy' | 'medium' | 'hard') => void;
  removeWord: (id: string) => void;
  toggleFavorite: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  showFavorites: boolean;
  setShowFavorites: (show: boolean) => void;
  isLoading: boolean;
  saveWords: () => Promise<void>;
  loadWords: () => Promise<void>;
  folders: string[]; // kullanıcının oluşturduğu klasörler
  addFolder: (name: string) => void; // yeni klasör ekleme
}

const WordContext = createContext<WordContextType | undefined>(undefined);

export const useWords = () => {
  const context = useContext(WordContext);
  if (!context) {
    throw new Error('useWords must be used within a WordProvider');
  }
  return context;
};

interface WordProviderProps {
  children: ReactNode;
}

export const WordProvider: React.FC<WordProviderProps> = ({ children }) => {
  const [words, setWords] = useState<Word[]>([
    { id: '1', english: 'hello', turkish: 'merhaba', category: 'Temel', difficulty: 'easy', isFavorite: false },
    { id: '2', english: 'world', turkish: 'dünya', category: 'Temel', difficulty: 'easy', isFavorite: false },
  ]);
  // Kullanıcı tarafından oluşturulan klasörlerin listesi
  const [folders, setFolders] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [showFavorites, setShowFavorites] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | number | null>(null);

  const STORAGE_KEY = '@words';
  const SEARCH_KEY = '@searchQuery';
  const CATEGORY_KEY = '@selectedCategory';
  const FAVORITES_KEY = '@showFavorites';
  const FOLDERS_KEY = '@folders';

  const loadWords = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedWords = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedWords) {
        setWords(JSON.parse(storedWords));
      }
      const storedSearch = await AsyncStorage.getItem(SEARCH_KEY);
      if (storedSearch) setSearchQuery(storedSearch);
      const storedCategory = await AsyncStorage.getItem(CATEGORY_KEY);
      if (storedCategory) setSelectedCategory(storedCategory);
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) setShowFavorites(JSON.parse(storedFavorites));
      const storedFolders = await AsyncStorage.getItem(FOLDERS_KEY);
      if (storedFolders) setFolders(JSON.parse(storedFolders));
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveWords = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(words));
    } catch (error) {
      console.error('Veri kaydetme hatası:', error);
    }
  }, [words]);

  const saveFolders = useCallback(async () => {
    try {
      await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
    } catch (error) {
      console.error('Klasör kaydetme hatası:', error);
    }
  }, [folders]);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  useEffect(() => {
    if (!isLoading) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveWords();
      }, 1000);
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [words, isLoading, saveWords]);

  useEffect(() => {
    if (!isLoading) {
      saveFolders();
    }
  }, [folders, isLoading, saveFolders]);

  const addWord = useCallback((english: string, turkish: string, category: string = 'Genel', difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
    const newWord: Word = {
      id: Date.now().toString(),
      english: english.toLowerCase(),
      turkish: turkish.toLowerCase(),
      category,
      difficulty,
      isFavorite: false,
    };
    setWords(prev => [...prev, newWord]);
  }, []);

  const addFolder = useCallback((name: string) => {
    setFolders(prev => {
      const updated = Array.from(new Set([...prev, name]));
      // kaydetme efektini beklememek için hemen sakla
      AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(updated)).catch(err =>
        console.error('Klasör kaydetme hatası:', err)
      );
      return updated;
    });
  }, []);

  const removeWord = useCallback((id: string) => {
    setWords(prev => prev.filter(word => word.id !== id));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setWords(prev => prev.map(word =>
      word.id === id ? { ...word, isFavorite: !word.isFavorite } : word
    ));
  }, []);

  return (
    <WordContext.Provider value={{
      words,
      addWord,         // Kelime ekleme fonksiyonu
      removeWord,      // Kelime silme fonksiyonu
      toggleFavorite,  // Favori değiştirme fonksiyonu
      setSearchQuery,  // Arama sorgusu ayarlama
      selectedCategory,// Seçili kategori
      setSelectedCategory, // Kategori ayarlama
      showFavorites,   // Favori filtresi
      setShowFavorites,// Favori filtresi ayarlama
      isLoading,       // Yükleme durumu
      saveWords,       // Manuel kaydetme
      loadWords,        // Manuel yükleme
      folders,         // Kullanıcı klasör listesi
      addFolder        // Klasör ekleme fonksiyonu
    }}>
      {children}
    </WordContext.Provider>
  );
}; 
