import React, { useEffect, useState } from "react";
import { getSurveys } from "../../api/surveyApi";
import { SurveyType } from "../../api/surveyApi";
import SurveyItem from "./SurveyItem/SurveyItem";
import styled from "styled-components";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { languages } from "../../translate/Translations";
import { Box, FormControl, NativeSelect } from "@mui/material";

// Styled component for main container
const Container = styled.div`
  display: flex;
  padding-top: 24px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Dashoard = () => {
  const [surveys, setSurveys] = useState<SurveyType[] | []>([]);
  const navigate = useNavigate();
  const params = useParams();
  
  console.log("Received: "+params.surveyName);
  
  const surveyName = params.surveyName || '';

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    const importedSurveys = await getSurveys();
    setSurveys(importedSurveys);
  };

  // Function to handle survey start event
  const startHandler = (id: number) => {
    navigate("/login", {
      state: {
        survey: surveys.find((survey) => survey.surveyId === id),
      },
    });
  };
  
  var language = "pl";
  if (localStorage.getItem("languageHook") != null)
    language = JSON.parse(localStorage.getItem("languageHook") || "");
  
  // Language Menu function:
  const handlelanguageChange = async (e: any) => {
    console.log(e.target.value);
    language = e.target.value;
    localStorage.setItem("languageHook", JSON.stringify(language));
    window.location.reload();
  };

  return (
   <>
    <div style={{ height: "100px", width: "100%" }} className="spacer"></div>
    <Container>
     <Box sx={{ minWidth: 120 }}>
       <FormControl fullWidth>
        <NativeSelect
          id="languageSelect"
          defaultValue={language}
          onChange={handlelanguageChange}
          style={{
            padding: '4px 1px 4px 27px',
            fontFamily: "Roboto, Helvetica, Arial, sans-serif",
            textTransform: 'uppercase',
            fontSize: '0.875rem',
            backgroundColor: '#22223b',
            color: '#ffffff',
            borderRadius: '4px',
          }}
        >
          {languages.map((language) => (
            <option
              style={{
                backgroundColor: '#65688A',
                color: '#ffffff',
              }}
              value={language.code}
            >
              {language.name}
            </option>
          ))}
        </NativeSelect>
       </FormControl>
      </Box>
      <div style={{ height: "100px", width: "100%" }} className="spacer"></div>
      {surveys.filter((survey) => survey.title.includes(surveyName)).map((survey) => (
        <SurveyItem
          survey={survey}
          key={survey.surveyId}
          startHandler={startHandler}
          type="questions"
        />
      ))}
    </Container>
   </>
  );
};

export default Dashoard;
