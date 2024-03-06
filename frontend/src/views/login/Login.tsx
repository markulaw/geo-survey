import React from "react";
import styled from "styled-components";
import LoginForm from "./loginForm/LoginForm";
import { translations, languages } from "../../translate/Translations";
import { Box, FormControl, NativeSelect } from "@mui/material";

// Styled component for the main container
const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

// Styled component for the login container
const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  color: white;
  width: 25%;
  height: 60%;
  background: #ffffff;
  border-color: rgba(255, 255, 255, 0.5);
  border-style: solid;
  border-width: 1px;
  border-radius: 3%;

  -webkit-box-shadow: 0px 0px 26px 2px rgba(66, 68, 90, 1);
  -moz-box-shadow: 0px 0px 26px 2px rgba(66, 68, 90, 1);
  box-shadow: 0px 0px 26px 2px rgba(66, 68, 90, 1);

  @media (max-width: 600px) {
    width: 90%;
  }
`;

// Styled component for the form header
const FormHeader = styled.h1`
  color: #22223b;
`;

const Login = () => {
  // Get the selected language from local storage or set it to default 'pl'
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

  // Retrieve translation for 'hi' greeting
  var hi = (translations as any)[language]["hi"];

  return (
    <>
      <Container>
        <Box sx={{ minWidth: 120 }}>
          <FormControl fullWidth>
            <NativeSelect
              id="languageSelect"
              defaultValue={language}
              onChange={handlelanguageChange}
              style={{
                padding: "4px 1px 4px 27px",
                fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                textTransform: "uppercase",
                fontSize: "0.875rem",
                backgroundColor: "#22223b",
                color: "#ffffff",
                borderRadius: "4px",
              }}
            >
              {languages.map((language) => (
                <option
                  style={{
                    backgroundColor: "#65688A",
                    color: "#ffffff",
                  }}
                  value={language.code}
                >
                  {language.name}
                </option>
              ))}
            </NativeSelect>
          </FormControl>
        </Box>
        <div style={{ height: "60px", width: "100%" }} className="spacer"></div>
        <LoginContainer>
          <FormHeader>{hi}</FormHeader>
          <LoginForm />
        </LoginContainer>
      </Container>
    </>
  );
};

export default Login;
