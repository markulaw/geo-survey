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
import Tooltip from "@mui/material/Tooltip";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import {
    calculateCredibility,
    buildCredibilityContext,
} from "../../helpers/Credibility";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Legend,
  ChartOptions
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
import {getTranslatedValue} from "../../helpers/GetTranslatedValue";
import {calculateQuestionScore} from "../../helpers/CalculateQuestionScore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
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

  const credibilityContext = React.useMemo(() => {
    if (!answers || !survey) return { statsByQuestionId: {} };
    return buildCredibilityContext(answers, survey);
  }, [answers, survey]);

  const getSurveyQuestion = (questionId: string | number) =>
      survey?.questions?.find((question: any) => String(question.id) === String(questionId));

  // Event handler for selecting question ID
  const handleIdQuestionChoice = (event: SelectChangeEvent) => {
    setQuestionId(event.target.value as string);
  };

  // Event handler for selecting respondent
  const handleRespondentChoice = (event: SelectChangeEvent) => {
    setRespondent(event.target.value as string);
  };

  // Function to calculate average of an array of numbers
  const safeAverage = (
    arr: any[],
    credArr?: any[],
    threshold = 0,
    applyThreshold = false
  ): number => {
    if (!Array.isArray(arr) || arr.length === 0) return 0;
    const items = arr.map((v, i) => ({
      num: Number(v ?? NaN),
      cred: credArr && credArr[i] != null ? Number(credArr[i]) : 100,
    })).filter(({ num }) => Number.isFinite(num));
    const filtered = items.filter(({ num, cred }) =>
      !applyThreshold ? true : (Number.isFinite(cred) && cred >= threshold)
    );
    if (filtered.length === 0) return 0;
    const sum = filtered.reduce((s, o) => s + o.num, 0);
    return sum / filtered.length;
  };

  const buildCredPerValue = (len: number): number[] => {
    const respondentCreds = Array.isArray(credibilities) ? credibilities.slice(1) : [];
    if (respondentCreds.length === 0) return new Array(len).fill(100);
    const numberOfQ = Math.max(1, Math.round(len / respondentCreds.length));
    const credPerValue: number[] = [];
    for (let r = 0; r < respondentCreds.length; r++) {
      for (let q = 0; q < numberOfQ; q++) {
        credPerValue.push(Number(respondentCreds[r] ?? 100));
      }
    }
    return credPerValue.slice(0, len);
  };

  const [applyCredThreshold, setApplyCredThreshold] = React.useState<boolean>(false);
  const [credThreshold, setCredThreshold] = React.useState<number>(50);

  // Initialize arrays and variables for chart data
  // An array of point totals in each category, if points are not awarded in categories, it has only one index
  var totalPointsByCategories: number[] = [];
  // An array of points obtained in individual and questions
  var allPointsByCategories: number[][] = [];
  // Credibility total score
  var totalCredibility = 0;
  // Acceptable distance from the correct answer (coordinates), which will be scored
  var acceptableDistance = 30;
  // Acceptable percentage of correct polygon/linestring to be scored
  var acceptableMin = 30;
  // Whether the answers are scored in categories
  var categories = false;

  // An array of respondents' point totals
  var points = [0];
  // An array of respondents' total credibility scores
  var credibilities = [0];
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
  const tolerableCredibility = 90;

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


  const optionsWithCredibility: ChartOptions<"bar"> = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          font: {
            size: 15,
          },
          generateLabels: (chart: any) => {
            const original =
              ChartJS.defaults.plugins.legend.labels.generateLabels(chart);

            const filtered = original.filter(
              (item: any) => item.text !== (translations as any)[language]["credibility"]
            );

            return [
              ...filtered,
              {
                text:
                  (translations as any)[language]["credibility"] + ` ≥ ${tolerableCredibility}%`,
                fillStyle: "rgba(0, 200, 83, 0.7)",
                strokeStyle: "rgba(0, 200, 83, 1)",
                lineWidth: 1,
                hidden: false,
              },
              {
                text:
                  (translations as any)[language]["credibility"] + ` < ${tolerableCredibility}%`,
                fillStyle: "rgba(255, 0, 0, 0.7)",
                strokeStyle: "rgba(255, 0, 0, 1)",
                lineWidth: 1,
                hidden: false,
              },
            ];
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        border: { display: false },
        grid: { color: "black" },
        ticks: {
          font: { size: 14 },
        },
      },
      y: {
        type: "linear",
        position: "left",
        border: { display: false },
        grid: { color: "black" },
        ticks: {
          font: { size: 15 },
        },
        title: {
          display: true,
          text: (translations as any)[language]["score"],
        },
      },
      y1: {
        type: "linear",
        position: "right",
        min: 0,
        max: 100,
        border: { display: false },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          font: { size: 15 },
          callback: (value: string | number) => `${value}%`,
        },
        title: {
          display: true,
          text: (translations as any)[language]["credibility"],
        },
      },
    },
  };

  // Chart data objects
  // Data for the graph with the sum of respondents' scores
  const data = {
    labels,
    datasets: [
      {
        label: (translations as any)[language]["score"],
        data: points,
        backgroundColor: "rgba(49, 55, 115, 0.9)",
        yAxisID: "y",
      },
      {
        label: (translations as any)[language]["credibility"],
        data: credibilities,
        yAxisID: "y1",
        backgroundColor: (ctx: any) => {
          const value = Number(ctx.raw);
          return value < tolerableCredibility
            ? "rgba(255, 0, 0, 0.7)"
            : "rgba(0, 200, 83, 0.7)";
        },
      },
    ],
  };

  // Data for a graph with average scores in categories
  const dataDetailed = {
    labels: allPointsLabels,
    datasets: [
      {
        label: (translations as any)[language]['score'],
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

  const dataAvgPerAllQuestions = {
    labels: questionsLenArray.map((i) => `Q${i}`),
    datasets: [
      {
        label: (translations as any)[language]["score"],
        data: [] as number[],
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
  const calculateDataDetailed = (): number[] =>
    (allPointsByCategories ?? []).map((arr) => {
      const len = Array.isArray(arr) ? arr.length : 0;
      const credPerValue = buildCredPerValue(len);
      return safeAverage(arr ?? [], credPerValue, credThreshold, applyCredThreshold);
    });

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
    dataDetailed.labels = allPointsLabels.slice().map(getTranslatedValue);
    dataQuestionDetailed.labels = allPointsLabels.slice().map(getTranslatedValue);
    dataQuestionDetailedAllResponders.labels = allPointsLabels.slice().map(getTranslatedValue);
    dataRespondentDetailed.labels = allPointsLabels.slice().map(getTranslatedValue);
    dataRespondentDetailedPerQuestion.labels = allPointsLabels.slice().map(getTranslatedValue);

    totalPointsByCategories = new Array(allPointsLabels.length).fill(0);
    allPointsByCategories = Array.from(
      { length: allPointsLabels.length },
      () => []
    );

    answers.map((answer: any) => (questionsLen = survey?.questions?.length));
    questionsLenArray.length = 0;
    for (var i = 1; i < questionsLen; i++) {
      questionsLenArray.push(i);
    }
   }
  }

    const getRespondentTotalCredibility = (respondentAnswerSet: any): number => {
        return calculateTotalCredibility(
            respondentAnswerSet.answers.map((questionAnswer: any) => ({
                value: calculateCredibility(
                    questionAnswer,
                    getSurveyQuestion(questionAnswer.questionId),
                    credibilityContext
                ),
                questionId: questionAnswer.questionId,
            })),
            survey
        );
    };

  // Function to clear score sum
   const clearScoreSum = (answer: any, respondentTotalCredibility: number) => {   if (survey !== undefined)
   {
    totalPointsByCategories = [];
    totalPointsByCategories.length = 0;
    totalPointsByCategories = totalPointsByCategories = new Array(
      allPointsLabels.length
    ).fill(0);

     totalCredibility = respondentTotalCredibility;
     credibilities.push(totalCredibility);

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
    answers.map((answer: any) => (numberOfQuestions = survey?.questions?.length));

    dataQuestionDetailed.datasets[0].label = "Question ID: " + questionId;
    for (
      let i = parseInt(questionId) - 1;
      i < numberOfQuestions * (labels.length - 1);
      i = i + numberOfQuestions
    ) {
      for (var j = 0; j < allPointsLabels.length; j++) {
        tempAllPointsByCategories[j].push(Number(allPointsByCategories?.[j]?.[i] ?? 0));
      }
    }

     for (var j = 0; j < allPointsLabels.length; j++) {
       const arr = tempAllPointsByCategories[j] ?? [];
       const credPerValue = buildCredPerValue(arr.length);
       avgAttributesPoints.push(safeAverage(arr, credPerValue, credThreshold, applyCredThreshold));
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

    dataAvgPerAllQuestions.labels = questionsLenArray.map((i) => `Q${i}`);
    dataAvgPerAllQuestions.datasets[0].data = questionsLenArray.map((qIndex) => {
      const colIndex = qIndex - 1;

      const vals =
        labels.length - 1 > 0
          ? Array.from({ length: labels.length - 1 }, (_, r) => {
            let sum = 0;
            for (let j = 0; j < allPointsLabels.length; j++) {
              sum += allPointsByCategories[j][r * questionsLen + colIndex] ?? 0;
            }
            return sum;
          })
          : [];

      const credPerValue = buildCredPerValue(vals.length);
      return safeAverage(vals, credPerValue, credThreshold, applyCredThreshold);
    });

    return " ";
  };

  // Function to calculate answer based on question type
  const calculateAnswer = (answer: any): any => {
   if (survey !== undefined)
   {
    const questionAnswer = survey?.questions?.find(
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

  const calculateTotalCredibility = (
      credibilities: { questionId: string; value: number }[],
      survey: { questions: { id: string; ignoreCredibility?: boolean }[] }
  ): number => {
      const validCredibilities = credibilities.filter(({ questionId }) => {
          const question = survey?.questions?.find(
              (q: any) => String(q.id) === String(questionId)
          );
          return !question?.ignoreCredibility;
      });

      if (validCredibilities.length === 0) return 0;

      const total = validCredibilities.reduce((sum, { value }) => sum + value, 0);
      return total / validCredibilities.length;
  };

  // Function to calculate score based on answer and categories' index
  const calculateScore = (answer: any, index: number): any => {
    let calculatedScore = 0;

    if (!survey) return 0;

    const questionAnswer = survey?.questions?.find(
      (question: any) => question.id === answer.questionId
    )?.answer;

    let totalCopy = 0;
    let allAbilityCopy: any[] = [];
    let maxScorePerQn = 0;

    if (categories) {
      totalCopy = totalPointsByCategories[index];
      allAbilityCopy = [...allPointsByCategories[index]];
      maxScorePerQn = questionAnswer?.scoringCategories?.[index]?.score ?? 0;
    } else {
      totalCopy = totalPointsByCategories[0];
      allAbilityCopy = [...allPointsByCategories[0]];
      maxScorePerQn = 1;
    }

    const { score } = calculateQuestionScore({
      answer,
      questionAnswer,
      maxScorePerQn,
    });

    calculatedScore = score;

    totalCopy += calculatedScore >= 0 ? calculatedScore : 0;
    totalCopy = Math.round((totalCopy + Number.EPSILON) * 100) / 100;
    points[points.length - 1] += calculatedScore;

    allAbilityCopy.push(!Number.isNaN(calculatedScore) ? calculatedScore : 0);

    if (categories) {
      totalPointsByCategories[index] = totalCopy;
      allPointsByCategories[index] = [...allAbilityCopy];
    } else {
      totalPointsByCategories[0] = totalCopy;
      allPointsByCategories[0] = [...allAbilityCopy];
    }

    return calculatedScore;
  };

  // Check if points are awarded in categories
  function setCategories(): void {
    if (survey !== undefined)
    {
      answers?.map((answer: any) => (categories = survey.categories));
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
                    <TableCell key={index}>{getTranslatedValue(label)}</TableCell>
                  ))}
                </>
              )}

              {!categories && (
                <TableCell>
                  {(translations as any)[language]["score"]}
                </TableCell>
              )}
                <>
                  <TableCell>{(translations as any)[language]["credibility"]}</TableCell>
                  <TableCell>
                      {(translations as any)[language]["total"]}
                  </TableCell>
                  <TableCell>
                      {(translations as any)[language]["totalCredibility"]}
                  </TableCell>
                </>
            </TableRow>
          </TableHead>
          <TableBody>
              {answers.map((answer: any) => {
                  const respondentTotalCredibility = getRespondentTotalCredibility(answer);

                  return (
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
                      <TableCell key={userAnswer.id}>
                        {survey?.questions?.find(
                          (question: { id: string; ignoreCredibility?: boolean }) =>
                            question.id === userAnswer.questionId
                        )?.ignoreCredibility ? (
                          "-"
                        ) : (
                          <Tooltip
                            title={
                              <>
                                {userAnswer.timeSpent != null && (
                                  <div>
                                    {(translations as any)[language]["timeSpent"]}: {userAnswer.timeSpent / 1000} s
                                  </div>
                                )}

                                {userAnswer.attempts != null && (
                                  <div>
                                    {(translations as any)[language]["attempts"]}: {userAnswer.attempts}
                                  </div>
                                )}

                                {userAnswer.clicks != null && (
                                  <div>
                                    {(translations as any)[language]["clicks"]}: {userAnswer.clicks}
                                  </div>
                                )}

                                {(userAnswer.zoomIns != null || userAnswer.zoomOuts != null) && (
                                  <div>
                                    {(translations as any)[language]["zoomIns"]} / {(translations as any)[language]["zoomOuts"]}:{" "}
                                    {(userAnswer.zoomIns ?? 0) + (userAnswer.zoomOuts ?? 0)}
                                  </div>
                                )}

                                {userAnswer.drags != null && (
                                  <div>
                                    {(translations as any)[language]["drags"]}: {userAnswer.drags}
                                  </div>
                                )}

                                {userAnswer.timeOutsideTab != null && (
                                  <div>
                                    {(translations as any)[language]["timeOutsideTab"]}: {userAnswer.timeOutsideTab / 1000} s
                                  </div>
                                )}

                                {userAnswer.timeStamps?.length > 0 && (
                                  <div>
                                    {(translations as any)[language]["timeStamps"]}:{" "}
                                    {userAnswer.timeStamps.map((t: number) => t / 1000).join(", ")} s
                                  </div>
                                )}

                                {userAnswer.inactivityPeriods?.length > 0 && (
                                  <div>
                                    {(translations as any)[language]["inactivityPeriods"]}:{" "}
                                    {userAnswer.inactivityPeriods.map((t: number) => t / 1000).join(", ")} s
                                  </div>
                                )}
                              </>
                            }
                            arrow
                            placement="top"
                          >
                            <span>
                              {`${calculateCredibility(
                                  userAnswer,
                                  getSurveyQuestion(userAnswer.questionId),
                                  credibilityContext
                              )}%`}
                            </span>
                          </Tooltip>
                        )}
                      </TableCell>
		       {(answerIndex == answer.answers.length-1) && categories && (
		          //<TableCell rowSpan={answer.answers.length+1}>
		          <TableCell>
		              {allPointsLabels.map((label, index) => (
		                //<div key={index} ref={state.myTableCell as React.RefObject<HTMLDivElement>}>
		                <div key={index} >
		                  {getTranslatedValue(label)}:{" "}{totalPointsByCategories[index]}
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
            {answerIndex == answer.answers.length-1 && (

              <TableCell>

                {`${Math.round(respondentTotalCredibility)}%`}

              </TableCell>
            )}
		    </TableRow>                    
		   ))}
               {clearScoreSum(answer, respondentTotalCredibility)}
           </Fragment>
              );
              })}
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

        <Button
          style={{ backgroundColor: selectedBtn === 7 ? "#313773" : "#65688A" }}
          onClick={() => setSelectedBtn(7)}
        >
          {(translations as any)[language]["avgPerAllQuestions"]}
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

      {[2, 3, 7].includes(selectedBtn) && (
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 1, mb: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={applyCredThreshold}
                onChange={(e) => setApplyCredThreshold(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label={(translations as any)[language]["applyCredibilityThreshold"]}
          />
          <TextField
            label={(translations as any)[language]["credibilityThreshold"]}
            type="number"
            size="small"
            value={credThreshold}
            onChange={(e) => setCredThreshold(Number(e.target.value))}
            inputProps={{ min: 0, max: 100, step: 1 }}
            disabled={!applyCredThreshold}
            sx={{ width: 160 }}
          />
        </Box>
      )}

      {selectedBtn === 1 && <Bar options={optionsWithCredibility} data={data} />}
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

      {selectedBtn === 7 && (
        <Bar options={options} data={dataAvgPerAllQuestions} />
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
