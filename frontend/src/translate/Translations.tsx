export const languages = [
  { code: "en", name: "English" },
  { code: "pl", name: "Polski" },
];

//Interface translation strings
export const translations = {
  en: {
    // Language selection
    selectLanguage: "Language",
    // AdminPanel.tsx
    saveJSON: "Upload survey JSON",
    surveyManagement: "Survey management",
    addingANewSurvey: "Add a new survey",
    fileName: "File name",
    addingAPhotoToTheSurvey: "Add an image to the survey",
    imageName: "Image name and extension",
    listofImages: "List of Images",
    uploadFile: "Upload file",
    selectFile: "Select file",
    noFileSelected: "No file selected",
    uploadSuccessful: "File uploaded successfully",
    uploadError: "There was an error while uploading the file",
    fileError: "The file appears to be damaged",
    fileContentError: "The JSON file is not properly formatted",
    JSONFileList: "List of survey JSON files",
    delete: "Delete",
    passwordChange: "Password change",
    imageManagement: "Image management",
    changePassword: "Change password",
    currentPassword: "Current password",
    newPassword: "New password",
    passwordChangeSuccess: "Password changed successfully!",
    passwordChangeFail: "Error changing password. Check error console.",
    confirmFileDelete: "Are you sure you want to delete this file?",
    downloadFile: "Download",
    goBack: "Back",
    // Login.tsx
    hi: "Hello!",
    // Answers.tsx
    surveyResponses: "Responses to survey",
    // AnswersList.tsx
    name: "Name",
    age: "Age",
    gender: "Gender",
    answerType: "Answer type",
    questionId: "Question ID",
    answer: "Answer",
    sum: "Sum",
    totalPoints: "Total points of responders",
    mean: "Mean of categories",
    avgPerQuestion: "Average points scored per question",
    detailedPerRes: "Detailed points per respondent",
    detailedPerQue: "Detailed points per question",
    detailedPerRPerQ: "Detailed points per respondent and question",
    score: "Score",
    within: "within",
    outside: "outside",
    total: "Total score",
    // SurveyItem.tsx
    description: "Description",
    showAnswers: "Show answers",
    openSurvey: "Open survey",
    downloadAnswersJSON: "Download the answers to a JSON file",
    downloadAnswersCSV: "Download the answers to a CSV file",
    numberOfFilledSurveys: "Number of filled surveys: ",
    deleteSurveyAndAnswers: "Delete a survey and its answers",
    // Survey.tsx
    genericThanks: "Thank you for completing the survey.",
    scored: "You have scored: ",
    points: "points.",
    percentage: "% of the points.",
    scoredCategories: "You scored most points in the category ", 
    // LoginForm.tsx
    enterField: "Enter field",
    typeYear: "Type correct year",
    city: "City",
    notOnList: "Not on the list",
    clear: "Clear",
    start: "Start",
    male: "male",
    female: "female",
    irrelevant: "irrelevant",
    // Question.tsx
    question: "Question",
    endAndSend: "End and send",
    select: "Select ",
    startDrawing: "Start drawing",
    endDrawing: "End drawing",
    area: "area",
    line: "line",
    slider: "slider value",
    images: "images",
    single: "one answer",
    singleImage: "one image",
    multi: "one or more answers",
    point: "point",
    table: "one answer each row",
    cancel: "Cancel",

    next: "Next",
    prev: "Previous",
    "lang-choice": "Choose your language:",
  },
  pl: {
    // Language selection
    selectLanguage: "Język",
    // AdminPanel.tsx
    saveJSON: "Załaduj plik JSON",
    surveyManagement: "Zarządzanie ankietą",
    addingANewSurvey: "Dodanie nowej ankiety",
    fileName: "Nazwa pliku",
    addingAPhotoToTheSurvey: "Dodanie obrazka do ankiety",
    imageName: "Nazwa obrazka z jego rozszerzeniem",
    listofImages: "Lista obrazków",
    uploadFile: "Wyślij plik",
    selectFile: "Wybierz plik",
    noFileSelected: "Nie wybrano pliku",
    uploadSuccessful: "Plik został załadowany",
    uploadError: "Podczas przesyłania wystąpił błąd",
    fileError: "Plik jest uszkodzony",
    fileContentError: "Niepoprawny format pliku JSON",
    JSONFileList: "Lista plików JSON z ankietami",
    delete: "Usuń",
    passwordChange: "Zmiana hasła",
    imageManagement: "Zarządzanie obrazkami",
    changePassword: "Zmień hasło",
    currentPassword: "Aktualne hasło",
    newPassword: "Nowe hasło",
    passwordChangeSuccess: "Hasło zostało zmienione.",
    passwordChangeFail: "Wystąpił błąd. Sprawdź konsolę błędów.",
    confirmFileDelete: "Czy na pewno usunąć plik?",
    downloadFile: "Pobierz",
    goBack: "Powrót",    
    // Login.tsx
    hi: "Cześć!",
    // Answers.tsx
    surveyResponses: "Odpowiedzi do ankiety",
    // AnswersList.tsx
    name: "Imię",
    age: "Wiek",
    gender: "Płeć",
    answerType: "Typ odpowiedzi",
    questionId: "Nr odpowiedzi",
    answer: "Odpowiedź",
    sum: "Suma",
    totalPoints: "Suma punktów respondentów",
    mean: "Średnia kategorii",
    avgPerQuestion: "Średnia punktów dla pytania",
    detailedPerRes: "Szczegóły punktacji dla respondenta",
    detailedPerQue: "Szczegóły punktacji dla pytania",
    detailedPerRPerQ: "Szczegóły punktacji dla respondenta i pytania",
    score: "Punktacja",
    within: "należy",
    outside: "nie należy",
    total: "Wynik całkowity",
    // SurveyItem.tsx
    description: "Opis",
    showAnswers: "Pokaż odpowiedzi",
    openSurvey: "Rozpocznij ankietę",
    downloadAnswersJSON: "Pobierz odpowiedzi do pliku JSON",
    downloadAnswersCSV: "Pobierz odpowiedzi do pliku CSV",
    numberOfFilledSurveys: "Liczba wypełnionych ankiet: ",
    deleteSurveyAndAnswers: "Usuń ankietę i jej odpowiedzi",
    // Survey.tsx
    genericThanks: "Dziękujemy za wypełnienie ankiety.",
    scored: "Zdobyłeś/aś: ",
    points: " punktów.",
    percentage: "% punktów.",
    scoredCategories: "Najwięcej punktów zdobyłeś/aś w kategorii: ", 
    // LoginForm.tsx
    enterField: "Uzupełnij pole",
    typeYear: "Wprowadź poprawny rok",
    city: "Miasto",
    notOnList: "Nie ma na liście",
    clear: "Wyczyść",
    start: "Rozpocznij",
    male: "mężczyzna",
    female: "kobieta",
    irrelevant: "nie chcę podawać",
    // Question.tsx
    question: "Pytanie",
    endAndSend: "Zakończ i wyślij",
    select: "Wybierz ",
    startDrawing: "Zacznij rysowanie",
    endDrawing: "Zakończ rysowanie",
    area: "obszar",
    line: "linię",
    slider: "wartość",
    images: "zdjęcia",
    single: "jedną odpowiedź",
    singleImage: "jedno zdjęcie",
    multi: "jedną lub więcej odpowiedzi",
    point: "punkt",
    table: "jedną odpowiedź w każdym rzędzie",
    cancel: "Zamknij",

    next: "Następny",
    prev: "Poprzedni",
    "lang-choice": "Wybierz język:",
  },
};
