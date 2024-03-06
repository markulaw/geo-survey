import { SurveyEntry } from "../types";
// Import the Answer model
const Answer = require("../models/answer");

// Import file system and path modules
const fs = require('fs');
const path = require('path');

// Define the directory containing JSON data files
const dataDirectory = './src/data';

// Function to get all JSON files in a directory
function getAllJSONFiles(directoryPath: string): string[] {
  const files: string[] = fs.readdirSync(directoryPath);
  const jsonFiles: string[] = files.filter(file => path.extname(file).toLowerCase() === '.json');
  return jsonFiles.map(file => path.join(directoryPath, file));
}

// Function to read JSON data from a file
function readJSONFile(filePath: string): any {
  try {
    const fileData: string = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
}

// Function to merge JSON data from multiple files
function mergeJSONDataFromFiles(directoryPath: string): any[] {
  const allJSONFiles: string[] = getAllJSONFiles(directoryPath);
  const jsonDataArray: any[] = [];

  allJSONFiles.forEach(filePath => {
    const dataFromFile: any = readJSONFile(filePath);
    if (Array.isArray(dataFromFile)) {
      jsonDataArray.push(...dataFromFile);
    }
  });

  return jsonDataArray;
}

const directoryPath = './src/data/';
// Read the directory to find globalMaxId and modify JSON files if necessary
fs.readdir(directoryPath, (err: any, files: any) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  let globalMaxId = 0;
  let ifModified = false;

  // Iterate through each file in the directory
  files.forEach((file: any) => {
    if (path.extname(file) === '.json') {
      const filePath = path.join(directoryPath, file);
      const surveys = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      // Find the maximum surveyId in each file
      const existingIds = surveys.map((survey: any) => survey.surveyId || 0);
      const fileMaxId = Math.max(...existingIds);

      // Update globalMaxId if necessary
      if (fileMaxId > globalMaxId) {
        globalMaxId = fileMaxId;
      }
    }
  });

   // Iterate through each file again to modify surveyIds if necessary
   // (surveyId was not assigned when the survey was added)
  files.forEach((file: any) => {
    if (path.extname(file) === '.json') {
      const filePath = path.join(directoryPath, file);
      let surveys = [];

      try {
        const fileData = fs.readFileSync(filePath, 'utf-8');
        surveys = JSON.parse(fileData);
      } catch (error) {
        console.error('File read error:', error);
        return;
      }
 // Function to assign IDs to surveys
      const assignIdsToSurveys = (surveys: any) => {
        let nextId = globalMaxId + 1;
        for (const survey of surveys) {
          if (survey.surveyId === undefined || survey.surveyId === null || survey.surveyId === '') {
            survey.surveyId = nextId;
            ifModified = true;
            nextId++;
          }
        }
        return surveys;
      };

      const modifiedSurveys = assignIdsToSurveys(surveys);
 // Write modified surveys back to the file if necessary
      if (ifModified) {
        fs.writeFileSync(filePath, JSON.stringify(modifiedSurveys, null, 2), 'utf-8');
        console.log('The identifiers in the file have been changed:', file);
      } else {
        console.log('The identifiers in the file have not been changed', file);
      }
    }
  });
});
// Merge JSON data from files into a single array
const surveyData = mergeJSONDataFromFiles(dataDirectory);
// Convert survey data into an array of SurveyEntry objects
const surveys: Array<SurveyEntry> = surveyData;
// Function to get all survey entries
const getEntries = (): Array<SurveyEntry> => {
  return surveys;
};

// Function to find a survey by ID
const findById = (id: number): SurveyEntry | undefined => {
  const entry = surveys.find((survey) => survey.surveyId === id);
  return entry;
};

// Placeholder function to add a new entry
const addEntry = () => {
  return null;
};

// Function to add an answer to a survey
const addAnswer = async (answer: any) => {
  const newAnswer = new Answer(answer);
  let savedAnswer;
  try {
    savedAnswer = await newAnswer.save();
  } catch (error: any) {
    console.error("Answer save error: " + error.message);
  }
  console.log(savedAnswer);
  return savedAnswer;
};

// Function to get all answers for a survey
const getAnswers = async (surveyId: any) => {
  const query = Answer.find({ surveyId: surveyId });
  let answers;
  try {
    answers = await query.exec();
  } catch (error: any) {
    console.error("Get Answers error: " + error.message);
  }
  console.log(answers);
  return answers;
};

// Function to get answers for a specific question in a survey
const getAnswersForQuestion = async (surveyId: string, questionId: string) => {
  const query = Answer.find({ surveyId: surveyId });
  let answers;
  try {
    answers = await query.exec();
  } catch (error: any) {
    console.error("Get Answers error: " + error.message);
  }
  let answersToReturn: any = [];

  // Process answers to return only relevant data
  answers.forEach((wholeAnswer: any) => {
    let tmp = wholeAnswer.answers.find(
      (answer: any) => answer.questionId === +questionId
    );
    console.log(tmp);
    const toReturn = tmp.geoJSON;
    toReturn.properties = {
      questionId: tmp.questionId,
      surveyId: surveyId,
      user: wholeAnswer.user.name,
    };
    answersToReturn = answersToReturn.concat(toReturn);
  });
  console.log(answersToReturn);
  return answersToReturn;
};

// Function to delete all answers for a survey
const deleteAnswers = async (surveyId: string): Promise<any> => {
  try {
    const parsedSurveyId = parseInt(surveyId);
    const deletedAnswers = await Answer.deleteMany({"surveyId":parsedSurveyId});
    return deletedAnswers;
  } catch (error) {
    throw new Error('Error deleting answers in service');
  }
}

// Export all functions as default
export default {
  getEntries,
  addEntry,
  findById,
  addAnswer,
  getAnswers,
  getAnswersForQuestion,
  deleteAnswers
};
