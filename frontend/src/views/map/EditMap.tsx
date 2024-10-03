import React, { useEffect, useRef, useState } from "react";
import { FeatureGroup, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";

// Component for editing maps with Leaflet
const EditMap = ({
  updateAnswer,
  answerType,
  actualAnswer,
  questionIndex,
  mapFunc,
  mapEndDrawFunc,
}: any) => {
  const editRef = useRef<any>();
  const [drawing, setDrawing] = useState(false);
  const map = useMap();
  const currentQuestionIndex = useRef(questionIndex);
  const currentLayer = useRef(actualAnswer);
  const currentAnswerType = useRef(answerType);
  const isDrawing = useRef(false);

  // Effect to handle changes in actualAnswer
  useEffect(() => {
    if (!actualAnswer && currentLayer.current) {
      map.removeLayer(currentLayer.current);
      currentLayer.current = null;
    } else if (actualAnswer && !currentLayer.current) {
      map.addLayer(actualAnswer);
      currentLayer.current = actualAnswer;
    } else if (actualAnswer && currentLayer.current) {
      map.removeLayer(currentLayer.current);
      map.addLayer(actualAnswer);
      currentLayer.current = actualAnswer;
    }
  }, [actualAnswer]);

  useEffect(() => {
    currentQuestionIndex.current = questionIndex;
  }, [questionIndex]);

  useEffect(() => {
    currentAnswerType.current = answerType;
  }, [answerType]);

  // Effect to handle the map function
  useEffect(() => {
    mapFunc.current = handleClick;
  }, []);

  // Effect to handle the end of drawing
  useEffect(() => {
    mapEndDrawFunc.current = handleEndStringDraw;
  }, []);

  // Function to handle the end of drawing strings
  const handleEndStringDraw = () => {
    if (!editRef?.current) return;
    if (!isDrawing.current) return;
    if (currentLayer.current) map.removeLayer(currentLayer.current);

    editRef.current._toolbars.draw._modes.polyline.handler.completeShape();
    editRef.current._toolbars.draw._modes.polyline.handler.disable();
  };

  // Function to handle clicks on the map
  const handleClick = () => {
    if (!editRef?.current) return;
    if (currentLayer.current !== null && currentLayer.current !== undefined) 
      map.removeLayer(currentLayer.current);
    if (!drawing) {
      isDrawing.current = true;
      if (currentAnswerType.current === "Point")
        editRef.current._toolbars.draw._modes.marker.handler.enable();
      else if (currentAnswerType.current === "LineString") {
        (function () {
          var originalOnTouch =
            editRef.current._toolbars.draw._modes.polyline.handler._onTouch;
          editRef.current._toolbars.draw._modes.polyline.handler._onTouch =
            function (e: any) {
              if (e.originalEvent.pointerType !== "mouse") {
                return originalOnTouch.call(this, e);
              }
            };
        })();
        editRef.current._toolbars.draw._modes.polyline.handler.enable();
      } else if (currentAnswerType.current === "Polygon")
        editRef.current._toolbars.draw._modes.rectangle.handler.enable();
    } else {
      editRef.current._toolbars.draw._modes.polygon.handler.completeShape();
      editRef.current._toolbars.draw._modes.polygon.handler.disable();
    }
    setDrawing(!drawing);
  };
  // Function to handle mounting of the EditControl
  const onMountedRect = (e: any) => {
    editRef.current = e;
  };

  // Function to handle creation of a new shape
  const createHandler = (e: any) => {
    const { layer } = e;
    updateAnswer(layer.toGeoJSON(), layer, currentQuestionIndex.current, layer._map._zoom);
    currentLayer.current = layer;
    isDrawing.current = false;
  };

  return (
    <FeatureGroup>
      <EditControl
        //ref={editRef}
        position="topright"
        onMounted={onMountedRect}
        onCreated={createHandler}
        //here you can specify your shape options and which handler you want to enable
        draw={{
          rectangle: true,
          circle: false,
          polyline: true,
          circlemarker: false,
          marker: true,
          polygon: true,
        }}
      />
    </FeatureGroup>
  );
};

export default EditMap;
