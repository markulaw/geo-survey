import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { QuestionType } from "../../../api/surveyApi";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import { translations } from "../../../translate/Translations";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { createTheme, ThemeProvider } from "@mui/material/styles";

type QuestionProps = {
  question?: QuestionType;
  changeQuestion: (id: number) => void;
  questionsLenght: number;
  currentQuestionId: number;
  clickedAnswer: any;
  endHandler: any;
  backToLogin: any;
  selectHandler: any;
  endDrawHandler: any;
  handleImage: (val: Array<boolean>, questionIndex: any) => void;
  handleSlider: (val: number, questionIndex: any) => void;
  handleSingleChoice: (val: number, questionIndex: any) => void;
  handleSingleImage: (val: number, questionIndex: any) => void;
  handleMultipleChoice: (val: any, questionIndex: any) => void;
  handleTableChoices: (val: any, questionIndex: any) => void;
  clicked: boolean;
  summary: boolean | undefined;
  summaryDescription: any;
  completedSurvey: boolean;
};

// To respond to next and prev buttons
type ClickType = "NEXT" | "PREV";

// Styled components for the containers
const QuestionContainer = styled.div`
  position: absolute;
  top: 5%;
  right: 5%;
  width: 40%;
  z-index: 9998;
  background: #ffffff;
  color: #22223b;
  border-radius: 10px;

  -webkit-box-shadow: 0px 0px 26px 2px rgba(66, 68, 90, 1);
  -moz-box-shadow: 0px 0px 26px 2px rgba(66, 68, 90, 1);
  box-shadow: 0px 0px 26px 2px rgba(66, 68, 90, 1);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  font-size: 1vw;

  @media (max-width: 600px) {
    width: 90%;
    font-size: 1rem;
  }

  @media (min-width: 600px) and (max-width: 1200px) {
    width: 75%;
    // font-size: 2rem;
  }
`;

const SummaryContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: #ffffff;
  color: #22223b;
  border-radius: 10px;

  -webkit-box-shadow: 0px 0px 26px 2px rgba(66, 68, 90, 1);
  -moz-box-shadow: 0px 0px 26px 2px rgba(66, 68, 90, 1);
  box-shadow: 0px 0px 26px 2px rgba(66, 68, 90, 1);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  font-size: 1vw;

  @media (max-width: 600px) {
    width: 100%;
    font-size: 1rem;
  }

  @media (min-width: 600px) and (max-width: 1200px) {
    width: 100%;
    //font-size: 2rem;
  }
`;

const QuestionLabel = styled.p`
  padding: 0 12px;
  text-align: justify;
  margin: 0;
  margin-bottom: 30px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 30px;
  margin-bottom: 12px;
`;

const ColorButton = styled(Button)`
  margin-top: 30px;
  margin-bottom: 30px;
  background-color: ${({ disabled }) =>
    disabled ? "#555574" : "#22223b"}!important;
  color: white !important;
  & hover{
    background-color #22223b:
  }
`;

const CustomImage = styled.img`
  width: auto; /* Automatyczna szerokość, aby zachować proporcje */
  max-width: calc(
    100% - 10px
  ); /* Maksymalna szerokość do szerokości ekranu minus 10px */
  max-height: 300px; /* Maksymalna wysokość 450px */
  object-fit: contain; /* Wyświetl obraz w całości na wysokość */
  margin-bottom: 12px;

  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  border-radius: 8px;
`;

const SliderContainer = styled.div`
  width: 29%;
