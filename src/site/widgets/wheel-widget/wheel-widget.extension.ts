import { extensions } from '@wix/astro/builders';
import { LAYOUT } from '@wix/react-component-schema';
import { withEditorElementDefaults } from '@wix/react-component-utils';
import { editorElement } from './wheel-widget.generated';
import { defaultProps } from './wheel-widget.props';
import componentUrl from './component.tsx?url';
import componentPreviewUrl from './component.preview.tsx?url';

export default extensions.editorReactComponent({
  id: '16f33bb4-3757-4240-9844-e5e60f88bc34',
  type: '16f33bb4-3757-4240-9844-e5e60f88bc34',
  displayName: 'Wheel of Fortune',
  description: 'An interactive prize wheel backed by secure server-side winner selection.',
  editorElement: {
    ...withEditorElementDefaults(editorElement, defaultProps),
    layout: {
      resizeDirection: LAYOUT.RESIZE_DIRECTION.horizontalAndVertical,
      contentResizeDirection: LAYOUT.CONTENT_RESIZE_DIRECTION.vertical,
    },
  },
  installation: {
    initialSize: {
      width: { sizingType: LAYOUT.SIZING_TYPE.pixels, pixels: 720 },
      height: { sizingType: LAYOUT.SIZING_TYPE.content },
    },
  },
  resources: {
    client: { componentUrl },
    editor: { componentUrl: componentPreviewUrl },
  },
});
