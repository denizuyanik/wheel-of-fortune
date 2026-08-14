import type { ComponentProps } from 'react';
import WheelWidget from './wheel-widget';

export default function WheelWidgetPreview(props: ComponentProps<typeof WheelWidget>) {
  return <WheelWidget {...props} preview />;
}
