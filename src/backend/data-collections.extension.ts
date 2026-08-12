import { extensions } from '@wix/astro/builders';
import { campaignsCollection, prizesCollection, spinsCollection } from './collections';

export default extensions.dataCollections({
  id: '9469cd73-482b-49c4-92c7-d51b425c5d78',
  name: 'Wheel of Fortune Data',
  collections: [campaignsCollection, prizesCollection, spinsCollection],
});
