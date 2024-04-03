import React from "react";
import { MapContainer, TileLayer, WMSTileLayer } from "react-leaflet";
import "./map.css";
import EditMap from "./EditMap";
import L from "leaflet";

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

  if (!mapUrl || !zoom || !center) return null;

  return (
    <MapContainer scrollWheelZoom zoom={zoom} center={center}>
      {/* Rendering TileLayer or WMSTileLayer based on wmsParams */}
      {wmsParams === undefined ? (
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
