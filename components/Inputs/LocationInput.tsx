import { PlaceKit } from "@placekit/autocomplete-react";
import "@placekit/autocomplete-js/dist/placekit-autocomplete.css";

const LocationInput = () => {
  return <PlaceKit apiKey={process.env.NEXT_PUBLIC_PLACEKIT_API_KEY || ""} />;
};

export default LocationInput;
