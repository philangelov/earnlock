import { Stack } from 'expo-router';

import { tabStackOptions } from '@/theme/navTheme';
import { useTokens } from '@/theme/theme';

export default function InsightsLayout() {
  const t = useTokens();
  return (
    <Stack screenOptions={tabStackOptions(t)}>
      <Stack.Screen name="index" options={{ title: 'Insights' }} />
    </Stack>
  );
}
