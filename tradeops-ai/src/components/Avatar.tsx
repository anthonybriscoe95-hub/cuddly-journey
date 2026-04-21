import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export function Avatar({
  initials,
  color = theme.colors.primary,
  size = 36,
}: {
  initials: string;
  color?: string;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.root,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  text: { color: '#FFFFFF', fontWeight: '700' },
});
