"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const survey_json_1 = __importDefault(require("../data/survey.json"));
const Answer = require("../models/answer");
const surveys = survey_json_1.default;
const getEntries = () => {
    return surveys;
};
const findById = (id) => {
    const entry = surveys.find((survey) => survey.id === id);
    return entry;
};
const addEntry = () => {
    return null;
};
const addAnswer = (answer) => __awaiter(void 0, void 0, void 0, function* () {
    const newAnswer = new Answer(answer);
    let savedAnswer;
    try {
        savedAnswer = yield newAnswer.save();
    }
    catch (error) {
        console.error("Answer save error: " + error.message);
    }
    console.log(savedAnswer);
    return savedAnswer;
});
const getAnswers = (surveyId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = Answer.find({ surveyId: surveyId });
    let answers;
    try {
        answers = yield query.exec();
    }
    catch (error) {
        console.error("Get Answers error: " + error.message);
    }
    console.log(answers);
    return answers;
});
const getAnswersForQuestion = (surveyId, questionId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = Answer.find({ surveyId: surveyId });
    let answers;
    try {
        answers = yield query.exec();
    }
    catch (error) {
        console.error("Get Answers error: " + error.message);
    }
    let answersToReturn = [];
    answers.forEach((wholeAnswer) => {
        let tmp = wholeAnswer.answers.find((answer) => answer.questionId === +questionId);
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
});
exports.default = {
    getEntries,
    addEntry,
    findById,
    addAnswer,
    getAnswers,
    getAnswersForQuestion,
};
