import {MultiLingual} from "../api/surveyApi";

export const getTranslatedValue = <T>(value: T | MultiLingual<T>): T => {
  const language =
    JSON.parse(localStorage.getItem("languageHook") || '"pl"') || "pl";

  if (
    typeof value !== "object" ||
    value === null
  ) {
    return value as T;
  }

  const multilingualValue = value as MultiLingual<T>;
  const langKey = language as keyof MultiLingual<T>;

  return (
    multilingualValue[langKey] ??
    multilingualValue["en"] ??
    (Object.values(multilingualValue)[0] as T)
  );
};