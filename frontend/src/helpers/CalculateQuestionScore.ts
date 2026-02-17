import {
  distance,
  booleanPointInPolygon,
  feature,
  lineSplit,
  point,
  centerOfMass,
  length,
  polygonToLine,
  polygon,
  intersect,
  area,
} from "@turf/turf";

export type ScoreInput = {
  answer: any;
  questionAnswer: any; // survey.questions.find(...).answer
  maxScorePerQn: number;
};

export type ScoreResult = {
  score: number;
};

function round2(x: number) {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

export function calculateQuestionScore({
                                         answer,
                                         questionAnswer,
                                         maxScorePerQn,
                                       }: ScoreInput): ScoreResult {
  let calculatedScore = 0;

  if (!questionAnswer) return { score: 0 };

  const acceptableDistance =
    questionAnswer.acceptableDistance !== undefined
      ? questionAnswer.acceptableDistance
      : 50;

  const acceptableMin =
    questionAnswer.acceptableMin !== undefined ? questionAnswer.acceptableMin : 30;

  if (questionAnswer.geometry.type === "Point" && answer.type === "Point") {
    const d = distance(answer.geoJSON.geometry, questionAnswer.geometry, {
      units: "meters",
    });

    if (d < acceptableDistance) {
      const scoreRange = (acceptableDistance - d) / acceptableDistance;
      calculatedScore = maxScorePerQn * scoreRange;
      calculatedScore = round2(Math.max(0, calculatedScore));
    }
    return { score: calculatedScore };
  }

  if (questionAnswer?.geometry?.type === "Polygon" && answer?.type === "Point") {
    if (booleanPointInPolygon(answer.geoJSON.geometry, questionAnswer.geometry)) {
      calculatedScore = round2(Math.max(0, maxScorePerQn));
    }
    return { score: calculatedScore };
  }

  if (
    questionAnswer?.geometry?.type === "Polygon" &&
    answer?.type === "LineString"
  ) {
    const line = answer.geoJSON.geometry;
    const poly = questionAnswer.geometry;
    const poly2 = feature(poly);

    const overlapping = lineSplit(feature(line), poly2);
    let intersectionLength2 = 0;

    if (overlapping.features.length === 0) {
      const lineIsInsidePoly = booleanPointInPolygon(point(line.coordinates[0]), poly2);
      if (lineIsInsidePoly) {
        const lengthOfLine = length(line);
        const linePolygon = polygonToLine(poly2);
        const lengthOfPolygon = length(linePolygon);

        if (lengthOfLine > lengthOfPolygon * 0.33) intersectionLength2 = lengthOfLine;
        else intersectionLength2 = lengthOfLine * (lengthOfLine / (lengthOfPolygon * 0.33));
      }
    } else {
      for (let i = 0; i < overlapping.features.length; i++) {
        const pointInCenter = centerOfMass(overlapping.features[i]);
        if (booleanPointInPolygon(pointInCenter, poly2)) {
          intersectionLength2 += length(overlapping.features[i].geometry);
        }
      }
    }

    const lineLength = length(line);
    const percentage = (intersectionLength2 / lineLength) * 100;

    if (Math.round(percentage) > acceptableMin) {
      const scoreRange = Math.round(percentage) / 100;
      calculatedScore = round2(Math.max(0, maxScorePerQn * scoreRange));
    }

    return { score: calculatedScore };
  }

  if (
    questionAnswer?.geometry?.type === "Polygon" &&
    answer?.type === "Polygon"
  ) {
    const answerPoly = answer.geoJSON.geometry;
    const questionPoly = questionAnswer.geometry;
    const intersectedPoly = intersect(answerPoly, questionPoly);

    if (!intersectedPoly) return { score: 0 };

    const questionArea = area(questionPoly);
    const commonArea = area(intersectedPoly);
    const answerArea = area(answerPoly);

    const basicPercentage = Math.round((commonArea / questionArea) * 100);
    const areaRatio = Math.round((commonArea / answerArea) * 100);

    if (Math.min(basicPercentage, areaRatio) > acceptableMin) {
      const scoreRange = Math.min(basicPercentage, areaRatio) / 100;
      calculatedScore = round2(Math.max(0, maxScorePerQn * scoreRange));
    }

    return { score: calculatedScore };
  }

  if (questionAnswer?.geometry?.type === "Slider" && answer?.type === "Slider") {
    if (questionAnswer?.goodAnswer === answer?.sliderValue) {
      calculatedScore = round2(Math.max(0, maxScorePerQn));
    }
    return { score: calculatedScore };
  }

  if (questionAnswer?.geometry?.type === "Images" && answer?.type === "Images") {
    const splitedArr = String(answer?.imagesChoose ?? "").split(",");
    for (let i = 0; i < splitedArr.length; i++) {
      if (splitedArr[i] === "true") {
        calculatedScore += maxScorePerQn * questionAnswer.points[i];
        calculatedScore = round2(calculatedScore);
      }
    }
    calculatedScore = round2(Math.max(0, calculatedScore));
    return { score: calculatedScore };
  }

  if (
    questionAnswer?.geometry?.type === "SingleChoice" &&
    answer?.type === "SingleChoice"
  ) {
    if (questionAnswer?.points?.[answer?.singleChoice]) {
      calculatedScore = maxScorePerQn * questionAnswer.points[answer.singleChoice];
      calculatedScore = round2(calculatedScore);
    }
    calculatedScore = round2(Math.max(0, calculatedScore));
    return { score: calculatedScore };
  }

  if (
    questionAnswer?.geometry?.type === "SingleImage" &&
    answer?.type === "SingleImage"
  ) {
    if (questionAnswer?.points?.[answer?.singleImage]) {
      calculatedScore = maxScorePerQn * questionAnswer.points[answer.singleImage];
      calculatedScore = round2(calculatedScore);
    }
    calculatedScore = round2(Math.max(0, calculatedScore));
    return { score: calculatedScore };
  }

  if (
    questionAnswer?.geometry?.type === "MultipleChoice" &&
    answer?.type === "MultipleChoice"
  ) {
    const splitedArr = String(answer?.multipleChoice ?? "").split(",");
    for (let i = 0; i < splitedArr.length; i++) {
      if (splitedArr[i] === "true") {
        calculatedScore += maxScorePerQn * questionAnswer.points[i];
        calculatedScore = round2(calculatedScore);
      }
    }
    calculatedScore = round2(Math.max(0, calculatedScore));
    return { score: calculatedScore };
  }

  if (questionAnswer?.geometry?.type === "Table" && answer?.type === "Table") {
    const splitedArr = String(answer?.table ?? "").split(",");
    for (let i = 0; i < splitedArr.length; i++) {
      calculatedScore +=
        maxScorePerQn *
        questionAnswer.points[i * questionAnswer.answers.length + parseInt(splitedArr[i])];
      calculatedScore = round2(calculatedScore);
    }
    calculatedScore = round2(Math.max(0, calculatedScore));
    return { score: calculatedScore };
  }

  return { score: 0 };
}
