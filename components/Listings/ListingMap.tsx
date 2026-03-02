import { useRef, useEffect, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "dotenv/config";
const ListingMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  useEffect(() => {
    if (map.current) return;
    const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

    if (mapContainer.current && apiKey) {
      maptilersdk.config.apiKey = apiKey;
        map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: maptilersdk.MapStyle.BASE_V4,
        center: [-123.312603, 48.463816],
        zoom: 12,
      });
    }
  }, []);
  return (
    <div className="relative w-full  h-30">
      <div ref={mapContainer} className="map  absolute w-full h-full"></div>
    </div>
  );
};

export default ListingMap;
