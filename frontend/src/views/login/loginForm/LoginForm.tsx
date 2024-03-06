import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import styled from "styled-components";
import objectPropertyChange from "../../../helpers/ObjectPropertyChange";
import { SurveyType } from "../../../api/surveyApi";
import { translations } from "../../../translate/Translations";

// Styled component for the container of inputs
const InputsContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 12px;
`;
// Styled component for the custom styled text field
const CustomBorderTextField = styled(TextField)`
  & label.Mui-focused {
    color: #22223b;
  }
  & .MuiOutlinedInput-root {
    &.Mui-focused fieldset {
      border-color: #22223b;
    }
  }

  font-size: 1vw;

  @media (max-width: 600px) {
    width: 90%;
  }

  @media (min-width: 600px) and (max-width: 1200px) {
    & label {
      //font-size: 2rem;
    }
  }
`;
// Styled component for the button container
const ButtonContainer = styled.div`
  display: flex;
  gap: 24px;
  margin-left: auto;
  margin-right: auto;
`;
// Styled component for the colored button
const ColorButton = styled(Button)`
  background-color: #22223b !important;
  & hover{
    background-color #22223b:
  }

  font-size: 1vw;

  @media (min-width: 600px) and (max-width: 1200px) {
    //font-size: 1.5rem !important;
  }

  @media (min-width: 600px) and (max-width: 1200px) {
    //font-size: 2rem !important;
  }
