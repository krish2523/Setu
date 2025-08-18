// src/components/ResizeMap.jsx
import { useEffect } from "react";
import { useMap } from "react-leaflet";

const ResizeMap = () => {
  const map = useMap();
  useEffect(() => {
    // This function tells the map to re-check its size, which forces all tiles to load.
    map.invalidateSize();
  }, [map]);

  return null; // This component renders nothing to the screen
};

export default ResizeMap;
