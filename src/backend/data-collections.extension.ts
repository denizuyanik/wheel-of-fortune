import { extensions } from "@wix/astro/builders";
import wheelWinnersCollection from "./WheelWinners";
import wheelAppSettingsCollection from "./WheelAppSettings";

export default extensions.dataCollections({
  id: "9469cd73-482b-49c4-92c7-d51b425c5d78",
  name: "Wheel of Fortune Data",
  collections: [wheelWinnersCollection, wheelAppSettingsCollection],
});
