import React, { useEffect, Fragment } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { translations } from "../../translate/Translations";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import randomColor from "randomcolor";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import {
  distance,
  booleanPointInPolygon,
  length,
  intersect,
  lineIntersect,
  lineSlice,
  point,
  polygonToLine,
  area,
  centerOfMass,
  lineSplit,
  center,
  feature,
} from "@turf/turf";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


// Component for displaying survey answers
const AnswersList = ({ answers, survey }: any) => {

  // Language setting
  var language = "pl";
  if (localStorage.getItem("languageHook") !== null)
    language = JSON.parse(localStorage.getItem("languageHook") || "");

  // State variables for selected question ID and respondent
  const [questionId, setQuestionId] = React.useState("10");
  const [respondent, setRespondent] = React.useState("");
  const [selectedBtn, setSelectedBtn] = React.useState(-1);

  // Event handler for selecting question ID
  const handleIdQuestionChoice = (event: SelectChangeEvent) => {
    setQuestionId(event.target.value as string);
  };

  // Event handler for selecting respondent
  const handleRespondentChoice = (event: SelectChangeEvent) => {
    setRespondent(event.target.value as string);
  };

  // Function to calculate average of an array of numbers
  const average = (arr: number[]) =>
    arr.reduce((p: number, c: number) => p + c, 0) / arr.length;

  // Initialize arrays and variables for chart data
  // An array of point totals in each category, if points are not awarded in categories, it has only one index
  var totalPointsByCategories: number[] = [];
  // An array of points obtained in individual and questions
  var allPointsByCategories: number[][] = [];

  // Acceptable distance from the correct answer (coordinates), which will be scored
  var acceptableDistance = 30;
  // Acceptable percentage of correct polygon/linestring to be scored
  var acceptableMin = 30;
  // Whether the answers are scored in categories
  var categories = false;

  // An array of respondents' point totals
  var points = [0];
  // Chart labels
  var labels = [""];
  // An array of average points in categories
  var avgData = [0];
  // An array of average scores for the question
  var avgAttributesPoints = [0];
  // Scoring array of selected respondent and question
  var respondentPoints: any[];
  // Categories labels or just "score"
  var allPointsLabels: string[] = [""];

  var counter = 0;

  // Number of questions
  var questionsLen = 0;
  // An array of questions' indexes ([0,...,x])
  var questionsLenArray: number[] = [];

  // Chart.js defaults and options
  ChartJS.defaults.color = "#000000";
  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          font: {
            size: 15,
            color: "black",
          },
        },
      },
      title: {
        display: false,
        font: {
          size: 22,
          color: "black",
        },
      },
    },
    scales: {
      x: {
        border: {
          display: false,
        },
        grid: {
          color: "black",
        },
        ticks: {
          font: {
            size: 14,
            color: "#FFFFFF",
          },
        },
      },
      y: {
        border: {
          display: false,
        },
        grid: {
          color: "black",
        },
        ticks: {
          font: {
            size: 15,
            color: "#FFFFFF",
          },
        },
      },
    },
  };

  // Chart data objects
  // Data for the graph with the sum of respondents' scores
  const data = {
    labels: labels,
    datasets: [
      {
        label: "points",
        data: points,
        backgroundColor: "rgba(49, 55, 115, 0.9)",
      },
    ],
  };
  // Data for a graph with average scores in categories
  const dataDetailed = {
    labels: allPointsLabels,
    datasets: [
      {
        label: "points",
        data: avgData,
        backgroundColor: "rgba(49, 55, 115, 0.9)",
      },
    ],
  };
  // Data for a graph with average scores for the selected question
  const dataQuestionDetailed = {
    labels: allPointsLabels,
    datasets: [
      {
        label: "Question ID: 1",
        data: avgAttributesPoints,
        backgroundColor: "rgba(49, 55, 115, 0.9)",
      },
    ],
  };
  // Data for a graph with the scores of a given question
  const dataQuestionDetailedAllResponders = {
    labels: allPointsLabels,
    datasets: [
      {
        label: "",
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "rgba(49, 55, 115, 0.9)",
      },
    ],
  };
  // Data for the chart with the scores of a given respondent
  const dataRespondentDetailed = {
    labels: allPointsLabels,
    datasets: [
      {
        label: "",
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "rgba(49, 55, 115, 0.9)",
      },
    ],
  };
  // Data for the graph with the scores of a selected respondent and question
  const dataRespondentDetailedPerQuestion = {
    labels: allPointsLabels,
    datasets: [
      {
        label: "",
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "rgba(49, 55, 115, 0.9)",
      },
    ],
  };

  // Function to calculate detailed data
  const calculateDataDetailed = () =>
    allPointsByCategories.slice(0).map((arr) => average(arr));

  // Function to prepare for score calculation
  function prepareCalculation(): void {
   if (survey !== undefined)
   {
    allPointsLabels = [];
    allPointsLabels.length = 0;
    if (categories) {
      answers.map(
        (answer: any) => (allPointsLabels = survey.categoriesNames.slice())
      );
    } else {
      allPointsLabels.push("score");
    }
    dataDetailed.labels = allPointsLabels.slice();
    dataQuestionDetailed.labels = allPointsLabels.slice();
    dataQuestionDetailedAllResponders.labels = allPointsLabels.slice();
    dataRespondentDetailed.labels = allPointsLabels.slice();
    dataRespondentDetailedPerQuestion.labels = allPointsLabels.slice();

    totalPointsByCategories = new Array(allPointsLabels.length).fill(0);
    allPointsByCategories = Array.from(
      { length: allPointsLabels.length },
      () => []
    );

    answers.map((answer: any) => (questionsLen = survey.questions.length));
    questionsLenArray.length = 0;
    for (var i = 1; i < questionsLen; i++) {
      questionsLenArray.push(i);
    }
   }
  }

  // Function to clear score sum
  const clearScoreSum = (answer: any) => {
   if (survey !== undefined)
   {
    totalPointsByCategories = [];
    totalPointsByCategories.length = 0;
    totalPointsByCategories = totalPointsByCategories = new Array(
      allPointsLabels.length
    ).fill(0);

    avgData.length = 0; // Clear existing array without destroying references to original array
    var tmpAvgData = calculateDataDetailed();

    for (const element of tmpAvgData) {
      avgData.push(element);
    }

    avgAttributesPoints.length = 0;
    var tempAllPointsByCategories: number[][] = Array.from(
      { length: allPointsLabels.length },
      () => []
    );

    var numberOfQuestions = 0;
    answers.map((answer: any) => (numberOfQuestions = survey.questions.length));

    dataQuestionDetailed.datasets[0].label = "Question ID: " + questionId;
    for (
      let i = parseInt(questionId) - 1;
      i < numberOfQuestions * (labels.length - 1);
      i = i + numberOfQuestions
    ) {
      for (var j = 0; j < allPointsLabels.length; j++) {
        tempAllPointsByCategories[j].push(allPointsByCategories[j][i]);
      }
    }
    for (var j = 0; j < allPointsLabels.length; j++) {
      avgAttributesPoints.push(average(tempAllPointsByCategories[j]));
    }

    questionsLen = numberOfQuestions;

    questionsLenArray = [];
    questionsLenArray.length = 0;
    for (var i = 1; i <= questionsLen; i++) {
      questionsLenArray.push(i);
    }

    var respondentIdCounter = 0;
    for (const element of labels) {
      if (element === respondent) break;
      respondentIdCounter = respondentIdCounter + 1;
    }

    respondentPoints = [];
    dataRespondentDetailed.datasets.length = 0;

    for (var i = 0; i < questionsLen; i++) {
      respondentPoints[i] = [];
      for (var j = 0; j < allPointsLabels.length; j++) {
        respondentPoints[i][j] = 0;
      }
    }

    for (var i = 0; i < questionsLen; i++) {
      for (var j = 0; j < allPointsLabels.length; j++) {
        respondentPoints[i][j] =
          allPointsByCategories[j][
            (respondentIdCounter - 1) * questionsLen + i
          ];
      }

      let color = randomColor();

      dataRespondentDetailed.datasets.push({
        label: (i + 1).toString(),
        data: respondentPoints[i],
        backgroundColor: color,
      });
    }

    dataRespondentDetailedPerQuestion.datasets.length = 0;
    var detailedRespondentPerQuestion = [];
    detailedRespondentPerQuestion.length = 0;

    for (var j = 0; j < allPointsLabels.length; j++) {
      detailedRespondentPerQuestion.push(
        allPointsByCategories[j][
          (respondentIdCounter - 1) * numberOfQuestions +
            (parseInt(questionId) - 1)
        ]
      );
    }

    dataRespondentDetailedPerQuestion.datasets.push({
      label:
        labels[respondentIdCounter] + ": Question ID: " + parseInt(questionId),
      data: detailedRespondentPerQuestion,
      backgroundColor: "rgba(49, 55, 115, 0.9)",
    });

    dataQuestionDetailedAllResponders.datasets.length = 0;
    var responderId = 1;
    for (
      let i = parseInt(questionId) - 1;
      i < numberOfQuestions * (labels.length - 1);
      i = i + numberOfQuestions
    ) {
      var questionDetailedAllResponders = [];
      questionDetailedAllResponders.length = 0;
      for (var j = 0; j < allPointsLabels.length; j++) {
        questionDetailedAllResponders.push(allPointsByCategories[j][i]);
      }

      let color = randomColor();

      dataQuestionDetailedAllResponders.datasets.push({
        label: labels[responderId],
        data: questionDetailedAllResponders,
        backgroundColor: color,
      });
      responderId = responderId + 1;
    }
   }
    return " ";
  };

  // Function to calculate answer based on question type
  const calculateAnswer = (answer: any): any => {
   if (survey !== undefined)
   {
    const questionAnswer = survey.questions.find(
      (question: any) => question.id === answer.questionId
    )?.answer;

    if (questionAnswer) {
      // Set acceptable distance and minimum for the question if defined in .json file, otherwise use default values
      acceptableDistance =
        questionAnswer.acceptableDistance !== undefined
          ? questionAnswer.acceptableDistance
          : 50;

      acceptableMin =
        questionAnswer.acceptableMin !== undefined
          ? questionAnswer.acceptableMin
          : 30;

      // If we recorded the answer's map zoom level, display it
      var zoom = "";
      if (answer?.zoomLevel !== undefined)
      {
         zoom = ", zoom: " + answer?.zoomLevel;
      }

      // Calculate answer based on question and answer types
      if (questionAnswer.geometry.type === "Point" && answer.type === "Point") {
        // Calculate distance between two points in meters
        return `${distance(answer.geoJSON.geometry, questionAnswer.geometry, {
          units: "meters",
        }).toFixed(0)} m` + zoom;
      }
      if (
        questionAnswer?.geometry?.type === "Polygon" &&
        answer?.type === "Point"
      ) {
        // Calculate distance between point and center of polygon in meters
        const center = centerOfMass(questionAnswer.geometry);
        const text = `${distance(answer.geoJSON.geometry, center, {
          units: "meters",
        }).toFixed(0)} m`;
        // Check if point is inside or outside the polygon and return result accordingly
        return booleanPointInPolygon(
          answer.geoJSON.geometry,
          questionAnswer.geometry
        )
          ? (translations as any)[language]["within"] + ", " + text + zoom
          : (translations as any)[language]["outside"] + ", " + text + zoom;
      }
      if (
        questionAnswer?.geometry?.type === "Polygon" &&
        answer?.type === "LineString"
      ) {
        // Calculate percentage of intersection between line and polygon
        let line = answer.geoJSON.geometry;
        let poly = questionAnswer.geometry;
        const poly2 = feature(poly);
        var overlapping = lineSplit(feature(line), poly2);
        let intersectionLength2 = 0;        
        if (overlapping.features.length === 0)
        {
           var lineIsInsidePoly = booleanPointInPolygon(point(line.coordinates[0]), poly2);
           // Line is completely inside of polygon:
           if (lineIsInsidePoly)
           {
               var lengthOfLine = length(line);
               var linePolygon = polygonToLine(poly2);
               var lengthOfPolygon = length(linePolygon);
               if (lengthOfLine > lengthOfPolygon*0.33)
                   intersectionLength2 = lengthOfLine;
               else
                   intersectionLength2 = lengthOfLine*(lengthOfLine/(lengthOfPolygon*0.33));
           }
        }
        else
        {
           for (let i = 0; i < overlapping.features.length; i++) 
           {
             let pointInCenter = centerOfMass(overlapping.features[i]);
             if (booleanPointInPolygon(pointInCenter, poly2))
               intersectionLength2 += length(overlapping.features[i].geometry);
           }
        }
        const lineLength = length(line);
        let percentage = (intersectionLength2 / lineLength) * 100;
        return Math.round(percentage) + "%" + zoom;
      }
      if (
        questionAnswer?.geometry?.type === "Polygon" &&
        answer?.type === "Polygon"
      ) {
        let answerPoly = answer.geoJSON.geometry;
        let questionPoly = questionAnswer.geometry;
        const intersectedPoly = intersect(answerPoly, questionPoly);
        if (!intersectedPoly) return 0 + "%" + zoom;

        const questionArea = area(questionPoly);
        const commonArea = area(intersectedPoly);
        const answerArea = area(answerPoly);
        const basicPercentage = Math.round((commonArea / questionArea) * 100);
        const areaRatio = Math.round((commonArea / answerArea) * 100);
        return Math.min(basicPercentage, areaRatio) + "%" + zoom;
      }
      if (
        questionAnswer?.geometry?.type === "Slider" &&
        answer?.type === "Slider"
      ) {
        // Return slider value for Slider type questions
        return answer?.sliderValue;
      }
      if (
        questionAnswer?.geometry?.type === "Images" &&
        answer?.type === "Images"
      ) {
        // Return selected images for Images type questions
        return answer?.imagesChoose;
      }
      if (
        questionAnswer?.geometry?.type === "SingleChoice" &&
        answer?.type === "SingleChoice"
      ) {
        // Return selected option for SingleChoice type questions
        return answer?.singleChoice;
      }
      if (
        questionAnswer?.geometry?.type === "MultipleChoice" &&
        answer?.type === "MultipleChoice"
      ) {
        // Return selected options for MultipleChoice type questions
        return answer?.multipleChoice;
      }
      if (
        questionAnswer?.geometry?.type === "SingleImage" &&
        answer?.type === "SingleImage"
      ) {
        // Return selected image for SingleImage type questions
        return answer?.singleImage;
      }
      if (
        questionAnswer?.geometry?.type === "Table" &&
        answer?.type === "Table"
      ) {
        // Return table data for Table type questions
        return answer?.table;
      }
    }
   }    
    return null;
  };

  // Function to calculate score based on answer and categories' index
  const calculateScore = (answer: any, index: number): any => {
   var calculatedScore = 0;
   if (survey !== undefined)
   {
    const questionAnswer = survey.questions.find(
      (question: any) => question.id === answer.questionId
    )?.answer;

    // Copy of the total points in the category
    var totalCopy = 0;
    // Copy of the table of points for the questions in the category
    var allAbilityCopy: any[] = [];

    // Max score per question
    var maxScorePerQn = 0;

    // Determine total points, all ability copy, and max score per question if answers are scored against categories
    if (categories) {
      totalCopy = totalPointsByCategories[index];
      allAbilityCopy = [...allPointsByCategories[index]];
      maxScorePerQn = questionAnswer.scoringCategories[index].score;
    } else {
      // otherwise the auxiliary arrays have only one index each and the maximum number of points to be scored in the question is 1
      totalCopy = totalPointsByCategories[0];
      allAbilityCopy = [...allPointsByCategories[0]];
      maxScorePerQn = 1;
    }

    if (questionAnswer) {
      // Calculate score based on question and answer types

      // Set acceptable distance and minimum for the question if defined in .json file, otherwise use default values
      acceptableDistance =
        questionAnswer.acceptableDistance !== undefined
          ? questionAnswer.acceptableDistance
          : 50;

      acceptableMin =
        questionAnswer.acceptableMin !== undefined
          ? questionAnswer.acceptableMin
          : 30;

      if (questionAnswer.geometry.type === "Point" && answer.type === "Point") {
        // Check if the distance between answer and question is within acceptable distance
        if (
          distance(answer.geoJSON.geometry, questionAnswer.geometry, {
            units: "meters",
          }) < acceptableDistance
        ) {
          // Calculate score range based on the distance
          var scoreRange =
            (acceptableDistance -
              distance(answer.geoJSON.geometry, questionAnswer.geometry, {
                units: "meters",
              })) /
            acceptableDistance;
          // Multiply the maximum possible number of points to be scored by the percentage of correct answer
          calculatedScore = maxScorePerQn * scoreRange;
          // Round up the result
          calculatedScore =
            Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
        }
        // set totalCopy if calculatedScore was set @todo
        totalCopy += calculatedScore >= 0 ? calculatedScore : 0;
        // Round up the result
        totalCopy = Math.round((totalCopy + Number.EPSILON) * 100) / 100;
        // calculate  selected respondent's point totals
        points[points.length - 1] += calculatedScore;
        
        allAbilityCopy.push(
          !Number.isNaN(calculatedScore) ? calculatedScore : 0
        );
      } else if (
        questionAnswer?.geometry?.type === "Polygon" &&
        answer?.type === "Point"
      ) { // Check if the point is inside the polygon
        if (
          booleanPointInPolygon(
            answer.geoJSON.geometry,
            questionAnswer.geometry
          )
        ) { // If the point is inside the polygon, assign the maximum possible score
          calculatedScore = maxScorePerQn;
          calculatedScore = calculatedScore >= 0 ? calculatedScore : 0;
          calculatedScore =
            Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
        }
        totalCopy += calculatedScore;
        totalCopy = Math.round((totalCopy + Number.EPSILON) * 100) / 100;
        points[points.length - 1] += calculatedScore;
        // Add the score to the array of copies of all abilities
        allAbilityCopy.push(
          !Number.isNaN(calculatedScore) ? calculatedScore : 0
        );
      } else if (
        questionAnswer?.geometry?.type === "Polygon" &&
        answer?.type === "LineString"
      ) {
        // Extracting line and polygon geometries
        let line = answer.geoJSON.geometry;
        let poly = questionAnswer.geometry;
        const poly2 = feature(poly);
        // Splitting the line where it intersects with the polygon
        var overlapping = lineSplit(feature(line), poly2);
        let intersectionLength2 = 0;
        // Calculating the length of intersections
        if (overlapping.features.length === 0)
        {
           var lineIsInsidePoly = booleanPointInPolygon(point(line.coordinates[0]), poly2);
           // Line is completely inside of polygon:
           if (lineIsInsidePoly)
           {
               var lengthOfLine = length(line);
               var linePolygon = polygonToLine(poly2);
               var lengthOfPolygon = length(linePolygon);
               if (lengthOfLine > lengthOfPolygon*0.33)
                   intersectionLength2 = lengthOfLine;
               else
                   intersectionLength2 = lengthOfLine*(lengthOfLine/(lengthOfPolygon*0.33));               
           }
        }
        else
        {
           for (let i = 0; i < overlapping.features.length; i++) 
           {
             let pointInCenter = centerOfMass(overlapping.features[i]);
             if (booleanPointInPolygon(pointInCenter, poly2)) // Check if the point is inside the polygon
               intersectionLength2 += length(overlapping.features[i].geometry);
           }
        }
        const lineLength = length(line);
        let percentage = (intersectionLength2 / lineLength) * 100;        
         // Checking if the percentage of intersection is greater than acceptable minimum
        if (Math.round(percentage) > acceptableMin) {
          var scoreRange = Math.round(percentage) / 100;
// Calculating score based on the percentage of intersection
          calculatedScore = maxScorePerQn * scoreRange;
          calculatedScore = calculatedScore >= 0 ? calculatedScore : 0;
          calculatedScore =
            Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
        }
        totalCopy += calculatedScore;
        totalCopy = Math.round((totalCopy + Number.EPSILON) * 100) / 100;
        points[points.length - 1] += calculatedScore;

        allAbilityCopy.push(
          !Number.isNaN(calculatedScore) ? calculatedScore : 0
        );
      } else if (
        questionAnswer?.geometry?.type === "Polygon" &&
        answer?.type === "Polygon"
      ) {
        let answerPoly = answer.geoJSON.geometry;
        let questionPoly = questionAnswer.geometry;
        const intersectedPoly = intersect(answerPoly, questionPoly);
        if (!intersectedPoly) {
          // If no intersection, assign score as 0 and add it to the array of abilities
          allAbilityCopy.push(
            !Number.isNaN(calculatedScore) ? calculatedScore : 0
          );
          calculatedScore = 0;
        } else {
          // Calculating areas of question polygon, common area, and answer polygon
          const questionArea = area(questionPoly);
          const commonArea = area(intersectedPoly);
          const answerArea = area(answerPoly);
          const basicPercentage = Math.round((commonArea / questionArea) * 100);
          const areaRatio = Math.round((commonArea / answerArea) * 100);
          if (Math.min(basicPercentage, areaRatio) > acceptableMin) {
            var scoreRange = Math.min(basicPercentage, areaRatio) / 100;

            calculatedScore = maxScorePerQn * scoreRange;
            calculatedScore = calculatedScore >= 0 ? calculatedScore : 0;
            calculatedScore =
              Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
          }
          totalCopy += calculatedScore;
          totalCopy = Math.round((totalCopy + Number.EPSILON) * 100) / 100;
          points[points.length - 1] += calculatedScore;

          allAbilityCopy.push(
            !Number.isNaN(calculatedScore) ? calculatedScore : 0
          );
        }
      } else if (
        questionAnswer?.geometry?.type === "Slider" &&
        answer?.type === "Slider"
      ) {
        if (questionAnswer?.goodAnswer === answer?.sliderValue) {
          // If the answer is good, award max points
          calculatedScore = maxScorePerQn;
          calculatedScore = calculatedScore >= 0 ? calculatedScore : 0;
          calculatedScore =
            Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
        }
        totalCopy += calculatedScore;
        totalCopy = Math.round((totalCopy + Number.EPSILON) * 100) / 100;
        points[points.length - 1] += calculatedScore;

        allAbilityCopy.push(
          !Number.isNaN(calculatedScore) ? calculatedScore : 0
        );
      } else if (
        questionAnswer?.geometry?.type === "Images" &&
        answer?.type === "Images"
      ) {
        const splitedArr = answer?.imagesChoose.split(",");
        for (let i = 0; i < splitedArr.length; i++) {
          if (splitedArr[i] === "true") {
            // If the selected picture is the correct answer award partial points
            calculatedScore += maxScorePerQn * questionAnswer.points[i];
            calculatedScore =
              Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
          }
        }
        calculatedScore = calculatedScore >= 0 ? calculatedScore : 0;
        totalCopy += calculatedScore;
        totalCopy = Math.round((totalCopy + Number.EPSILON) * 100) / 100;
        points[points.length - 1] += calculatedScore;

        allAbilityCopy.push(
          !Number.isNaN(calculatedScore) ? calculatedScore : 0
        );
      } else if (
        questionAnswer?.geometry?.type === "SingleChoice" &&
        answer?.type === "SingleChoice"
      ) {
        if (questionAnswer?.points[answer?.singleChoice]) {
          // If the answer is good, award the points that were possible for this answer
          calculatedScore =
            maxScorePerQn * questionAnswer?.points[answer?.singleChoice];
          calculatedScore =
            Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
        }
        calculatedScore = calculatedScore >= 0 ? calculatedScore : 0;
        totalCopy += calculatedScore;
        totalCopy = Math.round((totalCopy + Number.EPSILON) * 100) / 100;
        points[points.length - 1] += calculatedScore;

        allAbilityCopy.push(
          !Number.isNaN(calculatedScore) ? calculatedScore : 0
        );
      } else if (
        questionAnswer?.geometry?.type === "SingleImage" &&
        answer?.type === "SingleImage"
      ) {
        if (questionAnswer?.points[answer?.singleImage]) {
          // If the answer is good, award the points that were possible for this answer
          calculatedScore =
            maxScorePerQn * questionAnswer?.points[answer?.singleImage];
          calculatedScore =
            Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
        }
        calculatedScore = calculatedScore >= 0 ? calculatedScore : 0;
        totalCopy += calculatedScore;
        totalCopy = Math.round((totalCopy + Number.EPSILON) * 100) / 100;
        points[points.length - 1] += calculatedScore;

        allAbilityCopy.push(
          !Number.isNaN(calculatedScore) ? calculatedScore : 0
        );
      } else if (
        questionAnswer?.geometry?.type === "MultipleChoice" &&
        answer?.type === "MultipleChoice"
      ) {
        const splitedArr = answer?.multipleChoice.split(",");
        for (let i = 0; i < splitedArr.length; i++) {
          if (splitedArr[i] === "true") {
            // If the selected picture is the correct answer, award partial points
            calculatedScore += maxScorePerQn * questionAnswer.points[i];
            calculatedScore =
              Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
          }
        }
        calculatedScore = calculatedScore >= 0 ? calculatedScore : 0;
        totalCopy += calculatedScore;
        totalCopy = Math.round((totalCopy + Number.EPSILON) * 100) / 100;
        points[points.length - 1] += calculatedScore;

        allAbilityCopy.push(
          !Number.isNaN(calculatedScore) ? calculatedScore : 0
        );
      } else if (
        questionAnswer?.geometry?.type === "Table" &&
        answer?.type === "Table"
      ) {
        const splitedArr = answer?.table.split(",");
        for (let i = 0; i < splitedArr.length; i++) {
          // If the selected answer is the correct one, award partial points
          calculatedScore +=
            maxScorePerQn *
            questionAnswer.points[
              i * questionAnswer.answers.length + parseInt(splitedArr[i])
            ];
          calculatedScore =
            Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
        }
        calculatedScore = calculatedScore >= 0 ? calculatedScore : 0;
        totalCopy += calculatedScore;
        totalCopy = Math.round((totalCopy + Number.EPSILON) * 100) / 100;
        points[points.length - 1] += calculatedScore;

        allAbilityCopy.push(
          !Number.isNaN(calculatedScore) ? calculatedScore : 0
        );
      }
    }
    totalCopy = !Number.isNaN(totalCopy) ? totalCopy : 0;

    if (categories) {
      totalPointsByCategories[index] = totalCopy;
      allPointsByCategories[index] = [...allAbilityCopy];
    } else {
      totalPointsByCategories[0] = totalCopy;
      allPointsByCategories[0] = [...allAbilityCopy];
    }
   }
    return calculatedScore;
  };

  // Check if points are awarded in categories
  function setCategories(): void {
    if (survey !== undefined)
    {
      answers.map((answer: any) => (categories = survey.categories));
    }
  }

  setCategories();
  prepareCalculation();

  return (
    <Paper style={{ height: selectedBtn > 0 ? "40%" : "90%", width: "100%" }}>
      <TableContainer
        sx={{
          height: "calc(100% - 30px)",
        }}
      >
        <Table
          stickyHeader
          component={Paper}
          sx={{ minWidth: 650, height: "max-content" }}
          aria-label="answers table"
        >
          <TableHead>
            <TableRow>
              <TableCell>{(translations as any)[language]["name"]}</TableCell>
              <TableCell>{(translations as any)[language]["age"]}</TableCell>
              <TableCell>{(translations as any)[language]["gender"]}</TableCell>
              <TableCell>
                {(translations as any)[language]["questionId"]}
              </TableCell>
              <TableCell>
                {(translations as any)[language]["answerType"]}
              </TableCell>
              <TableCell>{(translations as any)[language]["answer"]}</TableCell>

              {categories && (
                <>
                  {allPointsLabels.slice(0).map((label, index) => (
                    <TableCell key={index}>{label}</TableCell>
                  ))}
                </>
              )}

              {!categories && (
                <TableCell>
                  {(translations as any)[language]["score"]}
                </TableCell>
              )}
              <TableCell>{(translations as any)[language]["total"]}</TableCell>

            </TableRow>
          </TableHead>
          <TableBody>
            {answers.map((answer: any) => (
             <Fragment>
              <TableRow
                key={answer.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell rowSpan={answer.answers.length+1}>
                  {answer.user.name}
                  <div>
                    {answer.user.name !== undefined &&
                      labels.push(answer.user.name)}
                  </div>
                  <div>{answer.user.name !== undefined && points.push(0)}</div>
                </TableCell>
                <TableCell rowSpan={answer.answers.length+1}>{answer.user.age}</TableCell>
                <TableCell rowSpan={answer.answers.length+1}>{answer.user.gender}</TableCell>

               </TableRow>

                  {answer.answers.map((userAnswer: any, answerIndex: number) => (
                    <TableRow>
                     <TableCell key={userAnswer.id}>
                        {userAnswer.questionId}
                      </TableCell>
                      <TableCell key={answer.id}>
                        {userAnswer.type}
                      </TableCell>
                      <TableCell key={userAnswer.id}>
                        {calculateAnswer(userAnswer)}
                      </TableCell>
		       {categories && (
		          <>
		            {[...allPointsLabels].map((_, index) => (
		              <TableCell key={index}>
                                    {calculateScore(userAnswer, index)}
		              </TableCell>
		            ))}
		          </>
		        )}
		        {!categories && (
 	                 <TableCell key={userAnswer.id}>
                          {calculateScore(userAnswer, 0)}
	                 </TableCell>
		        )}

		       {(answerIndex == answer.answers.length-1) && categories && (
		          //<TableCell rowSpan={answer.answers.length+1}>
		          <TableCell>
		              {allPointsLabels.map((label, index) => (
		                //<div key={index} ref={state.myTableCell as React.RefObject<HTMLDivElement>}>
		                <div key={index} >
		                  {label}:{" "}{totalPointsByCategories[index]}
		                </div>
		              ))}
		          </TableCell>
		        )}
		        {(answerIndex == answer.answers.length-1) && !categories && (
		          //<TableCell rowSpan={answer.answers.length+1} key={answer.id}>
		          <TableCell key={answer.id}>
			          {totalPointsByCategories[0]}
		          </TableCell>
		        )}

		    </TableRow>                    
		   ))}

                {clearScoreSum(answer)}
                    
           </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ButtonGroup
        variant="contained"
        aria-label="outlined primary button group"
      >
        <Button
          style={{ backgroundColor: selectedBtn === 1 ? "#313773" : "#65688A" }}
          onClick={() => setSelectedBtn(1)}
        >
          {(translations as any)[language]["totalPoints"]}
        </Button>

        {categories && (
          <>
            <Button
              style={{
                backgroundColor: selectedBtn === 2 ? "#313773" : "#65688A",
              }}
              onClick={() => setSelectedBtn(2)}
            >
              {(translations as any)[language]["mean"]}
            </Button>
            <Button
              style={{
                backgroundColor: selectedBtn === 3 ? "#313773" : "#65688A",
              }}
              onClick={() => setSelectedBtn(3)}
            >
              {(translations as any)[language]["avgPerQuestion"]}
            </Button>
            <Button
              style={{
                backgroundColor: selectedBtn === 4 ? "#313773" : "#65688A",
              }}
              onClick={() => setSelectedBtn(4)}
            >
              {(translations as any)[language]["detailedPerRes"]}
            </Button>
            <Button
              style={{
                backgroundColor: selectedBtn === 5 ? "#313773" : "#65688A",
              }}
              onClick={() => setSelectedBtn(5)}
            >
              {(translations as any)[language]["detailedPerQue"]}
            </Button>
            <Button
              style={{
                backgroundColor: selectedBtn === 6 ? "#313773" : "#65688A",
              }}
              onClick={() => setSelectedBtn(6)}
            >
              {(translations as any)[language]["detailedPerRPerQ"]}
            </Button>
          </>
        )}

        <Button
          style={{ backgroundColor: selectedBtn > 0 ? "#313773" : "#65688A" }}
          disabled={selectedBtn < 0}
          aria-label="keyboard_double_arrow_up"
          onClick={() => setSelectedBtn(-1)}
        >
          <KeyboardDoubleArrowUpIcon />
        </Button>
      </ButtonGroup>

      {selectedBtn === 1 && <Bar options={options} data={data} />}
      {selectedBtn === 2 && <Bar options={options} data={dataDetailed} />}
      <div style={{ height: "5%" }}></div>
      {(selectedBtn === 3 || selectedBtn === 5 || selectedBtn === 6) && (
        <Box sx={{ minWidth: 120 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="demo-simple-select-label">
              {(translations as any)[language]["questionId"]}
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={questionId}
              label="Question ID"
              onChange={handleIdQuestionChoice}
            >
              {questionsLenArray?.map((index) => {
                return (
                  <MenuItem key={index} value={index}>
                    {index}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
      )}
      {selectedBtn === 3 && (
        <Bar options={options} data={dataQuestionDetailed} />
      )}
      <div style={{ height: "5%" }}></div>
      {(selectedBtn === 4 || selectedBtn === 6) && (
        <Box sx={{ minWidth: 120 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="demo-simple-select-label">Respondent</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={respondent}
              label="Respondent"
              onChange={handleRespondentChoice}
            >
              {labels?.map((index) => {
                return (
                  <MenuItem key={index} value={index}>
                    {index}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
      )}
      {selectedBtn === 4 && (
        <Bar options={options} data={dataRespondentDetailed} />
      )}
      {selectedBtn === 5 && (
        <Bar options={options} data={dataQuestionDetailedAllResponders} />
      )}
      {selectedBtn === 6 && (
        <Bar options={options} data={dataRespondentDetailedPerQuestion} />
      )}
    </Paper>
  );
};

export default AnswersList;
