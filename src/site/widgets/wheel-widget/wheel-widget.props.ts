import type { Direction } from '@wix/editor-react-types';

export type WheelWidgetProps = {
  id?: string;
  className?: string;
  campaignId?: string;
  direction?: Direction;
  preview?: boolean;
};

export const defaultProps = {
  campaignId: '',
} as const satisfies Omit<WheelWidgetProps, 'id' | 'className' | 'direction' | 'preview'>;