`;

// Type for user data used in logging
type UserDataType = {
  name: string;
  age: string;
  gender: string;
  residencePlace: string;
};

const LoginForm = () => {
  // Get the selected language from local storage or set it to default 'en'
  var language = "en";
  if (localStorage.getItem("languageHook") != null)
    language = JSON.parse(localStorage.getItem("languageHook") || "");
  console.log("Login language: " + language);
  const [languageHook, setLanguageHook] = useState(language);

  // Retrieve translations based on the selected language
  var enterField = (translations as any)[language]["enterField"];
  var typeYear = (translations as any)[language]["typeYear"];
  var city = (translations as any)[language]["city"];
  var notOnList = (translations as any)[language]["notOnList"];
  var clear = (translations as any)[language]["clear"];
  var start = (translations as any)[language]["start"];
  var name = (translations as any)[language]["name"];
  var age = (translations as any)[language]["age"];
  var gender = (translations as any)[language]["gender"];
  var female = (translations as any)[language]["female"];
  var male = (translations as any)[language]["male"];
  var irrelevant = (translations as any)[language]["irrelevant"];

  // Function to handle language change
  const changeLanguageVal = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLanguageHook((event.target as HTMLInputElement).value);
    language = (event.target as HTMLInputElement).value;
    localStorage.setItem("languageHook", JSON.stringify(language));
  };

  // Helper function for assigning user id
  function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  // Helper function for assigning user id
  function getRandomSixLetterWord(): string {
    let word = "";
    const asciiLowerA = 97;
    const asciiLowerZ = 122;
    const asciiUpperA = 65;
    const asciiUpperZ = 90;

    for (let i = 0; i < 6; i++) {
      const randomAscii =
        getRandomInt(0, 1) === 0
          ? getRandomInt(asciiLowerA, asciiLowerZ)
          : getRandomInt(asciiUpperA, asciiUpperZ);

      const randomLetter = String.fromCharCode(randomAscii);
      word += randomLetter;
    }

    return word;
  }

  // State variables for user data and its validation
  const [userData, setUserData] = useState<UserDataType>({
    name: getRandomSixLetterWord(),
    age: "",
    gender: "",
    residencePlace: "",
  });
  const [userDataValidation, setUserDataValidation] = useState<UserDataType>({
    name: "",
    age: "",
    gender: "",
    residencePlace: "",
  });
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<SurveyType | undefined>(undefined);
  const location = useLocation();

  // Function to handle the start button click event
  // Field validation
  const onClick = () => {
    const { name, age, gender, residencePlace } = userData;
    const nameValidation = name === "" ? { enterField } : "";
    const ageValidation =
      age === "" ? { enterField } : !Number.isInteger(+age) ? { typeYear } : "";
    const genderValidation = gender === "" ? { enterField } : "";
    const residencePlaceValidation =
      residencePlace === "" ? { enterField } : "";

    if (
      nameValidation !== "" ||
      ageValidation !== "" ||
      genderValidation !== "" ||
      residencePlaceValidation !== ""
    ) {
      objectPropertyChange(
        userDataValidation,
        {
          name: nameValidation,
          age: ageValidation,
          gender: genderValidation,
          residencePlace: residencePlaceValidation,
        },
        (userDataValidation) => {
          setUserDataValidation(userDataValidation);
        }
      );

      return;
    }

    navigate(`/survey/${survey?.surveyId || 0}`, {
      state: {
        survey: survey,
        user: userData,
      },
    });
  };

  // Function to handle the clear button click event
  const clearHandler = () => {
    setUserData({
      name: "",
      age: "",
      gender: "",
      residencePlace: "",
    });
  };

  // Effect hook to set the survey state based on location state
  useEffect(() => {
    if (!location?.state) navigate("/dashboard");
    const { survey }: any = location.state as { surevy: any };
    if (!survey) navigate("/dashboard");
    setSurvey(survey);
  }, []);

  // Function to handle changes in user data
  const userDataChange = (property: string, value: string) => {
    objectPropertyChange(userData, { [property]: value }, (userData) => {
      setUserData(userData);
    });
    objectPropertyChange(
      userDataValidation,
      { [property]: "" },
      (userDataValidation) => {
        setUserDataValidation(userDataValidation);
      }
    );
  };

  return (
    <InputsContainer>
      <CustomBorderTextField
        required
        label={age}
        error={!!userDataValidation.age}
        helperText={userDataValidation.age}
        onChange={(e) => userDataChange("age", e.target.value)}
        value={userData.age}
      />
      <CustomBorderTextField
        required
        label={gender}
        select
        error={!!userDataValidation.gender}
        helperText={userDataValidation.gender}
        onChange={(e) => userDataChange("gender", e.target.value)}
        value={userData.gender}
      >
        <MenuItem value="male">{male}</MenuItem>
        <MenuItem value="female">{female}</MenuItem>
        <MenuItem value="noData">{irrelevant}</MenuItem>
      </CustomBorderTextField>
      <CustomBorderTextField
        required
        label={city}
        select
        error={!!userDataValidation.residencePlace}
        helperText={userDataValidation.residencePlace}
        onChange={(e) => userDataChange("residencePlace", e.target.value)}
        value={userData.residencePlace}
      >
        <MenuItem value="none">{notOnList}</MenuItem>
        <MenuItem value="Blackburn">Blackburn</MenuItem>
        <MenuItem value="Droylsden">Droylsden</MenuItem>
        <MenuItem value="Gdańsk">Gdańsk</MenuItem>
        <MenuItem value="Warszawa">Warszawa</MenuItem>
        <MenuItem value="Białystok">Białystok</MenuItem>
        <MenuItem value="Bydgoszcz">Bydgoszcz</MenuItem>
        <MenuItem value="Gorzów Wielkopolski">Gorzów Wielkopolski</MenuItem>
        <MenuItem value="Katowice">Katowice</MenuItem>
        <MenuItem value="Kielce">Kielce</MenuItem>
        <MenuItem value="Kraków">Kraków</MenuItem>
        <MenuItem value="Lublin">Lublin</MenuItem>
        <MenuItem value="Łódź">Łódź</MenuItem>
        <MenuItem value="Olsztyn">Olsztyn</MenuItem>
        <MenuItem value="Opole">Opole</MenuItem>
        <MenuItem value="Poznań">Poznań</MenuItem>
        <MenuItem value="Rzeszów">Rzeszów</MenuItem>
        <MenuItem value="Szczecin">Szczecin</MenuItem>
        <MenuItem value="Toruń">Toruń</MenuItem>
        <MenuItem value="Wrocław">Wrocław</MenuItem>
        <MenuItem value="Zielona Góra">Zielona Góra</MenuItem>
      </CustomBorderTextField>

      <ButtonContainer>
        <ColorButton variant="contained" onClick={clearHandler}>
          {clear}
        </ColorButton>
        <ColorButton variant="contained" onClick={onClick}>
          {start}
        </ColorButton>
      </ButtonContainer>
    </InputsContainer>
  );
};

export default LoginForm;
