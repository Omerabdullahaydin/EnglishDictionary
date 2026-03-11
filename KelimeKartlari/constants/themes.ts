/**
 * Uygulama Temaları (Colors & Styles)
 *
 * @react-navigation/native sadece DefaultTheme ve DarkTheme export ettiği için
 * kendi LightTheme'imizi burada tanımlıyoruz
 * 
 * Theme type'ı @react-navigation/native'ten import ediyoruz
 * bu sayede ThemeProvider ile uyumlu hale geliyor
 */

import type { Theme } from '@react-navigation/native';

/**
 * Yazı Tipleri Yapılandırması
 * @react-navigation/native'in beklediği fonts object'i
 */
const fonts = {
  regular: {
    fontFamily: 'System',
    fontWeight: '400' as const,
  },
  medium: {
    fontFamily: 'System',
    fontWeight: '500' as const,
  },
  bold: {
    fontFamily: 'System',
    fontWeight: '700' as const,
  },
  heavy: {
    fontFamily: 'System',
    fontWeight: '900' as const,
  },
};

/**
 * Açık Tema (Light Mode)
 * Gün ışığında kullanılmak üzere tasarlanmış tema
 * Açık arka planlar, koyu metinler
 */
export const LightTheme: Theme = {
  dark: false,
  colors: {
    primary: 'rgb(10, 132, 255)',      // Mavi - Ana renk
    background: 'rgb(255, 255, 255)',  // Beyaz - Arka plan
    card: 'rgb(255, 255, 255)',        // Beyaz - Kart arka planı
    text: 'rgb(28, 28, 30)',           // Koyu - Metin rengi
    border: 'rgb(216, 216, 216)',      // Açık gri - Sınır rengi
    notification: 'rgb(255, 69, 58)',  // Kırmızı - Bildirim/Uyarı
  },
  fonts,
};

/**
 * Koyu Tema (Dark Mode)
 * Gece ve düşük ışık ortamlarında kullanılmak üzere tasarlanmış
 * Koyu arka planlar, açık metinler
 */
export const DarkTheme: Theme = {
  dark: true,
  colors: {
    primary: 'rgb(0, 122, 255)',       // Mavi - Ana renk (koyu tema uyumlu)
    background: 'rgb(1, 1, 1)',        // Siyah - Arka plan
    card: 'rgb(28, 28, 30)',           // Koyu gri - Kart arka planı
    text: 'rgb(229, 229, 231)',        // Açık - Metin rengi
    border: 'rgb(72, 72, 74)',         // Orta gri - Sınır rengi
    notification: 'rgb(255, 69, 58)',  // Kırmızı - Bildirim/Uyarı
  },
  fonts,
};
