export type MultiLingual<T> = {
  pl: T;
  en: T;
}

// Interface defining the structure of a survey entry
export interface SurveyEntry {
  surveyId: number;
  title: string | MultiLingual<string>;
  description: string | MultiLingual<string>;
  categories: boolean | undefined;
  categoriesNames: (string | MultiLingual<string>)[] | undefined;
  questions: QuestionType[];
}

// Interface defining the structure of a question in a survey
export interface QuestionType {
  id: number;
  answerType: string;
  question: string | MultiLingual<string>;
}
