// Import the axios instance for making HTTP requests
import axiosSurveyApp from "./axiosApi";

// Define the SurveyType interface
export type SurveyType = {
  surveyId: number;
  title: string;
  description: string;
  zoom: number;
  center: number[];
  mapUrl: string;
  wmsParams: wmsParamsType;
  mapAttribution: string;
  tileSize: number;
  questions: QuestionType[];
  summary: boolean | undefined;
  summaryDetails: any | undefined;
  categories: boolean | undefined;
  categoriesNames: string[];
  scoringCategoriesDescription: any | undefined;
};

// Define the wmsParamsType interface
export type wmsParamsType = {
  LAYERS: string;
  STYLES: string;
  FORMAT: string;
  VERSION: string;

};

// Define the QuestionType interface
export type QuestionType = {
  id: number;
  answerType: string;
  question: string;
  img: string;
  mapCenter: number[];
  mapUrlForQuestion: string;
  wmsParams: wmsParamsType;
  mapAttribution: string;
  mapZoom: number;
  tileSize: number;
  answer: any;
  points: number[];
};

// Function to fetch all surveys
const getSurveys = async (): Promise<SurveyType[]> => {
  const response = await axiosSurveyApp.get("/surveys");
  return response.data;
};

// Function to fetch a specific survey by its ID
const getSurvey = async (surveyId: number): Promise<SurveyType> => {
  const response = await axiosSurveyApp.get(`/surveys/${surveyId}`);
  return response.data;
};

// Function to save an answer to a survey
const saveAnswer = async (body: any) => {
  const response = await axiosSurveyApp.post(`/surveys/addAnswer`, body);
  return response;
};

// Function to fetch answers for a specific survey
const getAnswers = async (surveyId: number) => {
  const response = await axiosSurveyApp.get(`/surveys/${surveyId}/answers`);
  return response.data;
};

// Function to save a JSON file
const saveJsonFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const url = '/api/uploadSurvey';

    const response = await axiosSurveyApp.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error while saving file:', error);
    throw new Error('Error while saving file');
  }
};

// Export the necessary functions
export { getSurvey, getSurveys, saveAnswer, getAnswers, saveJsonFile };
