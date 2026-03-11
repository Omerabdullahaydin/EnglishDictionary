# İngilizce Sözlük Uygulaması 📚

Bu, Expo ile oluşturulmuş gelişmiş bir React Native İngilizce-Türkçe sözlük uygulamasıdır. Modern arayüz ve güçlü özelliklerle İngilizce öğrenmeyi kolaylaştırır.

## ✨ Özellikler

### 📖 Sözlük Yönetimi
- **Kategorilere Göre Gruplandırma**: Kelimeleri kategorilere ayırın (Temel, Teknoloji, Eğitim, vb.)
- **Favori Kelimeler**: Yıldız ile önemli kelimeleri işaretleyin
- **Zorluk Seviyeleri**: Kelimelere kolay/orta/zor etiketi verin
- **Arama ve Filtreleme**: Kelime ara, kategori ve favorilere göre filtrele

### 🎯 İnteraktif Quiz
- **Akıllı Test**: Rastgele kelime soruları
- **Skor Takibi**: Başarı oranınızı görün
- **Seri Takibi**: Kaç doğru üst üste yaptığınızı görün
- **Kategori Bazlı**: Seçili kategorilerden soru sorar

### 💾 Veri Saklama ve Yükleme
- **AsyncStorage**: Tüm veriler cihazda kalıcı olarak saklanır
- **Otomatik Kaydetme**: Kelime ekleme/düzenleme işlemleri otomatik kaydedilir
- **Durum Koruma**: Arama, filtre ve ayarlar uygulama yeniden açıldığında hatırlanır
- **Offline Çalışma**: İnternet bağlantısı olmadan tam işlevsellik

### 🎨 Modern Tasarım
- **Responsive Arayüz**: Tüm ekran boyutlarında mükemmel görünüm
- **Animasyonlar**: Akıcı geçişler ve hareketler
- **Material Design**: Modern ve kullanıcı dostu tasarım

## 🚀 Başlarken

1. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

2. **Uygulamayı başlatın**
   ```bash
   npx expo start
   ```

3. **Platform seçin**:
   - **Android**: `npm run android`
   - **iOS**: `npm run ios`
   - **Web**: `npm run web`
   - **Expo Go**: QR kodu tarayın

## 📱 Kullanım

1. **Ana Sayfa (Sözlük)**: Kelime listenizi görüntüleyin, arayın ve filtreleyin
2. **Keşfet (Quiz)**: Kelime bilginizi test edin ve skorunuzu takip edin
3. **Kelime Ekleme**: "+" butonuna basarak yeni kelime ekleyin
4. **Sesli Dinleme**: Kelimeye dokunarak İngilizce telaffuzunu dinleyin
5. **Favori İşaretleme**: ❤️ ikonuna tıklayarak kelimeleri favoriye ekleyin

## 🛠️ Teknik Detaylar

- **Framework**: React Native + Expo
- **Routing**: Expo Router (file-based)
- **State Management**: React Context API
- **Styling**: StyleSheet + Themed Components
- **Animations**: React Native Reanimated
- **TypeScript**: Full type safety

## 📂 Proje Yapısı

```
KelimeKartlari/
├── app/                    # Expo Router sayfaları
│   ├── _layout.tsx        # Ana layout
│   ├── modal.tsx          # Kelime ekleme
│   └── (tabs)/            # Tab navigation
├── contexts/              # State yönetimi
├── components/            # Yeniden kullanılabilir bileşenler
├── constants/             # Sabitler ve tema
└── hooks/                 # Custom hooks
```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request açın

## 📄 Lisans

Bu proje açık kaynak kodludur ve MIT lisansı altında yayınlanmıştır.
