import type { SizeProp } from '@fortawesome/fontawesome-svg-core';

export interface InteractionButtonProps {
  type: 'like' | 'share' | 'follow';
  active?: boolean;
  count?: number | undefined;
  showText?: boolean;
  iconSize?: SizeProp;
  loading?: boolean;
}
