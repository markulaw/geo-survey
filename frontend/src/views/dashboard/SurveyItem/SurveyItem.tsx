import React, { useState, useEffect } from "react";
import { SurveyType } from "../../../api/surveyApi";
import styled from "styled-components";
import Button from "@mui/material/Button";
import { translations } from "../../../translate/Translations";
import { useNavigate } from "react-router-dom";
import { languages } from "../../../translate/Translations";

type SurveyItemType = {
  survey: SurveyType;
  startHandler?: (id: number) => void;
  downloadJSON?: (surveyId: number) => void;
  downloadCSV?: (surveyId: number) => void;
  deleteSurveyAndAnswers?: (surveyId: number) => void;
  countFilledSurveys?: number;
  type: "answers" | "questions" | "delete";
};

// Styled component for container
const Container = styled.div`
  margin: 12px;
  width: 34%;
  display: flex;

  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #22223b;

  background: #ffffff;
  border-color: rgba(255, 255, 255, 0.5);
  border-style: solid;
  border-width: 1px;
  border-radius: 5px;

  -webkit-box-shadow: 0px 0px 26px 2px rgba(66, 68, 90, 1);
  -moz-box-shadow: 0px 0px 26px 2px rgba(66, 68, 90, 1);
  box-shadow: 0px 0px 26px 2px rgba(66, 68, 90, 1);

  @media (max-width: 600px) {
    width: 90%;
  }

  @media (min-width: 600px) and (max-width: 1200px) {
    width: 75%;
    height: 100%;
    //font-size: 2rem;
  }
`;

const ColorButton = styled(Button)`
  margin: 12px 0 !important;
  background-color: #22223b !important;
  & hover{
    background-color: #22223b;
  }
  font-size: 1vw;
  @media (min-width: 600px) and (max-width: 1200px) {
   // font-size: 1.5rem !important;
  }
`;

// Set application language based on user preferences:
var language = "en";
if (localStorage.getItem("languageHook") === null)
{
   language = window.navigator.language.substring(0,2);
   var languageFound = false;
   for (var i=0; i<languages.length; i++)
   {
    if (languages[i].code === language)
       languageFound = true;
   }
   if (languageFound === false) language="en";
   localStorage.setItem("languageHook", JSON.stringify(language));
   console.log("Detected language : "+language);
}
else
{
   language = JSON.parse(localStorage.getItem("languageHook") || "");
   console.log("Found stored language : "+language);
}
console.log("SurveyItem language: "+language);

var description = (translations as any)[language]["description"];
var showAnswers = (translations as any)[language]["showAnswers"];
var numberOfFilledSurveys = (translations as any)[language]["numberOfFilledSurveys"];
var openSurvey = (translations as any)[language]["openSurvey"];
var downloadAnswersJSON = (translations as any)[language]["downloadAnswersJSON"];
var downloadAnswersCSV = (translations as any)[language]["downloadAnswersCSV"];
var deleteSurveyAndAnswersTranslation = (translations as any)[language]["deleteSurveyAndAnswers"];

const SurveyItem = ({
  survey,
  startHandler,
  downloadJSON,
  downloadCSV,
  deleteSurveyAndAnswers,
  countFilledSurveys,
  type,
}: SurveyItemType) => {

  const navigate = useNavigate();
  const [reloadPage, setReloadPage] = useState(false);

  // Refresh page after adding new survey
  useEffect(() => {
    if (reloadPage) {
      navigate(`/adminPanel`);
      setReloadPage(false);
    }
  }, [reloadPage]);

const deleteAnswers = () => {
  setReloadPage(true);
  deleteSurveyAndAnswers?.(survey.surveyId)
}

  return (
    <Container>
      <h3>{survey.title}</h3>
      <span>
        {description}: {survey?.description}
      </span>
      {type === "answers" && (
        <h4>
          {numberOfFilledSurveys}
          {countFilledSurveys}
        </h4>
      )}
      {(type === "answers" || type === "questions") && (
        <ColorButton
          variant="contained"
          onClick={() => startHandler?.(survey.surveyId)}
        >
          {type === "answers" ? showAnswers : openSurvey}
        </ColorButton>
      )}
      {type === "answers" && (
        <ColorButton
          variant="contained"
          onClick={() => downloadJSON?.(survey.surveyId)}
        >
          {downloadAnswersJSON}
        </ColorButton>
      )}
      {type === "answers" && (
        <ColorButton
          variant="contained"
          onClick={() => downloadCSV?.(survey.surveyId)}
        >
          {downloadAnswersCSV}
        </ColorButton>
      )}
      {type === "delete" && (
        <ColorButton
          variant="contained"
          onClick={() => deleteSurveyAndAnswers?.(survey.surveyId)}
        >
          {deleteSurveyAndAnswersTranslation}
        </ColorButton>
      )}
    </Container>
  );
};

export default SurveyItem;
