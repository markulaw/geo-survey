// Interface defining the structure of a survey entry
export interface SurveyEntry {
  surveyId: number;
  title: string;
  description: string;
  categories: boolean | undefined;
  categoriesNames: string[] | undefined;
  questions: QuestionType[];
}

// Interface defining the structure of a question in a survey
export interface QuestionType {
  id: number;
  answerType: string;
  question: string;
}
