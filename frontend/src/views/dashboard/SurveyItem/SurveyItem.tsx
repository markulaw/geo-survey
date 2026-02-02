import React, { useState, useEffect } from "react";
import { SurveyType } from "../../../api/surveyApi";
import styled from "styled-components";
import Button from "@mui/material/Button";
import { translations } from "../../../translate/Translations";
import { useNavigate } from "react-router-dom";
import { languages } from "../../../translate/Translations";
import {getTranslatedValue} from "../../../helpers/GetTranslatedValue";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";

type SurveyItemType = {
  survey: SurveyType;
  startHandler?: (id: number) => void;
  downloadJSON?: (surveyId: number, applyThreshold?: boolean, threshold?: number) => void;
  downloadCSV?: (surveyId: number, applyThreshold?: boolean, threshold?: number) => void;
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
  type
}: SurveyItemType) => {

  const navigate = useNavigate();
  const [reloadPage, setReloadPage] = useState(false);
  const [downloadApplyCredThreshold, setDownloadApplyCredThreshold] = useState<boolean>(false);
  const [downloadCredThreshold, setDownloadCredThreshold] = useState<number>(50);

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
      <h3>{getTranslatedValue(survey.title)}</h3>
      <span>
      {description}: {getTranslatedValue(survey?.description)}
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
        <Box
          sx={{
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 2,
            p: 2,
            mt: 2,
            width: "100%",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
            <ColorButton
              variant="contained"
              onClick={() => downloadJSON?.(survey.surveyId, downloadApplyCredThreshold, downloadCredThreshold)}
            >
              {downloadAnswersJSON}
            </ColorButton>

            <ColorButton
              variant="contained"
              onClick={() => downloadCSV?.(survey.surveyId, downloadApplyCredThreshold, downloadCredThreshold)}
            >
              {downloadAnswersCSV}
            </ColorButton>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={downloadApplyCredThreshold}
                  onChange={(e) => setDownloadApplyCredThreshold?.(e.target.checked)}
                  size="small"
                  color="primary"
                />
              }
              label={(translations as any)[language]["applyCredibilityThreshold"]}
            />
            <TextField
              label={(translations as any)[language]["credibilityThreshold"]}
              type="number"
              size="small"
              value={downloadCredThreshold}
              onChange={(e) => setDownloadCredThreshold?.(Number(e.target.value))}
              inputProps={{ min: 0, max: 100, step: 1 }}
              disabled={!downloadApplyCredThreshold}
              sx={{ width: 120 }}
            />
          </Box>
        </Box>
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
