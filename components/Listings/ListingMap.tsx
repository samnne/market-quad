import { useRef, useEffect } from "react";
import * as maptilersdk from "@maptiler/sdk";

import "dotenv/config";
import { useListings } from "@/app/store/zustand";
import { UVIC_LNG_LAT } from "@/app/client-utils/constants";

const ListingMap = () => {
  const mapContainer = useRef(null);
  const map = useRef<maptilersdk.Map>(null);
  const {selectedListing} = useListings()
 
  useEffect(() => { 
    if (map.current) return;
    const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
    const finalArr: (number[] & maptilersdk.LngLatLike) = selectedListing ? [selectedListing.longitude!, selectedListing.latitude!] : UVIC_LNG_LAT
  
    if (mapContainer.current && apiKey) {
      maptilersdk.config.apiKey = apiKey;
      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: maptilersdk.MapStyle.BASE_V4,
        center: [finalArr[0], finalArr[1]],
        zoom: 10,
      });
      map.current.on("load", () => {
       
        map.current?.addSource("circle-source", {
          type: "geojson",
          data: {
            type: "Point",
            coordinates: finalArr
          },
        });

    
        map.current?.addLayer({
          id: "circle-layer",
          type: "circle",
          source: "circle-source",

          paint: {
            "circle-radius": 60,
            "circle-color": "#17f3b5",
            "circle-opacity": 0.5,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",

          },
        });
      });
    }
    

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [selectedListing]);
  return (
    <div className="relative w-full  h-30">
      <div ref={mapContainer} className="map  absolute w-full h-full"></div>
    </div>
  );
};

export default ListingMap;
