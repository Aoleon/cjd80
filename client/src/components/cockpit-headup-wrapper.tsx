'use client';

import { CockpitHeadsUpWithChat } from './cockpit-headup-with-chat';
import { useHeadsUp } from '@/contexts/headup-context';

export function CockpitHeadsUpWrapper() {
  const { enabled } = useHeadsUp();

  return (
    <CockpitHeadsUpWithChat
      enabled={enabled}
      project="work-hub"
      apiBaseUrl=""
    />
  );
}
