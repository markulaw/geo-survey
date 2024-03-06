// Import the axios library for making HTTP requests
import axios from "axios";

// Function to retrieve configuration settings
const getConfig = async (reload = false) => {
  let config = null;

  // Check if configuration settings are stored in local storage and not forced to reload
  if (localStorage.getItem("config") && !reload) {
    // Retrieve configuration settings from local storage
    config = localStorage.getItem("config");
    if (config) {
      // Parse the configuration settings from JSON string to object
      config = JSON.parse(config);
    }
  } else {
    // Fetch configuration settings from the server
    let response = await axios.get("./config.json");
    // Extract data from the response
    config = response.data;
    // Store configuration settings in local storage for future use
    localStorage.setItem("config", JSON.stringify(config));
  }

  return config;
};
// Export the getConfig function
export default getConfig;
