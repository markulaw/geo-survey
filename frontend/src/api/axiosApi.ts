import axios from "axios";
import getConfig from "../helpers/GetConfig";

// Create an instance of axios for the survey application
const axiosSurveyApp = axios.create({
  baseURL: "", // Base URL for the axios instance (to be determined dynamically)
});

// Intercept requests before they are sent
axiosSurveyApp.interceptors.request.use(async (axiosConfig) => {
  // Get configuration data asynchronously
  let config = await getConfig();

  // Set the base URL for the axios instance based on the environment or configuration
  // URL to run code locally
  //axiosConfig.baseURL = 'http://localhost/api/'

  // URL to run code on aws
  axiosConfig.baseURL = "/api/";

  return axiosConfig;
});

export default axiosSurveyApp;
