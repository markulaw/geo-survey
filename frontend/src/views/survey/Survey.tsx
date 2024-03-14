import React, { useEffect, useRef, useState } from "react";
import Map from "../map/Map";
import Question from "./question/Question";
import styled from "styled-components";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { SurveyType } from "../../api/surveyApi";
import { getSurvey, saveAnswer } from "../../api/surveyApi";
import { translations } from "../../translate/Translations";
import { TiTickOutline } from "react-icons/ti";

import {
  // Importing functions from @turf/turf library for geospatial analysis
  distance,
  booleanPointInPolygon,
  length,
  intersect,
  lineIntersect,
  lineSlice,
  point,
  area,
  centerOfMass,
  lineSplit,
  center,
  feature,
} from "@turf/turf";

const _ = require("lodash");

const Container = styled.div`
  position: relative;
`;

const Survey = () => {
  const [survey, setSurvey] = useState<SurveyType | undefined>();
  const [currentQuestionId, setCurrentQuestionId] = useState<number>(0);
  const [clickedAnswers, setClickedAnswers] = useState<any>(undefined);
  const [userData, setUserData] = useState();
  const [answers, setAnswers] = useState<any>();
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const mapFunc = useRef<() => void>();
  const mapEndDrawFunc = useRef<() => void>();
  const [clicked, setClicked] = useState<boolean>(false);
  const [completedSurvey, setCompletedSurvey] = useState<boolean>(false);

  // Initialize arrays and states for scoring
  var maxPoints: number[][] = [];
  var totalPointsByCategories: number[][] = [];
  const [maxPointsConstant, setMaxPointsConstant] = useState<number[][]>([]);
  const [totalPointsByCategoriesConstant, setTotalPointsByCategoriesConstant] =
    useState<number[][]>([]);
  const [ifInitializedMaxPoints, setIfInitializedMaxPoints] =
    useState<boolean>(false);
  const [
    ifInitializedTotalPointsByCategories,
    setIfInitializedTotalPointsByCategories,
  ] = useState<boolean>(false);
  const [summaryContent, setSummaryContent] = useState(<div></div>);

  // Constants for scoring calculation
  const acceptableDistance = 30;
  const acceptableMin = 50;

  // Language handling
  var language = "pl";
  if (localStorage.getItem("languageHook") != null)
    language = JSON.parse(localStorage.getItem("languageHook") || "");

  // Translated texts:
  var genericThanks = (translations as any)[language]["genericThanks"];
  var scored = (translations as any)[language]["scored"];
  var points = (translations as any)[language]["points"];
  var percentage = (translations as any)[language]["percentage"];
  var scoredCategories = (translations as any)[language]["scoredCategories"];

  // Effect hook to fetch survey data and user data when component mounts
  useEffect(() => {
    // If no survey data is passed through location state, redirect to login
    if (!location?.state) navigate("/login");
    const { survey } = location?.state as { survey: SurveyType };
    const { user } = location?.state as { user: any };
    // If no user data is present, redirect to login
    if (!user) navigate("/login");
    setUserData(user);
    // If no survey data is present, fetch survey based on URL parameter ID
    if (!survey) {
      const surveyId = Number(params?.id) || 0;
      fetchSurvey(surveyId);
      return;
    }
    // Set survey data and reset current question index and survey completion status
    setSurvey(survey);
    setCurrentQuestionId(0);
    setCompletedSurvey(false);
  }, []);

  // Function to fetch survey data based on survey ID
  const fetchSurvey = async (id: number) => {
    const survey = await getSurvey(id);
    setSurvey(survey);
    setCurrentQuestionId(0);
    setCompletedSurvey(false);
  };

  // Function to initialize maxPoints array
  const initializeMaxPoints = () => {
    if (
      survey?.categoriesNames !== undefined &&
      maxPoints.length == 0 &&
      ifInitializedMaxPoints
    ) {
      maxPoints = [...maxPointsConstant];
      setIfInitializedMaxPoints(true);
    }
    if (
      survey?.categoriesNames !== undefined &&
      maxPoints.length == 0 &&
      !ifInitializedMaxPoints
    ) {
      for (let i = 0; i < survey?.categoriesNames?.length; i++) {
        const newRow: number[] = [];
        for (let j = 0; j < survey?.questions.length; j++) {
          newRow.push(0);
        }
        maxPoints.push(newRow);
      }
      setIfInitializedMaxPoints(true);
    }
  };

  // Function to initialize totalPointsByCategories array
  const initializeTotalPointsByCategories = () => {
    if (
      survey?.categoriesNames !== undefined &&
      totalPointsByCategories.length == 0 &&
      !ifInitializedTotalPointsByCategories
    ) {
      totalPointsByCategories = [...totalPointsByCategoriesConstant];
    }

    if (
      survey?.categoriesNames !== undefined &&
      totalPointsByCategories.length == 0 &&
      !ifInitializedTotalPointsByCategories
    ) {
      for (let i = 0; i < survey?.categoriesNames?.length; i++) {
        const newRow: number[] = [];
        for (let j = 0; j < survey?.questions.length; j++) {
          newRow.push(0);
        }
        totalPointsByCategories.push(newRow);
      }
      setIfInitializedTotalPointsByCategories(true);
    }
  };

  // Function to change current question
  const changeQuestion = (id: number) => {
    setCurrentQuestionId(id);
    setClicked(false);
  };

  // Function to update answer based on (and after) user interaction with the map
  const updateAnswer = (geoJSONAnswer: any, layer: any, questionIndex: any) => {
    // Update clickedAnswers state with the clicked layer
    setClickedAnswers((prevClickedValues: any) => {
      return { ...prevClickedValues, [questionIndex]: layer };
    });
    // Click detected (you can go to the next question)
    setClicked(true);

    // Recalculate the current scores for all categories, if they exsist
    if (survey && survey?.categoriesNames !== undefined) {
      for (let id = 0; id < survey?.categoriesNames?.length; id++) {
        calculateScore(geoJSONAnswer, id, questionIndex);
      }
    }

    // Save a new answer with question id, question type and geoJSON answer (answer chosen on the map)
    const newAnswer = {
      questionId: survey?.questions[questionIndex].id,
      type: survey?.questions[questionIndex].answerType,
      geoJSON: geoJSONAnswer,
    };
    setAnswers((prevValues: any) => {
      return { ...prevValues, [questionIndex]: newAnswer };
    });
  };

  // Function to save the completed survey, after completing and sending it
  const sendSurvey = () => {
    const answerArray = Object.values(answers).map((item) => item);
    saveAnswer({
      surveyId: survey?.surveyId || 0,
      user: userData,
      answers: answerArray,
    });
    if (!survey?.summary) {
      navigate("/login", {
        state: {
          survey: survey,
        },
      });
    } else {
      setCompletedSurvey(true);
    }
  };

  const backToLogin = () => {
    navigate("/login", {
      state: {
        survey: survey,
      },
    });
  };

  const selectLayer = () => {
    if (!mapFunc?.current) return;
    mapFunc.current();
  };

  // Function to save the answer to a question type Images, detecting a click outside the map
  const sendSurveyImages = (
    selectedImages: Array<boolean>,
    questionIndex: any
  ) => {
    setClickedAnswers((prevClickedValues: any) => {
      return { ...prevClickedValues, selectedImages };
    });
    // Click detected (you can go to the next question)
    setClicked(true);

    // Recalculate the current scores for all categories if they exisist
    if (survey && survey?.categoriesNames !== undefined) {
      for (let id = 0; id < survey?.categoriesNames?.length; id++) {
        calculateScore(selectedImages.toString(), id, questionIndex);
      }
    }

    // Save new answer, geoJSON answer is null, optional field to save images selection set
    const newAnswer = {
      questionId: survey?.questions[questionIndex].id,
      type: survey?.questions[questionIndex].answerType,
      geoJSON: null,
      imagesChoose: selectedImages.toString(),
    };
    // Click detected (you can go to the next question)
    setAnswers((prevValues: any) => {
      return { ...prevValues, [questionIndex]: newAnswer };
    });
  };

  // Function to save the answer to a question type Slider, detecting a click outside the map
  const sendSurveySlider = (sliderValue: number, questionIndex: any) => {
    setClickedAnswers((prevClickedValues: any) => {
      return { ...prevClickedValues, sliderValue };
    });
    // Click detected (you can go to the next question)
    setClicked(true);

    // Recalculate the current scores for all categories if they exisist
    if (survey && survey?.categoriesNames !== undefined) {
      for (let id = 0; id < survey?.categoriesNames?.length; id++) {
        calculateScore(sliderValue, id, questionIndex);
      }
    }

    // Save new answer, geoJSON answer is null, optional field to save Slider answer value set
    const newAnswer = {
      questionId: survey?.questions[questionIndex].id,
      type: survey?.questions[questionIndex].answerType,
      geoJSON: null,
      sliderValue: sliderValue,
    };

    setAnswers((prevValues: any) => {
      return { ...prevValues, [questionIndex]: newAnswer };
    });
  };

  // Function to save the answer to a question type Single choice, detecting a click outside the map
  const sendSurveySingleChoice = (
    selectedAnswer: number,
    questionIndex: any
  ) => {
    setClickedAnswers((prevClickedValues: any) => {
      return { ...prevClickedValues, selectedAnswer };
    });
    // Click detected (you can go to the next question)
    setClicked(true);

    // Recalculate the current scores for all categories if they exisist
    if (survey && survey?.categoriesNames !== undefined) {
      for (let id = 0; id < survey?.categoriesNames?.length; id++) {
        calculateScore(selectedAnswer.toString(), id, questionIndex);
      }
    }

    // Save new answer, geoJSON answer is null, optional field to save single choice answer set
    const newAnswer = {
      questionId: survey?.questions[questionIndex].id,
      type: survey?.questions[questionIndex].answerType,
      geoJSON: null,
      singleChoice: selectedAnswer.toString(),
    };

    setAnswers((prevValues: any) => {
      return { ...prevValues, [questionIndex]: newAnswer };
    });
  };

  // Function to save the answer to a question type Single image choice, detecting a click outside the map
  const sendSurveySingleImage = (selectedImage: number, questionIndex: any) => {
    setClickedAnswers((prevClickedValues: any) => {
      return { ...prevClickedValues, selectedImage };
    });
    // Click detected (you can go to the next question)
    setClicked(true);

    // Recalculate the current scores for all categories if they exisist
    if (survey && survey?.categoriesNames !== undefined) {
      for (let id = 0; id < survey?.categoriesNames?.length; id++) {
        calculateScore(selectedImage.toString(), id, questionIndex);
      }
    }

    // Save new answer, geoJSON answer is null, optional field to save single image choice answer set
    const newAnswer = {
      questionId: survey?.questions[questionIndex].id,
      type: survey?.questions[questionIndex].answerType,
      geoJSON: null,
      singleImage: selectedImage.toString(),
    };

    setAnswers((prevValues: any) => {
      return { ...prevValues, [questionIndex]: newAnswer };
    });
  };

  // Function to save the answer to a question type multiple choice, detecting a click outside the map
  const sendSurveyMultipleChoice = (
    selectedAnswers: Array<Number>,
    questionIndex: any
  ) => {
    setClickedAnswers((prevClickedValues: any) => {
      return { ...prevClickedValues, selectedAnswers };
    });
    // Click detected (you can go to the next question)
    setClicked(true);

    // Recalculate the current scores for all categories if they exisist
    if (survey && survey?.categoriesNames !== undefined) {
      for (let id = 0; id < survey?.categoriesNames?.length; id++) {
        calculateScore(selectedAnswers.toString(), id, questionIndex);
      }
    }

    // Save new answer, geoJSON answer is null, optional field to save multiple choice answer set
    const newAnswer = {
      questionId: survey?.questions[questionIndex].id,
      type: survey?.questions[questionIndex].answerType,
      geoJSON: null,
      multipleChoice: selectedAnswers.toString(),
    };

    setAnswers((prevValues: any) => {
      return { ...prevValues, [questionIndex]: newAnswer };
    });
  };

  // Function to save the answer to a question type Table, detecting a click outside the map
  const sendSurveyTableChoices = (
    tableChoices: Array<Number>,
    questionIndex: any
  ) => {
    setClickedAnswers((prevClickedValues: any) => {
      return { ...prevClickedValues, tableChoices };
    });
    // Click detected (you can go to the next question)
    setClicked(true);

    // Recalculate the current scores for all categories if they exisist
    if (survey && survey?.categoriesNames !== undefined) {
      for (let id = 0; id < survey?.categoriesNames?.length; id++) {
        calculateScore(tableChoices.toString(), id, questionIndex);
      }
    }

    // Save new answer, geoJSON answer is null, optional field to save table answers set
    const newAnswer = {
      questionId: survey?.questions[questionIndex].id,
      type: survey?.questions[questionIndex].answerType,
      geoJSON: null,
      table: tableChoices.toString(),
    };

    setAnswers((prevValues: any) => {
      return { ...prevValues, [questionIndex]: newAnswer };
    });
  };

  const endStringDraw = () => {
    if (!mapEndDrawFunc?.current) return;
    mapEndDrawFunc.current();
  };

  function sumPositiveNumbers(arr: number[]): number {
    return arr.reduce((accumulator, currentValue) => {
      if (currentValue > 0) {
        return accumulator + currentValue;
      } else {
        return accumulator;
      }
    }, 0);
  }

  // Function to calculate the score obtained by the respondent, the calculation of points is optional and is used when displaying the summary
  const calculateScore = (
    answer: any,
    index: number,
    questionIndex: number
  ): any => {
    // Initialize variables for counting scores
    var calculatedScore = 0;
    var calculatedMaxScore = 0;
    var maxScorePerQn = 0;

    initializeMaxPoints();
    initializeTotalPointsByCategories();

    // If scoring categories exsist, check max score per question
    if (
      survey?.categories &&
      survey?.questions[questionIndex]?.answer?.scoringCategories[index]
        ?.score !== undefined
    ) {
      maxScorePerQn =
        survey?.questions[questionIndex]?.answer?.scoringCategories[index]
          ?.score;
    } else {
      // Otherwise, set max score per question to 1
      maxScorePerQn = 1;
    }

    // Calculation of scores for given question types, same as in AdminPanel.tsx
    if (survey?.questions[questionIndex])
      if (
        survey?.questions[questionIndex]?.answer.geometry.type === "Point" &&
        survey?.questions[questionIndex].answerType === "Point"
      ) {
        if (
          distance(answer, survey?.questions[questionIndex]?.answer.geometry, {
            units: "meters",
          }) < acceptableDistance
        ) {
          var scoreRange =
            (acceptableDistance -
              distance(
                survey?.questions[questionIndex]?.answer.geoJSON,
                survey?.questions[questionIndex]?.answer.geometry,
                {
                  units: "meters",
                }
              )) /
            acceptableDistance;

          calculatedScore = maxScorePerQn * scoreRange;
          calculatedScore =
            Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
        }
        calculatedScore = calculatedScore >= 0 ? calculatedScore : 0;
        calculatedScore =
          Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
        calculatedMaxScore = maxScorePerQn;
      } else if (
        survey?.questions[questionIndex]?.answer.geometry?.type === "Polygon" &&
        survey?.questions[questionIndex].answerType === "Point"
      ) {
        if (
          booleanPointInPolygon(
            survey?.questions[questionIndex]?.answer.geoJSON,
            survey?.questions[questionIndex]?.answer.geometry
          )
        ) {
          calculatedScore = maxScorePerQn;
          calculatedScore = calculatedScore >= 0 ? calculatedScore : 0;
          calculatedScore =
            Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
        }
        calculatedScore =
          Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
        calculatedMaxScore = maxScorePerQn;
      } else if (
        survey?.questions[questionIndex]?.answer.geometry?.type === "Polygon" &&
        survey?.questions[questionIndex]?.answer.answerType === "LineString"
      ) {
        let line = survey?.questions[questionIndex]?.answer.geoJSON;
        let poly = survey?.questions[questionIndex]?.answer.geometry;
        const poly2 = feature(poly);
        var overlapping = lineSplit(feature(line), poly2);
        let intersectionLength2 = 0;
        for (let i = 0; i < overlapping.features.length; i++) {
          let pointInCenter = centerOfMass(overlapping.features[i]);
          if (booleanPointInPolygon(pointInCenter, poly))
            intersectionLength2 += length(overlapping.features[i].geometry);
        }
        const lineLength = length(line);
        let percentage = (intersectionLength2 / lineLength) * 100;
        if (Math.round(percentage) > acceptableMin) {
          var scoreRange = Math.round(percentage) / 100;

          calculatedScore = maxScorePerQn * scoreRange;
          calculatedScore = calculatedScore >= 0 ? calculatedScore : 0;
          calculatedScore =
            Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
        }
        calculatedScore =
          Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
        calculatedMaxScore = maxScorePerQn;
      } else if (
        survey?.questions[questionIndex]?.answer.geometry?.type === "Polygon" &&
        survey?.questions[questionIndex]?.answer.answerType === "Polygon"
      ) {
        let answerPoly = survey?.questions[questionIndex]?.answer.geoJSON;
        let questionPoly = survey?.questions[questionIndex]?.answer.geometry;
        const intersectedPoly = intersect(answerPoly, questionPoly);
        if (!intersectedPoly) {
          calculatedScore = 0;
        } else {
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
          calculatedScore =
            Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
          calculatedMaxScore = maxScorePerQn;
        }
      } else if (
        survey?.questions[questionIndex]?.answer.geometry?.type === "Slider" &&
        survey?.questions[questionIndex].answerType === "Slider"
      ) {
        if (survey?.questions[questionIndex]?.answer.goodAnswer == answer) {
          calculatedScore = maxScorePerQn;
          calculatedScore = calculatedScore >= 0 ? calculatedScore : 0;
          calculatedScore =
            Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
        }
        calculatedScore =
          Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
        calculatedMaxScore = maxScorePerQn;
      } else if (
        survey?.questions[questionIndex]?.answer.geometry?.type === "Images" &&
        survey?.questions[questionIndex].answerType === "Images"
      ) {
        const splitedArr = answer.split(",");
        for (let i = 0; i < splitedArr.length; i++) {
          if (splitedArr[i] == "true") {
            calculatedScore +=
              maxScorePerQn *
              survey?.questions[questionIndex]?.answer.points[i];
            calculatedScore =
              Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
          }
        }
        calculatedScore = calculatedScore >= 0 ? calculatedScore : 0;
        calculatedScore =
          Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
        calculatedMaxScore = maxScorePerQn;
      } else if (
        survey?.questions[questionIndex]?.answer.geometry?.type ===
          "SingleChoice" &&
        survey?.questions[questionIndex].answerType === "SingleChoice"
      ) {
        if (survey?.questions[questionIndex]?.answer.points[answer]) {
          calculatedScore =
            maxScorePerQn *
            survey?.questions[questionIndex]?.answer.points[answer];
          calculatedScore =
            Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
        }
        calculatedScore = calculatedScore >= 0 ? calculatedScore : 0;
        calculatedScore =
          Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
        calculatedMaxScore =
          Math.max(...survey?.questions[questionIndex]?.answer.points) *
          maxScorePerQn;
      } else if (
        survey?.questions[questionIndex]?.answer.geometry?.type ===
          "SingleImage" &&
        survey?.questions[questionIndex].answerType === "SingleImage"
      ) {
        if (survey?.questions[questionIndex]?.answer.points[answer]) {
          calculatedScore =
            maxScorePerQn *
            survey?.questions[questionIndex]?.answer.points[answer];
          calculatedScore =
            Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
        }
        calculatedScore = calculatedScore >= 0 ? calculatedScore : 0;
        calculatedScore =
          Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
        calculatedMaxScore =
          Math.max(...survey?.questions[questionIndex]?.answer.points) *
          maxScorePerQn;
      } else if (
        survey?.questions[questionIndex]?.answer.geometry?.type ===
          "MultipleChoice" &&
        survey?.questions[questionIndex].answerType === "MultipleChoice"
      ) {
        const splitedArr = answer.split(",");
        for (let i = 0; i < splitedArr.length; i++) {
          if (splitedArr[i] == "true") {
            calculatedScore +=
              maxScorePerQn *
              survey?.questions[questionIndex]?.answer.points[i];
            calculatedScore =
              Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
          }
        }
        calculatedScore = calculatedScore >= 0 ? calculatedScore : 0;
        calculatedScore =
          Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
        calculatedMaxScore =
          sumPositiveNumbers(survey?.questions[questionIndex]?.answer.points) *
          maxScorePerQn;
      } else if (
        survey?.questions[questionIndex]?.answer.geometry?.type === "Table" &&
        survey?.questions[questionIndex].answerType === "Table"
      ) {
        const splitedArr = answer.split(",");
        for (let i = 0; i < splitedArr.length; i++) {
          calculatedScore +=
            maxScorePerQn *
            survey?.questions[questionIndex]?.answer?.points[
              i * survey?.questions[questionIndex]?.answer.answers.length +
                parseInt(splitedArr[i])
            ];
          calculatedScore =
            Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
        }
        calculatedScore = calculatedScore >= 0 ? calculatedScore : 0;
        calculatedScore =
          Math.round((calculatedScore + Number.EPSILON) * 100) / 100;
        calculatedMaxScore =
          sumPositiveNumbers(survey?.questions[questionIndex]?.answer.points) *
          maxScorePerQn;
      }
    calculatedScore = !Number.isNaN(calculatedScore) ? calculatedScore : 0;

    if (maxPoints.length == 0) {
      maxPoints = [...maxPointsConstant];
    }
    if (totalPointsByCategories.length == 0) {
      totalPointsByCategories = [...totalPointsByCategoriesConstant];
    }
    if (survey?.categories) {
      totalPointsByCategories[index][questionIndex] = calculatedScore;
      maxPoints[index][questionIndex] = calculatedMaxScore;
    } else {
      totalPointsByCategories[index][questionIndex] = calculatedScore;
      maxPoints[index][questionIndex] = calculatedMaxScore;
    }
    setMaxPointsConstant(maxPoints);
    setTotalPointsByCategoriesConstant(totalPointsByCategories);
    createSummaryDescription();
  };

  const iconStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const createSummaryDescription = () => {
    // Auxiliary arrays to calculate the percentage of correct answers
    const flattenedTotalArray = totalPointsByCategories.map((row) =>
      row.reduce((acc, val) => acc + val, 0)
    );

    const flattenedMaxArray = maxPoints.map((row) =>
      row.reduce((acc, val) => acc + val, 0)
    );

    var percentages = flattenedTotalArray.map(
      (total, index) => (total / flattenedMaxArray[index]) * 100
    );

    // The percentage of correct answers
    percentages = percentages.map((number) => Math.round(number * 10) / 10);

    // Find the category in which the respondent scored the most points (if category exist)
    let maxIndex = 0;
    let maxValue = percentages[0];
    if (
      survey?.summary &&
      survey?.summaryDetails !== undefined &&
      survey?.categoriesNames !== undefined
    ) {
      for (let i = 1; i < percentages.length; i++) {
        if (percentages[i] > maxValue) {
          maxValue = percentages[i];
          maxIndex = i;
        }
      }
    }

    // Set how the summary looks after the survey is completed (if such is to be displayed, it is personalized against the survey settings)
    setSummaryContent(
      <div>
        <div style={iconStyle}>
          <TiTickOutline size={70} />
        </div>
        <br></br>
        {survey?.summary && survey?.summaryDetails !== undefined && (
          <>
            {survey?.summaryDetails.thanks?.generic && <h2>{genericThanks}</h2>}
            <div></div>
            {survey?.summaryDetails.thanks?.custom !== undefined && (
              <h2>{survey?.summaryDetails.thanks?.custom}</h2>
            )}
            <br></br>
            {survey?.summaryDetails?.points !== undefined &&
              (survey?.summaryDetails?.points?.pointsWithoutConditions ||
                survey?.summaryDetails?.points?.pointsAbovePercentage <=
                  percentages[maxIndex]) &&
              !survey?.categories && (
                <p>
                  {scored}
                  {flattenedTotalArray[maxIndex]}/{flattenedMaxArray[maxIndex]}{" "}
                  {points}
                </p>
              )}
            {survey?.summaryDetails?.percentage !== undefined &&
              (survey?.summaryDetails?.percentage
                ?.percentageWithoutConditions ||
                survey?.summaryDetails?.percentage?.percentageAboveThreshold <=
                  percentages[maxIndex]) &&
              !survey?.categories && (
                <p>
                  {scored}
                  {percentages[maxIndex]}
                  {percentage}
                </p>
              )}
            {(survey?.summaryDetails?.categories
              ?.categoriesDescriptionAboveThresholdPercentage <=
              percentages[maxIndex] || survey?.summaryDetails?.percentage
              ?.percentageWithoutConditions) &&
              survey?.categories &&
              survey?.categoriesNames && (
                <p>
                  {scoredCategories}
                  {survey?.categoriesNames[maxIndex]} : {percentages[maxIndex]}%
                </p>
              )}
            {survey?.summaryDetails?.categories
              ?.theBestCategorySummaryDescription &&
              survey?.categories &&
              survey?.categoriesNames && (
                <p>
                  {
                    survey?.scoringCategoriesDescription[maxIndex]
                      .theBestCategorySummaryDescription
                  }
                </p>
              )}
          </>
        )}
        <br></br>
        <br></br>
      </div>
    );
  };

  const answer = clickedAnswers ? clickedAnswers[currentQuestionId] : null;

  //console.log("wmsParams global: "+survey?.wmsParams);
  //console.log("wmsParams local: "+survey?.questions[currentQuestionId].wmsParams);
  //console.log("wmsParams LAYERS: "+survey?.wmsParams.LAYERS);

  return (
    <Container>
      <Question
        question={survey?.questions[currentQuestionId]}
        changeQuestion={changeQuestion}
        currentQuestionId={currentQuestionId}
        questionsLenght={survey?.questions.length || 0}
        clickedAnswer={answer}
        endHandler={sendSurvey}
        backToLogin={backToLogin}
        selectHandler={selectLayer}
        endDrawHandler={endStringDraw}
        handleImage={sendSurveyImages}
        handleSlider={sendSurveySlider}
        handleSingleChoice={sendSurveySingleChoice}
        handleSingleImage={sendSurveySingleImage}
        handleMultipleChoice={sendSurveyMultipleChoice}
        handleTableChoices={sendSurveyTableChoices}
        clicked={clicked}
        summary={survey?.summary}
        summaryDescription={summaryContent}
        completedSurvey={completedSurvey}
      />
      <Map
        updateAnswer={updateAnswer}
        actualAnswer={answer}
        answerType={survey?.questions[currentQuestionId].answerType}
        questionIndex={currentQuestionId}
        mapFunc={mapFunc}
        zoom={survey?.questions[currentQuestionId].mapZoom || survey?.zoom}
        center={
          survey?.questions[currentQuestionId].mapCenter || survey?.center
        }
        mapEndDrawFunc={mapEndDrawFunc}
        mapUrl={
          survey?.questions[currentQuestionId].mapUrlForQuestion ||
          survey?.mapUrl
        }
        wmsParams={
          survey?.questions[currentQuestionId].wmsParams || survey?.wmsParams
        }
        mapAttribution={
          survey?.questions[currentQuestionId].mapAttribution ||
          survey?.mapAttribution ||
          " "
        }
      />
    </Container>
  );
};

export default Survey;
