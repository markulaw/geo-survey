import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSurveys, getAnswers, SurveyType } from "../../api/surveyApi";
import styled from "styled-components";
import SurveyItem from "../dashboard/SurveyItem/SurveyItem";
import { Button, Box, FormControl, NativeSelect } from "@mui/material";
import axios from "axios";
import { translations, languages } from "../../translate/Translations";
import ButtonGroup from "@mui/material/ButtonGroup";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";

// Styled components
const Container = styled.div`
  display: flex;
  padding-top: 24px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ColorFileInput = styled.input`
  margin: 12px 0 !important;
  background-color: #22223b !important;
  color: #ffffff;
  bottom: 150px;

  border-color: rgba(255, 255, 255, 0.5);
  border-style: solid;
  border-width: 1px;
  border-radius: 5px;

  -webkit-box-shadow: 0px 0px 26px 2px rgba(66, 68, 90, 1);
  -moz-box-shadow: 0px 0px 26px 2px rgba(66, 68, 90, 1);
  box-shadow: 0px 0px 26px 2px rgba(66, 68, 90, 1);

  & hover{
    background-color #22223b:
  }
  font-size: 1vw;
  @media (min-width: 600px) and (max-width: 1200px) {
  // font-size: 1.5rem !important;
  }
`;

const ColorButton = styled(Button)`
  margin: 12px 0 !important;
  background-color: #22223b !important;
  color: #ffffff;
  & hover{
    background-color #22223b:
  }
  font-size: 1vw;
  @media (min-width: 600px) and (max-width: 1200px) {
   // font-size: 1.5rem !important;
  }
`;

const ColorShadowButton = styled(Button)`
  margin: 12px 0 !important;
  background-color: #22223b !important;
  color: #ffffff;

  border-color: rgba(255, 255, 255, 0.5);
  border-style: solid;
  border-width: 1px;
  border-radius: 5px;

  -webkit-box-shadow: 0px 0px 26px 2px rgba(66, 68, 90, 1);
  -moz-box-shadow: 0px 0px 26px 2px rgba(66, 68, 90, 1);
  box-shadow: 0px 0px 26px 2px rgba(66, 68, 90, 1);

  & hover{
    background-color #22223b:
  }
  font-size: 1vw;
  @media (min-width: 600px) and (max-width: 1200px) {
   // font-size: 1.5rem !important;
  }
`;

const FixedButtonGroup = styled(ButtonGroup)`
  position: fixed;
  z-index: 9999;
  top: 10px;
  place-items: center;
  color: "#65688A";
`;

const InnerContainer = styled.div`
  margin: 12px;
  width: 100%;
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
  }
