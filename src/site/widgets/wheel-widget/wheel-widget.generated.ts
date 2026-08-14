import type { EditorElement } from '@wix/react-component-schema';

export const editorElement = {
  selector: '.wheel-widget',
  displayName: 'Wheel of Fortune',
  data: {
    campaignId: { dataType: 'text', displayName: 'Campaign ID' },
    direction: { dataType: 'direction', displayName: 'Direction' },
  },
  cssProperties: {
    background: { defaultValue: '#f4f1ff' },
    borderTop: { defaultValue: '0px solid transparent' },
    borderBottom: { defaultValue: '0px solid transparent' },
    borderInlineStart: { defaultValue: '0px solid transparent' },
    borderInlineEnd: { defaultValue: '0px solid transparent' },
    borderStartStartRadius: { defaultValue: '24px' },
    borderStartEndRadius: { defaultValue: '24px' },
    borderEndStartRadius: { defaultValue: '24px' },
    borderEndEndRadius: { defaultValue: '24px' },
    paddingTop: { defaultValue: '32px' },
    paddingBottom: { defaultValue: '32px' },
    paddingInlineStart: { defaultValue: '24px' },
    paddingInlineEnd: { defaultValue: '24px' },
  },
} as EditorElement;
