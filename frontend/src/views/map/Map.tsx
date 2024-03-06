import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, WMSTileLayer, useMap } from "react-leaflet";
import "./map.css";
import EditMap from "./EditMap";
import * as L from "leaflet";

// Component for changing the view of the map
function ChangeView({ center, zoom, isMapAttributesChanges }: any) {
  const map = useMap();
  if (isMapAttributesChanges.current) {
    map.setView(center, zoom);
    isMapAttributesChanges.current = false;
  }
  return null;
}

// Component for rendering maps with Leaflet
const Map = ({
  updateAnswer,
  answerType,
  actualAnswer,
  questionIndex,
  mapFunc,
  mapEndDrawFunc,
  zoom,
  center,
  mapUrl,
  wmsParams,
  mapAttribution,
}: any) => {
  const [mapZoom, setMapZoom] = useState(15);
  const [mapCenter, setMapCenter] = useState([54, 18]);
  const [mapKey, setMapKey] = useState(0);
  const isMapAttributesChanges = useRef(false);

  // Effect to handle changes in zoom and center of the map
  useEffect(() => {
    if (zoom && center) {
      setMapZoom(zoom);
      setMapCenter(center);
      isMapAttributesChanges.current = true;
    }
  }, [zoom, center]);

  // Effect to handle changes in the map URL
  useEffect(() => {
    // Refresh server key on layer change
    setMapKey((prevKey) => prevKey + 1);
    if (zoom && center) {
      setMapZoom(zoom);
      setMapCenter(center);
      isMapAttributesChanges.current = true;
    }
  }, [mapUrl]);

  return (
    <MapContainer key={mapKey} scrollWheelZoom>
      {/* Rendering TileLayer or WMSTileLayer based on wmsParams */}
      {wmsParams == undefined ? (
        <TileLayer url={mapUrl} attribution={mapAttribution} />
      ) : (
        <WMSTileLayer
          url={mapUrl}
          layers={wmsParams.LAYERS}
          styles={wmsParams.STYLES}
          format={wmsParams.FORMAT}
          crs={L.CRS.EPSG3857}
          version={wmsParams.VERSION}
        />
      )}
      <ChangeView
        center={mapCenter}
        zoom={mapZoom}
        isMapAttributesChanges={isMapAttributesChanges}
      />
      <EditMap
        updateAnswer={updateAnswer}
        actualAnswer={actualAnswer}
        answerType={answerType}
        questionIndex={questionIndex}
        mapFunc={mapFunc}
        mapEndDrawFunc={mapEndDrawFunc}
      />
    </MapContainer>
  );
};

export default Map;
