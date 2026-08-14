import { extensions } from '@wix/astro/builders';

export default extensions.customElement({
  id: '1153cd24-3a2a-4e87-9bdb-11d126031134',
  name: 'Wheel of Fortune',
  width: {
    defaultWidth: 720,
    allowStretch: true,
    stretchByDefault: true,
  },
  height: {
    defaultHeight: 560,
  },
  installation: {
    // Keep the widget opt-in so Wix lists it under Add Elements > App Widgets.
    // @wix/astro still emits the legacy manifest field used by the current CLI.
    autoAdd: false,
  },
  presets: [
    {
      id: '7513dcbe-1d65-4531-8edb-fc00642dd596',
      name: 'default',
      thumbnailUrl: '{{BASE_URL}}/wheel-of-fortune-widget-thumbnail.png',
    },
  ],
  tagName: 'wheel-of-fortune-widget',
  element: './extensions/site/widgets/wheel-of-fortune-widget/wheel-of-fortune-widget.tsx',
  settings: './extensions/site/widgets/wheel-of-fortune-widget/wheel-of-fortune-widget.panel.tsx',
});
