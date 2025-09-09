import React, { useEffect, useRef, useState } from "react";
import { FeatureGroup, useMap, useMapEvent } from "react-leaflet";
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
  const clicksRef = useRef(0);
  const dragsRef = useRef(0);
  const zoomInsRef = useRef(0);
  const zoomOutsRef = useRef(0);
  const prevZoom = useRef(map.getZoom());
  const clickTimestampsRef = useRef<number[]>([]);

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

  // Effect to track map interactions: clicks, zooms, drags
  useMapEvent("click", () => {
    clicksRef.current += 1;
  });
  useMapEvent("zoomend", () => {
    const currentZoom = map.getZoom();
    if (currentZoom > prevZoom.current) {
      zoomInsRef.current += 1
    } else if (currentZoom < prevZoom.current) {
      zoomOutsRef.current += 1
    }
    prevZoom.current = currentZoom;
  });
  useMapEvent("dragend", () => {
    dragsRef.current += 1;
  });

  // Effect to reset map interactions after each question: clicks, zooms, drags
  useEffect(() => {
    clicksRef.current = 0;
    zoomInsRef.current = 0;
    zoomInsRef.current = 0;
    dragsRef.current = 0;
  }, [questionIndex]);

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
        clickTimestampsRef.current = [];
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

        map.on("click", lineStringClickHandler);
      } else if (currentAnswerType.current === "Polygon")
        editRef.current._toolbars.draw._modes.rectangle.handler.enable();
    } else {
      if (currentAnswerType.current === "LineString") {
        map.off("click", lineStringClickHandler);
      }

      editRef.current._toolbars.draw._modes.polygon.handler.completeShape();
      editRef.current._toolbars.draw._modes.polygon.handler.disable();
    }
    setDrawing(!drawing);
  };

  // Function to handle clicks when drawing a line string
  const lineStringClickHandler = () => {
    clickTimestampsRef.current.push(Date.now());
  };

  // Function to handle mounting of the EditControl
  const onMountedRect = (e: any) => {
    editRef.current = e;
  };

  // Function to handle creation of a new shape
  const createHandler = (e: any) => {
    const { layer } = e;

    let intervals: number[] = [];
    if (currentAnswerType.current === "LineString" && clickTimestampsRef.current.length > 1) {
      intervals = clickTimestampsRef.current
          .slice(1)
          .map((t, i) => t - clickTimestampsRef.current[i]);
    }

    updateAnswer(
        layer.toGeoJSON(),
        layer,
        currentQuestionIndex.current,
        layer._map._zoom,
        {
          clicks: clicksRef.current,
          zoomIns: zoomInsRef.current,
          zoomOuts: zoomOutsRef.current,
          drags: dragsRef.current,
          timeStamps: intervals.length === 0 ? undefined : intervals,
        }
    );
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
