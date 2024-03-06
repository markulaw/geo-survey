import express from "express";
import surveyService from "../services/surveyService";

// Create a router instance
const router = express.Router();

// Route to get survey by ID
router.get("/:id", (req, res) => {
  const survey = surveyService.findById(+req.params.id);
  if (survey) res.send(survey);
  else res.sendStatus(404);
});

// Route to get all surveys
router.get("/", (_req, res) => {
  res.send(surveyService.getEntries());
});

// Route to save a new survey
router.post("/", (_req, res) => {
  res.send("Saving a surveys!");
});

// Route to add an answer to a survey
router.post("/addAnswer", async (req, res) => {
  const body = req.body;

  if (body === undefined) {
    return res.status(400).json({ error: "content missing" });
  }

  const answer = await surveyService.addAnswer(body);
  return res.json(answer);
});

// Route to get answers for a specific question in a survey
router.get("/:id/answers/:answerId", async (req, res) => {
  const surveyId = req.params.id;
  const answerId = req.params.answerId;

  if (surveyId === undefined) {
    return res.status(400).json({ error: "content missing" });
  }

  const answers = await surveyService.getAnswersForQuestion(surveyId, answerId);
  return res.json(answers);
});

// Route to get all answers for a survey
router.get("/:id/answers", async (req, res) => {
  const surveyId = req.params.id;

  if (surveyId === undefined) {
    return res.status(400).json({ error: "content missing" });
  }

  const answers = await surveyService.getAnswers(surveyId);
  return res.json(answers);
});

// Route to delete all answers for a survey
router.delete("/:id/deleteAnswers", async (req, res) => {
  const surveyId = req.params.id;
  console.log("Deleted answers from a survey ID: " + surveyId);

  if (surveyId === undefined) {
    return res.status(400).json({ error: "content missing" });
  }

  try {
    const deletedAnswers = await surveyService.deleteAnswers(surveyId);
    return res.json({
      message: "Answers deleted successfully",
      deletedAnswers,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error deleting answers", details: error });
  }
});

// Export the router
export default router;
