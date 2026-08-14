import { app } from '@wix/astro/builders';
import dataCollections from './backend/data-collections.extension';
import wheelDashboard from './dashboard/pages/wheel/wheel.extension';
import wheelWidget from './extensions/site/widgets/wheel-of-fortune-widget/wheel-of-fortune-widget.extension';

export default app().use(dataCollections).use(wheelDashboard).use(wheelWidget);