`;

// Interface for defining CSS styles
interface Styles {
  radioGroup: React.CSSProperties;
  radioButton: React.CSSProperties;
  image: React.CSSProperties;
  images: React.CSSProperties;
  centerAlign: React.CSSProperties;
}
// Styles object to define CSS styles
const styles: Styles = {
  radioGroup: {
    display: "flex",
    flexWrap: "wrap" as "wrap",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  radioButton: {
    flexBasis: "calc(20% - 5px)", // 20% width with 5px gap
    marginBottom: "5px", // Gap between rows
    boxSizing: "border-box",
  },
  image: {
    width: "100%", // Image width should fill the container
    maxWidth: "100%",
    boxShadow:
      "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
    borderRadius: "8px",
  },
  images: {
    width: "100%", // Image width should fill the container
    maxWidth: "100%",
  },
  centerAlign: {
    justifyContent: "center", // Center-align images when there's only one row
  },
};

// Theme for Material-UI components
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

// Styled component for FormControlLabel with custom styles
const CustomFormControlLabel = styled(FormControlLabel)(({}) => ({
  "& .MuiFormControlLabel-label": {
    fontSize: "1vw",
  },
  [theme.breakpoints.down("sm")]: {
    "& .MuiFormControlLabel-label": {
      fontSize: "1rem",
    },
  },
}));

// To respond to next and prev buttons
const CLICK_TYPE = {
  next: "NEXT",
  prev: "PREV",
};

// Component for rendering questions in the survey
const Question = ({
  question,
  changeQuestion,
  questionsLenght,
  currentQuestionId,
  clickedAnswer,
  endHandler,
  backToLogin,
  selectHandler,
  endDrawHandler,
  handleImage,
  handleSlider,
  handleSingleChoice,
  handleSingleImage,
  handleMultipleChoice,
  handleTableChoices,
  clicked,
  summary,
  summaryDescription,
  completedSurvey,
}: QuestionProps) => {
  const questionId = question?.id || 0;

  // Function to clear selected answers from all question types and changes the question
  const onClick = (type: ClickType) => {
    if (type === CLICK_TYPE.next) {
      changeQuestion(currentQuestionId + 1);
      setSingleChoiceVal("0");
      setSingleImageVal("0");
      setMultipleChoiceVal([]);
      setTableChoices([]);
      tableChoicesTmp = [];
      setSelectedOptions([]);
      if (question !== undefined && question.img !== undefined)
        question.img.slice(0, question.img.length);
    } else if (type === CLICK_TYPE.prev) {
      changeQuestion(currentQuestionId - 1);
      setSingleChoiceVal("0");
      setSingleImageVal("0");
      setTableChoices([]);
      tableChoicesTmp = [];
      setSelectedOptions([]);
      setMultipleChoiceVal([]);
    }
  };

  // If next button is disabled (no answer)
  const nextIsDisabled =
    currentQuestionId >= questionsLenght - 1 || !clickedAnswer;

  // Variables storing answers to questions of various types
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [singleChoiceVal, setSingleChoiceVal] = useState<String>("0");
  const [singleImageVal, setSingleImageVal] = useState<String>("0");
  const [multipleChoiceVal, setMultipleChoiceVal] = useState<number[]>([]);
  const [tableChoices, setTableChoices] = useState<number[]>([]);
  var tableChoicesTmp = [];

  // Get the selected language from local storage
  var language = "pl";
  if (localStorage.getItem("languageHook") !== null)
    language = JSON.parse(localStorage.getItem("languageHook") || "");

  // Translations:
  var select = (translations as any)[language]["select"];
  var startDrawing = (translations as any)[language]["startDrawing"];
  var endDrawing = (translations as any)[language]["endDrawing"];
  var area = (translations as any)[language]["area"];
  var line = (translations as any)[language]["line"];
  var slider = (translations as any)[language]["slider"];
  var images = (translations as any)[language]["images"];
  var single = (translations as any)[language]["single"];
  var singleImage = (translations as any)[language]["singleImage"];
  var multi = (translations as any)[language]["multi"];
  var point = (translations as any)[language]["point"];

  var table = (translations as any)[language]["table"];

  // Function to handle answers to MultipleImages type of question
  const handleImagesChange = (option: number) => {
    if (selectedOptions.includes(option)) {
      // If the option is already selected, remove it from the selected
      setSelectedOptions(
        selectedOptions.filter((selected: any) => selected !== option)
      );
    } else {
      // Otherwise, add the option to the selected
      setSelectedOptions([...selectedOptions, option]);
    }
    var tmp = Array.from(
      { length: question?.answer.answers.length },
      (_, index) => selectedOptions.includes(index)
    );
    tmp[option] = !tmp[option];
    handleImage(tmp, currentQuestionId);
  };

  // Function to handle answers to Table type of question
  const changeTableChoices = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: number,
    length: number
  ) => {
    var choice = parseInt((event.target as HTMLInputElement).value);
    var updatedChoices = [...tableChoices];
    updatedChoices = updatedChoices.slice(0, length);
    updatedChoices[id] = choice;

    setTableChoices(updatedChoices);

    tableChoicesTmp = tableChoices.slice(0);
    tableChoicesTmp[id] = parseInt((event.target as HTMLInputElement).value);

    var hasAnyEmptyElement =
      tableChoicesTmp.filter(function (val: any) {
        return typeof val !== "undefined";
      }).length !== tableChoicesTmp.length;
    if (!hasAnyEmptyElement && tableChoicesTmp.length === length) {
      handleTableChoices(tableChoicesTmp, currentQuestionId);
    }
  };

  // Function to handle answers to MultipleChoice type of question
  const changeMultipleVal = (option: number) => {
    if (multipleChoiceVal.includes(option)) {
      // If the option is already selected, remove it from the selected
      setMultipleChoiceVal(
        multipleChoiceVal.filter((selected: any) => selected !== option)
      );
    } else {
      // Otherwise, add the option to the selected
      setMultipleChoiceVal([...multipleChoiceVal, option]);
    }
    var tmp = Array.from(
      { length: question?.answer.answers.length },
      (_, index) => multipleChoiceVal.includes(index)
    );
    tmp[option] = !tmp[option];
    handleMultipleChoice(tmp, currentQuestionId);
  };

  // Function to handle answers to Slider type of question
  const changeSliderVal = (event: Event, newValue: number | number[]) => {
    handleSlider(newValue as number, currentQuestionId);
  };

  // Function to handle answers to SingleChoice type of question
  const changeSingleVal = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSingleChoiceVal((event.target as HTMLInputElement).value);
    handleSingleChoice(
      parseInt((event.target as HTMLInputElement).value),
      currentQuestionId
    );
  };

  // Function to handle answers to SingleImage type of question
  const changeSingleImageVal = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSingleImageVal((event.target as HTMLInputElement).value);
    handleSingleImage(
      parseInt((event.target as HTMLInputElement).value),
      currentQuestionId
    );
  };

  return (
    <>
      <QuestionContainer
        // Covering the map for questions that are answered off the map
        style={{
          width:
            question?.answerType === "Slider" ||
            question?.answerType === "Images" ||
            question?.answerType === "SingleChoice" ||
            question?.answerType === "SingleImage" ||
            question?.answerType === "Table" ||
            question?.answerType === "MultipleChoice"
              ? "100%"
              : "40%",
          height:
            question?.answerType === "Slider" ||
            question?.answerType === "Images" ||
            question?.answerType === "SingleChoice" ||
            question?.answerType === "SingleImage" ||
            question?.answerType === "Table" ||
            question?.answerType === "MultipleChoice"
              ? "100%"
              : "auto",
          top:
            question?.answerType === "Slider" ||
            question?.answerType === "Images" ||
            question?.answerType === "SingleChoice" ||
            question?.answerType === "SingleImage" ||
            question?.answerType === "Table" ||
            question?.answerType === "MultipleChoice"
              ? "0%"
              : "5%",
          right:
            question?.answerType === "Slider" ||
            question?.answerType === "Images" ||
            question?.answerType === "SingleChoice" ||
            question?.answerType === "SingleImage" ||
            question?.answerType === "Table" ||
            question?.answerType === "MultipleChoice"
              ? "0%"
              : "5%",
        }}
      >
        <h3>
          {(translations as any)[language]["question"]} {questionId}
        </h3>
        <h5 style={{ marginTop: 0 }}>
          {question?.answerType === "LineString" ? startDrawing : select}
          {question?.answerType === "Slider"
            ? slider
            : question?.answerType === "Slider"}
          {question?.answerType === "Images"
            ? images
            : question?.answerType === "Images"}
          {question?.answerType === "SingleChoice"
            ? single
            : question?.answerType === "SingleChoice"}
          {question?.answerType === "SingleImage"
            ? singleImage
            : question?.answerType === "SingleImage"}
          {question?.answerType === "MultipleChoice"
            ? multi
            : question?.answerType === "MultipleChoice"}
          {question?.answerType === "Table"
            ? table
            : question?.answerType === "Table"}
          {question?.answerType === "Point"
            ? point
            : question?.answerType === "Polygon"
            ? area
            : " "}
        </h5>

        {question?.answerType !== "Slider" &&
          question?.answerType !== "Images" &&
          question?.answerType !== "Table" &&
          question?.answerType !== "SingleChoice" &&
          question?.answerType !== "SingleImage" &&
          question?.answerType !== "MultipleChoice" && (
            <ColorButton variant="contained" onClick={selectHandler}>
              {question?.answerType === "LineString" ? startDrawing : select}
            </ColorButton>
          )}
        {question?.answerType === "LineString" && (
          <ColorButton
            variant="contained"
            onClick={endDrawHandler}
            style={{ marginTop: 12 }}
          >
            {endDrawing}
          </ColorButton>
        )}
        <QuestionLabel>{question?.question}</QuestionLabel>
        {question?.img && (
          <CustomImage src={process.env.PUBLIC_URL + question?.img} />
        )}

        {question?.answerType === "Images" && (
          <Stack direction="row" spacing={0}>
            {question?.answer.answers.map((image: any, i: number) => (
              <Button
                key={i}
                variant="contained"
                onClick={() => handleImagesChange(i)}
                style={{
                  backgroundColor: selectedOptions.includes(i)
                    ? "#313773"
                    : "#ffffff",
                }}
              >
                <img src={image} style={styles.images} />
              </Button>
            ))}
          </Stack>
        )}

        {question?.answerType === "SingleImage" && (
          <FormControl>
            <RadioGroup
              onChange={changeSingleImageVal}
              value={singleImageVal}
              style={
                question?.answer.answers.length <= 5
                  ? { ...styles.radioGroup, ...styles.centerAlign }
                  : styles.radioGroup
              }
              row
            >
              {question?.answer.answers.map((image: any, i: any) => (
                <FormControlLabel
                  control={<Radio value={i} key={i} />}
                  label={
                    <img
                      src={image}
                      key={i}
                      className="img"
                      style={styles.image}
                    />
                  }
                  style={styles.radioButton}
                />
              ))}
            </RadioGroup>
          </FormControl>
        )}

        {question?.answerType === "Table" && (
          <TableContainer style={{ width: "50%" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {question?.answer.table.map((table: any, i: number) => (
                  <TableRow key={table}>
                    <TableCell
                      style={{
                        fontSize: "1rem",
                        backgroundColor: i % 2 === 0 ? "#C3C8DA" : "ffffff",
                      }}
                    >
                      {table}
                    </TableCell>
                    <TableCell
                      style={{
                        backgroundColor: i % 2 === 0 ? "#C3C8DA" : "ffffff",
                      }}
                    >
                      <FormControl component="fieldset">
                        <FormLabel component="legend"></FormLabel>
                        <RadioGroup
                          onChange={(e) =>
                            changeTableChoices(
                              e,
                              i,
                              question?.answer.table.length
                            )
                          }
                          row
                          aria-labelledby="demo-row-radio-buttons-group-label"
                          name="row-radio-buttons-group"
                        >
                          {question?.answer.answers.map(
                            (answer: any, j: number) => (
                              <CustomFormControlLabel
                                key={j}
                                checked={tableChoices[i] === j}
                                value={j}
                                control={<Radio />}
                                label={answer}
                              />
                            )
                          )}
                        </RadioGroup>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {question?.answerType === "Slider" && (
          <SliderContainer>
            <Slider
              defaultValue={
                (question?.answer.maxSlider + question?.answer.minSlider) / 2
              }
              aria-label="Default"
              valueLabelDisplay="on"
              onChange={changeSliderVal}
              min={question?.answer.minSlider}
              max={question?.answer.maxSlider}
            />
          </SliderContainer>
        )}

        {question?.answerType === "SingleChoice" && (
          <FormControl>
            <RadioGroup onChange={changeSingleVal} value={singleChoiceVal}>
              {question?.answer.answers.map((answers: any, i: number) => (
                <CustomFormControlLabel
                  key={i}
                  value={i}
                  label={answers}
                  control={<Radio />}
                />
              ))}
            </RadioGroup>
          </FormControl>
        )}

        {question?.answerType === "MultipleChoice" && (
          <FormGroup>
            {question?.answer.answers.map((answers: any, i: number) => (
              <CustomFormControlLabel
                key={i}
                value={i}
                control={
                  <Checkbox
                    checked={multipleChoiceVal.includes(i)}
                    onChange={() => changeMultipleVal(i)}
                  />
                }
                label={answers}
              />
            ))}
          </FormGroup>
        )}
        {/* <TableCell></TableCell> */}
        <ButtonContainer>
          <ColorButton
            variant="contained"
            onClick={() => onClick("PREV")}
            disabled={currentQuestionId === 0}
          >
            {(translations as any)[language]["prev"]}
          </ColorButton>
          {currentQuestionId < questionsLenght - 1 ? (
            <ColorButton
              variant="contained"
              onClick={() => onClick("NEXT")}
              disabled={!clicked && nextIsDisabled}
            >
              {(translations as any)[language]["next"]}
            </ColorButton>
          ) : (
            <ColorButton
              variant="contained"
              onClick={endHandler}
              disabled={!clicked && !clickedAnswer}
            >
              {(translations as any)[language]["endAndSend"]}
            </ColorButton>
          )}
        </ButtonContainer>
      </QuestionContainer>

      {summary && completedSurvey && (
        <SummaryContainer
          style={{
            zIndex: "9999",
          }}
        >
          <div>{summaryDescription}</div>
          <ButtonContainer>
            <ColorButton variant="contained" onClick={backToLogin}>
              {(translations as any)[language]["cancel"]}
            </ColorButton>
          </ButtonContainer>
        </SummaryContainer>
      )}
    </>
  );
};
export default Question;
