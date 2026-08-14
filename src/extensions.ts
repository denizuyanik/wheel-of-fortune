import { app } from '@wix/astro/builders';
import dataCollections from './backend/data-collections.extension';
import wheelDashboard from './dashboard/pages/wheel/wheel.extension';
import wheelWidget from './site/widgets/wheel-widget/wheel-widget.extension';

export default app().use(dataCollections).use(wheelDashboard).use(wheelWidget);