`;

// AdminPanel component
const AdminPanel = () => {
  const [surveys, setSurveys] = useState<SurveyType[] | []>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [numberOfFilledSurveys, setNumberOfFilledSurveys] = useState<number[]>(
    []
  );
  const [selectedBtn, setSelectedBtn] = React.useState(-1);
  const navigate = useNavigate();
  const [files, setFiles] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [imagesList, setImagesList] = useState<string[]>([]);

  var language = "pl";
  // Checks if there's any value stored in the localStorage under the key
  if (localStorage.getItem("languageHook") != null)
    language = JSON.parse(localStorage.getItem("languageHook") || "");

  const [languageHook, setLanguageHook] = useState(language);

  // Translations
  var surveyManagement = (translations as any)[language]["surveyManagement"];
  var surveyResponses = (translations as any)[language]["surveyResponses"];
  var addingANewSurvey = (translations as any)[language]["addingANewSurvey"];
  var addingAPhotoToTheSurvey = (translations as any)[language][
    "addingAPhotoToTheSurvey"
  ];
  var listofImages = (translations as any)[language]["listofImages"];
  var JSONFileList = (translations as any)[language]["JSONFileList"];
  var deleteTranslation = (translations as any)[language]["delete"];
  var passwordChange = (translations as any)[language]["passwordChange"];
  var imageManagement = (translations as any)[language]["imageManagement"];
  var changePassword = (translations as any)[language]["changePassword"];
  var currentPasswordTranslation = (translations as any)[language][
    "currentPassword"
  ];
  var newPasswordTranslation = (translations as any)[language]["newPassword"];
  var passwordChangeSuccess = (translations as any)[language][
    "passwordChangeSuccess"
  ];
  var passwordChangeFail = (translations as any)[language][
    "passwordChangeFail"
  ];
  var confirmFileDelete = (translations as any)[language]["confirmFileDelete"];
  var downloadFile = (translations as any)[language]["downloadFile"];
  var uploadFile = (translations as any)[language]["uploadFile"];
  var selectFile = (translations as any)[language]["selectFile"];
  var noFileSelected = (translations as any)[language]["noFileSelected"];
  var uploadSuccessful = (translations as any)[language]["uploadSuccessful"];
  var uploadError = (translations as any)[language]["uploadError"];
  var fileError = (translations as any)[language]["fileError"];
  var fileContentError = (translations as any)[language]["fileContentError"];

  // Fetch data on component mount
  useEffect(() => {
    fetchSurveys();
    countFilledSurveys();

    // Fetch files from API
    const fetchFiles = async () => {
      try {
        const response = await axios.get<string[]>("/api/files");
        setFiles(response.data);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();

    // Fetch images list from API
    const fetchImagesList = async () => {
      try {
        const response = await axios.get("/api/images-list");
        // api returns a list of image names
        const imagesData = response.data;
        setImagesList(imagesData);
      } catch (error) {
        console.error("Error fetching images list:", error);
      }
    };

    fetchImagesList();
  }, []);

  // Function to handle password change
  const handleChangePassword = async () => {
    var oldPasswdDiv = document.getElementById(
      "currentPassword"
    ) as HTMLInputElement | null;
    if (oldPasswdDiv != null) oldPasswdDiv.value = "";
    var newPasswdDiv = document.getElementById(
      "newPassword"
    ) as HTMLInputElement | null;
    if (newPasswdDiv != null) newPasswdDiv.value = "";
    var result = " ";
    try {
      const response = await axios.post("/change-password", {
        currentPassword,
        newPassword,
      });
      result = passwordChangeSuccess;
      console.log(response.data.message);
    } catch (error: any) {
      console.error(
        "Error changing password:",
        error.response ? error.response.data.error : error.message
      );
      result = passwordChangeFail;
    }
    var resultDiv = document.getElementById("passwordResult");
    if (resultDiv != null) resultDiv.innerHTML = result;
  };

  // Fetch surveys from API
  const fetchSurveys = async () => {
    const importedSurveys = await getSurveys();
    setSurveys(importedSurveys);
  };

  // Fetch survey answers from API
  const fetchAnswers = async (surveyId: number) => {
    try {
      const response = await getAnswers(surveyId);
      setAnswers(response);
    } catch (error) {
      console.error("Data download error: ", error);
    }
  };

  // Function to handle starting a survey
  const startHandler = (id: number) => {
    // Navigates to the survey answers page with the survey ID as part of the URL
    navigate(`/survey/${id}/answers`, {
      state: {
        survey: surveys.find((survey) => survey.surveyId === id),
      },
    });
  };

  // Function to download survey answers in JSON format
  const downloadJSON = (surveyId: number) => {
    fetchAnswers(surveyId);

    if (answers.length === 0) {
      console.log("No data available for download.");
      return;
    }

    // Convert answers to JSON format
    const jsonContent = JSON.stringify(answers, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Create a link to download the JSON file
    const link = document.createElement("a");
    link.href = url;
    link.download = "answers_" + surveyId + ".json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to download survey answers in CSV format
  const downloadCSV = (surveyId: number) => {
    fetchAnswers(surveyId);

    if (answers.length === 0) {
      console.log("No data available for download.");
      return;
    }

    // Extract headers for CSV file
    const headers = Object.keys(answers[0].user).concat(
      answers[0].answers.map((ans: any) => Object.keys(ans)).flat()
    );

    // Create CSV content
    const csvContent = `${headers.join(",")}\n${answers
      .map((entry) => {
        const userValues = Object.values(entry.user);
        const answersValues = entry.answers
          .map((ans: any) => Object.values(ans))
          .flat();
        return [...userValues, ...answersValues].join(",");
      })
      .join("\n")}`;

    // Create a Blob containing CSV content
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    // Create a link to download the CSV file
    const link = document.createElement("a");
    link.href = url;
    link.download = "answers_" + surveyId + ".csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Count filled surveys
  const countFilledSurveys = async () => {
    try {
      const surveys = await getSurveys();
      const fetchedAnswers = [];
      for (let i = 0; i < surveys.length; i++) {
        const response = await getAnswers(i);
        fetchedAnswers.push(response);
      }
      const filledSurveyCounts = fetchedAnswers.map((answer) => answer.length);
      setNumberOfFilledSurveys(filledSurveyCounts);
    } catch (error) {
      console.error("Error while downloading response:", error);
    }
  };

  // Function to handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      var fileName = document.getElementById("surveyFileName");
      if (fileName != null) {
        fileName.innerHTML = event.target.files[0].name;
      }
      setFile(event.target.files[0]);
    }
  };

  const uploadSurvey = async () => {
    try {
      if (!file) {
        console.error("File not selected or file name not specified");
        return;
      }

      const reader = new FileReader();

      reader.onload = async () => {
        const fileContent = reader.result as string;

        if (
          fileContent === null ||
          fileContent === undefined ||
          fileContent.length < 5
        ) {
          console.error("Error reading file contents");

          var uploadResult = document.getElementById("surveyUploadResult");
          if (uploadResult != null) uploadResult.innerHTML = fileError;

          return;
        }

        const contentString =
          typeof fileContent === "string"
            ? fileContent
            : new TextDecoder().decode(fileContent);

        try {
          JSON.parse(contentString);
        } catch (jsonError) {
          console.error("Error while parsing JSON file: ", jsonError);

          var uploadResult = document.getElementById("surveyUploadResult");
          if (uploadResult != null) uploadResult.innerHTML = fileContentError;
          return;
        }

        const formData = new FormData();
        formData.append("file", file);

        const url = "/api/uploadSurvey";

        try {
          const response = await axios.post(url, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          console.log("The JSON file was saved to the server: ", response.data);

          // Fetch files from API
          const fetchFiles = async () => {
            try {
              const response = await axios.get<string[]>("/api/files");
              setFiles(response.data);
            } catch (error) {
              console.error("Error while downloading files: ", error);
            }
          };

          await fetchFiles();

          var uploadResult = document.getElementById("surveyUploadResult");
          if (uploadResult != null) uploadResult.innerHTML = uploadSuccessful;
        } catch (error) {
          console.error("Error while saving file: ", error);

          var uploadResult = document.getElementById("surveyUploadResult");
          if (uploadResult != null) uploadResult.innerHTML = uploadError;
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("General error: ", error);
    }
  };

  // Function to delete a file
  const deleteFile = async (filename: string) => {
    // Confirm file deletion with user
    const choice = window.confirm(confirmFileDelete);

    if (choice) {
      try {
        // Retrieve file content from the server
        const response = await axios.get(`/api/files/${filename}`);
        const fileContent = response.data;

        // Extract survey IDs from file content
        const surveyIds = extractSurveyIdsFromFileContent(fileContent);

        // Delete answers for each survey ID found in the file
        if (surveyIds.length > 0) {
          for (const surveyId of surveyIds) {
            await axios.delete(`/api/surveys/${surveyId}/deleteAnswers`);
          }
        } else {
          console.log("No survey IDs found in file content.");
          return;
        }
        // Finally, delete the file itself
        await axios.delete(`/api/files/${filename}`);
        // Update the list of files after deletion
        setFiles((prevFiles) => prevFiles.filter((file) => file !== filename));
        console.log("File deleted successfully");
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
  };

  // Function to extract survey IDs from file content
  const extractSurveyIdsFromFileContent = (fileContent: any): number[] => {
    try {
      const surveyIds: number[] = fileContent.map(
        (survey: any) => survey.surveyId
      );

      return surveyIds;
    } catch (error) {
      console.error("Error parsing file content:", error);
      return [];
    }
  };

  // Reference hook for file upload menu
  const uploadInputRef = React.useRef<HTMLInputElement | null>(null);

  // Function to handle image input change
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      var fileName = document.getElementById("imageFileName");
      if (fileName != null) {
        fileName.innerHTML = event.target.files[0].name;
      }
      setSelectedImage(event.target.files[0]);
    }
  };

  // Function to handle image upload
  const handleImageUpload = async () => {
    if (!selectedImage) {
      return;
    }
    try {
      const formData = new FormData();
      formData.append("image", selectedImage);

      const url = "/api/uploadImage";

      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Server's answer: ", response.data);

      // Fetch images list from API
      const fetchImagesList = async () => {
        try {
          const response = await axios.get("/api/images-list");
          // Api returns a list of image names
          const imagesData = response.data;
          setImagesList(imagesData);
        } catch (error) {
          console.error("Error fetching images list:", error);
        }
      };

      await fetchImagesList();

      var uploadResult = document.getElementById("imageUploadResult");
      if (uploadResult != null) {
        uploadResult.innerHTML = uploadSuccessful;
      }
    } catch (error) {
      var uploadResult = document.getElementById("imageUploadResult");
      if (uploadResult != null) uploadResult.innerHTML = uploadError;
      console.error("Error while uploading a file: ", error);
    }
  };

  // Function to remove an image from the list
  const removeImageFromList = async (imageName: string) => {
    // Confirm image deletion with user
    const choice = window.confirm(confirmFileDelete);

    if (choice) {
      try {
        // Removing an image from the server
        await axios.delete(`/api/images/${imageName}`);
        // imagesList update
        setImagesList((prevList) =>
          prevList.filter((image) => image !== imageName)
        );
      } catch (error) {
        console.error("Error removing image:", error);
      }
    }
  };

  // Function to download a survey
  const downloadSurvey = async (filename: string) => {
    try {
      // Fetch the survey file from the server
      const response = await axios.get(`/api/files/${filename}`, {
        responseType: "blob",
      });
      const fileContent = response.data;
      const url = URL.createObjectURL(fileContent);

      // Create a link element to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error fetching file:", error);
    }
  };

  // Function to download an image from the list
  const downloadImageFromList = async (imageName: string) => {
    console.log(imageName);
    try {
      // Fetch the image from the server
      const response = await axios.get(`/api/images/${imageName}`, {
        responseType: "blob",
      });
      const fileContent = response.data;
      const fileType = fileContent.type.includes("image")
        ? fileContent.type.substring(6, fileContent.type.length)
        : "png";
      const url = URL.createObjectURL(fileContent);

      // Create a link element to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = imageName + "." + fileType;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  // Function to change the language
  const handlelanguageChange = async (e: any) => {
    setLanguageHook(e.target.value);
    console.log(e.target.value);
    language = e.target.value;
    localStorage.setItem("languageHook", JSON.stringify(language));
    if (selectedBtn == 4) window.location.reload();
  };

  return (
    <>
      <div style={{ height: "100px", width: "100%" }} className="spacer"></div>
      <Container>
        <FixedButtonGroup>
          {/* Buttons for different functionalities */}
          <Button
            style={{
              backgroundColor: selectedBtn === 1 ? "#313773" : "#65688A",
              color: "#ffffff",
            }}
            onClick={() => setSelectedBtn(1)}
          >
            {passwordChange}
          </Button>
          <Button
            style={{
              backgroundColor: selectedBtn === 2 ? "#313773" : "#65688A",
              color: "#ffffff",
            }}
            onClick={() => setSelectedBtn(2)}
          >
            {surveyManagement}
          </Button>
          <Button
            style={{
              backgroundColor: selectedBtn === 3 ? "#313773" : "#65688A",
              color: "#ffffff",
            }}
            onClick={() => setSelectedBtn(3)}
          >
            {imageManagement}
          </Button>
          <Button
            style={{
              backgroundColor: selectedBtn === 4 ? "#313773" : "#65688A",
              color: "#ffffff",
            }}
            onClick={() => setSelectedBtn(4)}
          >
            {surveyResponses}
          </Button>
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <NativeSelect
                id="languageSelect"
                defaultValue={language}
                onChange={handlelanguageChange}
                style={{
                  padding: "4px 15px",
                  fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                  textTransform: "uppercase",
                  fontSize: "0.875rem",
                  backgroundColor: "#65688A",
                  color: "#ffffff",
                }}
              >
                {/* Language options */}
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
          <Button
            style={{
              backgroundColor: selectedBtn > 0 ? "#313773" : "#65688A",
              color: "#ffffff",
            }}
            disabled={selectedBtn < 0}
            aria-label="keyboard_double_arrow_up"
            onClick={() => setSelectedBtn(-1)}
          >
            <KeyboardDoubleArrowUpIcon />
          </Button>
        </FixedButtonGroup>
        {/* Content based on selected button */}
        {selectedBtn == 1 && (
          <div>
            <div
              style={{ height: "100px", width: "100%" }}
              className="spacer"
            ></div>
            <div>
              <h2 style={{ color: "#22223b" }}>{changePassword}</h2>
              <div>
                <input
                  id="currentPassword"
                  placeholder={currentPasswordTranslation}
                  style={{ margin: "12px 0", padding: "8px" }}
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <input
                  id="newPassword"
                  placeholder={newPasswordTranslation}
                  style={{ margin: "12px 0", padding: "8px" }}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <ColorButton
                style={{ left: "20px", color: "#ffffff" }}
                onClick={handleChangePassword}
              >
                {changePassword}
              </ColorButton>
            </div>
            <div
              id="passwordResult"
              style={{ color: "#22223b", margin: "12px 0" }}
            ></div>
          </div>
        )}

        {selectedBtn == 2 && (
          <div>
            <div
              style={{ height: "50px", width: "100%" }}
              className="spacer"
            ></div>
            <h2 style={{ color: "#22223b" }}>{addingANewSurvey}</h2>
            <ColorFileInput
              ref={uploadInputRef}
              style={{ display: "none" }}
              type="file"
              accept=".json"
              onChange={handleFileChange}
            />
            <ColorShadowButton
              style={{ color: "#ffffff" }}
              onClick={() =>
                uploadInputRef.current && uploadInputRef.current.click()
              }
            >
              {selectFile}
            </ColorShadowButton>
            <div id="surveyFileName" style={{ color: "#22223b" }}>
              {noFileSelected}
            </div>
            <ColorShadowButton
              style={{ color: "#ffffff" }}
              onClick={uploadSurvey}
            >
              {uploadFile}
            </ColorShadowButton>
            <div id="surveyUploadResult" style={{ color: "#22223b" }}></div>
            <div
              style={{ height: "100px", width: "100%" }}
              className="spacer"
            ></div>

            <h2 style={{ color: "#22223b" }}>{JSONFileList}</h2>
            <div
              style={{ height: "50px", width: "100%" }}
              className="spacer"
            ></div>
            <ul>
              {files.map((file) => (
                <InnerContainer style={{ width: "120%" }}>
                  <li key={file}>
                    {file}
                    <ColorButton
                      style={{ left: "20px", color: "#ffffff" }}
                      onClick={() => downloadSurvey(file)}
                    >
                      {downloadFile}
                    </ColorButton>
                    <ColorButton
                      style={{ left: "20px", color: "#ffffff" }}
                      onClick={() => deleteFile(file)}
                    >
                      {deleteTranslation}
                    </ColorButton>
                  </li>
                </InnerContainer>
              ))}
            </ul>
            <div
              style={{ height: "50px", width: "100%" }}
              className="spacer"
            ></div>
          </div>
        )}

        {selectedBtn == 3 && (
          <div style={{ margin: "50px", padding: "15px" }}>
            <div
              style={{ height: "100px", width: "100%" }}
              className="spacer"
            ></div>
            <h2 style={{ color: "#22223b" }}>{addingAPhotoToTheSurvey}</h2>
            <ColorFileInput
              ref={uploadInputRef}
              style={{ display: "none" }}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            <ColorShadowButton
              style={{ color: "#ffffff" }}
              onClick={() =>
                uploadInputRef.current && uploadInputRef.current.click()
              }
            >
              {selectFile}
            </ColorShadowButton>
            <div id="imageFileName" style={{ color: "#22223b" }}>
              {noFileSelected}
            </div>
            <ColorShadowButton
              style={{ color: "#ffffff" }}
              onClick={handleImageUpload}
            >
              {uploadFile}
            </ColorShadowButton>
            <div id="imageUploadResult" style={{ color: "#22223b" }}></div>
            <div
              style={{ height: "100px", width: "100%" }}
              className="spacer"
            ></div>

            <h2 style={{ color: "#22223b" }}>{listofImages}</h2>
            <div
              style={{ height: "50px", width: "100%" }}
              className="spacer"
            ></div>

            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {imagesList.map((image) => (
                <div
                  key={image}
                  style={{ margin: "10px", position: "relative" }}
                >
                  <img
                    src={`/api/images/${image}`}
                    alt={image}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                  <ColorButton
                    style={{ position: "absolute", top: "-10px", right: "5px" }}
                    onClick={() => removeImageFromList(image)}
                  >
                    &#x2715;
                  </ColorButton>
                  <ColorButton
                    style={{ position: "absolute", top: "30px", right: "5px" }}
                    onClick={() => downloadImageFromList(image)}
                  >
                    &#x2193;
                  </ColorButton>
                </div>
              ))}
            </div>
            <div
              style={{ height: "50px", width: "100%" }}
              className="spacer"
            ></div>
          </div>
        )}
        {selectedBtn == 4 && (
          <>
            <div
              style={{ height: "100px", width: "100%" }}
              className="spacer"
            ></div>

            {surveys.map((survey) => (
              <SurveyItem
                survey={survey}
                key={survey.surveyId}
                startHandler={startHandler}
                downloadJSON={downloadJSON}
                downloadCSV={downloadCSV}
                countFilledSurveys={numberOfFilledSurveys[survey.surveyId]}
                type="answers"
              />
            ))}
          </>
        )}
      </Container>
    </>
  );
};

export default AdminPanel;
