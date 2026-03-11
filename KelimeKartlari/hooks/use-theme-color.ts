/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useTheme } from '@react-navigation/native';

/**
 * useThemeColor - Navigation theme uyumlu renk çekme
 *
 * Öncelik: props ışığında (light/dark) -> navigation theme -> varsayılan
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: string
) {
  const navigationTheme = useTheme();
  const colorFromProps = props[navigationTheme.dark ? 'dark' : 'light'];

  if (colorFromProps) {
    return colorFromProps;
  }

  // navigationTheme.colors kullanarak tema renklerini döndür (type uyumsuzluğu için cast)
  return (navigationTheme.colors as any)[colorName] as string;
}

