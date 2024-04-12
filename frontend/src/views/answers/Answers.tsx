import React, { useLayoutEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Button from "@mui/material/Button";
import { getAnswers, getSurvey } from "../../api/surveyApi";
import AnswersList from "./AnswersList";
import { translations } from "../../translate/Translations";

// Styled components for styling the components
const Container = styled.div`
  display: flex;
  padding-top: 24px;
  padding-bottom: 24px;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  height: 100%;
`;

const ColorButton = styled(Button)`
  margin-top: 15px !important;
  margin-bottom: 10px;
  background-color: ${({ disabled }) =>
    disabled ? "#555574" : "#22223b"}!important;
  color: white !important;
  & hover{
    background-color #22223b:
  }
`;

const Content = styled.div`
  width: 90%;
  height: 100%;
  padding: 5px 24px 34px;
  background: #ffffff;
  border-color: rgba(255, 255, 255, 0.5);
  border-style: solid;
  border-width: 1px;
  border-radius: 15px;
  color: #22223b;
/*  -webkit-box-shadow: 0px 0px 26px 2px rgba(66, 68, 90, 1); */
/*  -moz-box-shadow: 0px 0px 26px 2px rgba(66, 68, 90, 1); */
/*  box-shadow: 0px 0px 26px 2px rgba(66, 68, 90, 1); */
`;

const AnswersHeader = styled.h2`
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Functional component for displaying survey responses
const Answers = () => {
  const [answers, setAnswers] = useState([]);
  const [survey, setSurvey] = useState<any>();
  let { id: surveyId } = useParams();
    
  const fetchAnswers = async (surveyId: number) => {
    const answers = await getAnswers(surveyId);
    setAnswers(answers);
  };

  const fetchSurvey = async (surveyId: number) => {
    const survey = await getSurvey(surveyId);
    setSurvey(survey);
  };

  // Fetch survey answers and survey data on component mount
  useLayoutEffect(() => {
    if (surveyId !== undefined) {
      fetchAnswers(+surveyId);
      fetchSurvey(+surveyId);
    }
  }, []);
  
  // Language setting
  var language = "pl";
  if (localStorage.getItem("languageHook") != null)
      language = JSON.parse(localStorage.getItem("languageHook") || "");

  let navigate = useNavigate();
  
  return (
    <Container>
      <Content>
        <AnswersHeader>
          {(translations as any)[language]["surveyResponses"]} {surveyId}
        </AnswersHeader>
        <AnswersList answers={answers} survey={survey} />
      </Content>
        <ColorButton
            variant="contained"
            onClick={() => navigate(-1)}
          >
          {(translations as any)[language]["goBack"]}          
          </ColorButton>      
    </Container>
  );
};

export default Answers;
