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
const express_1 = __importDefault(require("express"));
const surveyService_1 = __importDefault(require("../services/surveyService"));
const router = express_1.default.Router();
router.get('/:id', (req, res) => {
    const survey = surveyService_1.default.findById(+req.params.id);
    if (survey)
        res.send(survey);
    else
        res.sendStatus(404);
});
router.get('/', (_req, res) => {
    res.send(surveyService_1.default.getEntries());
});
router.post('/', (_req, res) => {
    res.send('Saving a surveys!');
});
router.post('/addAnswer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    if (body === undefined) {
        return res.status(400).json({ error: 'content missing' });
    }
    const answer = yield surveyService_1.default.addAnswer(body);
    return res.json(answer);
}));
router.get('/:id/answers/:answerId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const surveyId = req.params.id;
    const answerId = req.params.answerId;
    if (surveyId === undefined) {
        return res.status(400).json({ error: 'content missing' });
    }
    const answers = yield surveyService_1.default.getAnswersForQuestion(surveyId, answerId);
    return res.json(answers);
}));
router.get('/:id/answers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const surveyId = req.params.id;
    if (surveyId === undefined) {
        return res.status(400).json({ error: 'content missing' });
    }
    const answers = yield surveyService_1.default.getAnswers(surveyId);
    return res.json(answers);
}));
exports.default = router;
