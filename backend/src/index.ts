require("dotenv").config(); // Load environment variables from .env file
import express from "express";
import multer from "multer"; // Import Multer for handling file uploads
import surveyRouter from "./routes/surveys";
import fs from "fs";
const cors = require("cors"); // Import CORS for enabling cross-origin resource sharing
const path = require("path"); // Import path module for working with file paths
const app = express(); // Create an Express application
import bcrypt from "bcryptjs";

// Parse incoming request bodies in JSON format
app.use(express.json());
// Serve static files from 'dist' directory
app.use(express.static("dist"));

// Set the port to the environment variable or default to 3001
const PORT = process.env.PORT || 3001;
// Enable CORS for all routes
app.use(cors());

// Use surveyRouter for /api/surveys routes
app.use("/api/surveys", surveyRouter);

// Route to serve images based on imageName
app.get("/api/images/:imageName", (_req, res) => {
  const imageName = _req.params.imageName;
  const pathToImage = findImagePath(imageName);

  if (pathToImage) {
    const imageExtension = path.extname(pathToImage);
    const contentType = getImageContentType(imageExtension);

    fs.readFile(pathToImage, (err, data) => {
      if (err) {
        res.status(404).send("The photo was not found.");
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
      }
    });
  } else {
    res.status(404).send("The photo was not found.");
  }
});

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Route to upload a survey file
app.post("/api/uploadSurvey", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const fileName = req.file.originalname;

    if (!fileName) {
      return res.status(400).send("Original file name not found");
    }

    const jsonContent = JSON.parse(req.file.buffer.toString());

    const filePath = `./src/data/${fileName}`;

    const jsonString = JSON.stringify(jsonContent, null, 2);

    fs.writeFileSync(filePath, jsonString, "utf-8");

    return res.status(200).send("File uploaded successfully");
  } catch (error) {
    return res.status(500).send("Error uploading file: ${error.message}");
  }
});

// Function to get hashed password (to adminPanel) from .passwd file
function getPasswordFromHtpasswd(
  htpasswdPath: string,
  username: string
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    fs.readFile(htpasswdPath, "utf-8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      const lines = data.split("\n");

      for (const line of lines) {
        const [fileUsername, hashedPassword] = line.split(":");

        if (fileUsername === username) {
          resolve(hashedPassword);
          return;
        }
      }
      // No password for the specified user
      resolve(null);
    });
  });
}

// Helper function to save password in .passwd file
function setPasswordInHtpasswd(
  htpasswdPath: string,
  username: string,
  hashedPassword: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Read the existing .passwd file
    fs.readFile(htpasswdPath, "utf-8", (readErr, data) => {
      if (readErr) {
        reject(readErr);
        return;
      }
      // Check if the user already exists in the file
      const lines = data.split("\n");
      let userAlreadyExists = false;

      for (const line of lines) {
        const [fileUsername, _] = line.split(":");

        if (fileUsername === username) {
          userAlreadyExists = true;
          break;
        }
      }
      // If the user already exists, update the password
      if (userAlreadyExists) {
        const updatedData = lines
          .map((line) => {
            const [fileUsername, _] = line.split(":");

            if (fileUsername === username) {
              return `${username}:${hashedPassword}`;
            }

            return line;
          })
          .join("\n");

        // Save the updated .passwd file
        fs.writeFile(htpasswdPath, updatedData, "utf-8", (writeErr) => {
          if (writeErr) {
            reject(writeErr);
            return;
          }

          resolve();
        });
      } else {
        // If the user does not exist, add a new line with the password
        const newData = `${data}\n${username}:${hashedPassword}`;
        // Save the .passwd file with the new password
        fs.writeFile(htpasswdPath, newData, "utf-8", (writeErr) => {
          if (writeErr) {
            reject(writeErr);
            return;
          }

          resolve();
        });
      }
    });
  });
}

// Route to change password (in adminPanel)
app.post("/change-password", async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  console.log("Received change-password request");
  console.log("Current Password:", currentPassword);

  const htpasswdPath = "/etc/nginx/.passwd";

  // Check user: 'admin' authentication
  try {
    // Get existing password from .passwd file
    const existingHashedPassword = await getPasswordFromHtpasswd(
      htpasswdPath,
      "admin"
    );

    if (existingHashedPassword !== null) {
      // Compare passwords without re-hashing
      const passwordMatch = await bcrypt.compare(
        currentPassword,
        existingHashedPassword
      );

      if (passwordMatch) {
        console.log("Password check succeeded");

        // Change password for admin user
        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        await setPasswordInHtpasswd(htpasswdPath, "admin", newHashedPassword);

        console.log("Password changed successfully");
        res.json({ message: "Password changed successfully" });
      } else {
        console.log("Authentication failed");
        res.status(401).json({ error: "Authentication failed" });
      }
    } else {
      console.log("User not found");
      res.status(404).json({ error: "User not found" });
    }
  } catch (error: any) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to fetch all files in the data directory
app.get("/api/files", (req, res) => {
  const jsonFilesPath = "./src/data";
  const clientIPAddress = req.ip;
  console.log(`Request from IP: ${clientIPAddress}`);

  try {
    const files = fs
      .readdirSync(jsonFilesPath)
      .filter((file) => file.endsWith(".json"));
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: "Error fetching files" });
  }
});

// Route to fetch content of a specific file
app.get("/api/files/:filename", (req, res) => {
  const jsonFilesPath = "./src/data";
  const { filename } = req.params;
  const clientIPAddress = req.ip;
  console.log(`Request from IP: ${clientIPAddress}`);

  try {
    const files = fs.readdirSync(jsonFilesPath);
    const fileExists = files.some((file) => file === filename);
    if (fileExists) {
      const filePath = `${jsonFilesPath}/${filename}`;
      const fileContent = fs.readFileSync(filePath, "utf-8");
      res.send(fileContent);
    } else {
      res.status(404).json({ error: "File not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching file" });
  }
});

// Route to delete a file
app.delete("/api/files/:filename", (req, res) => {
  const jsonFilesPath = "./src/data";
  const { filename } = req.params;
  const filePath = path.join(jsonFilesPath, filename);

  try {
    fs.unlinkSync(filePath);
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting file" });
  }
});

// Route to delete an image
app.delete("/api/images/:imageName", (req, res) => {
  // Get the name of the image without its extension
  const imageName = req.params.imageName;

  // Add support for various image extensions
  const imageExtensions = [".jpeg", ".jpg", ".png"];
  let imagePath;

  for (const ext of imageExtensions) {
    imagePath = path.join(imagesDirectory, `${imageName}${ext}`);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      return res.status(200).json({ message: "Image deleted successfully" });
    }
  }

  // No image found with any of the extensions
  return res.status(404).json({ error: "Image not found" });
});

// Function to retrieve a list of image names from a given directory without extensions
const getImageNamesWithoutExtension = (directory: string) => {
  const imageNames: string[] = [];
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const filePath = path.join(directory, file);

    // Check if this file is an image
    if (isImageFile(filePath)) {
      // Remove the extension before adding it to the list
      const fileNameWithoutExtension = path.basename(file, path.extname(file));
      imageNames.push(fileNameWithoutExtension);
    }
  });

  return imageNames;
};

// A function that checks whether a file has an image extension
const isImageFile = (filePath: string) => {
  const imageExtensions = [".jpg", ".jpeg", ".png"];
  const ext = path.extname(filePath).toLowerCase();
  return imageExtensions.includes(ext);
};

// Api to download a list of image names without extension
app.get("/api/images-list", (_req, res) => {
  try {
    const imageNamesWithoutExtension =
      getImageNamesWithoutExtension(imagesDirectory);
    res.json(imageNamesWithoutExtension);
  } catch (error) {
    console.error("Error fetching image names:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Multer file filter for image uploads
// A function to check whether an image has an allowed extension (jpeg, jpg or png)
const fileFilter = (_req: any, file: any, cb: any) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG and PNG files are allowed."), false);
  }
};

// Directory for storing images
const imagesDirectory = "./src/data/images";

// Multer configuration for uploading images
const storageImage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "./src/data/images"); //Set destination directory for image uploads
  },
  filename: function (_req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    ); // Set filename to include original name and timestamp
  },
});

const uploadImage = multer({ storage: storageImage, fileFilter });
// Route to upload an image
app.post(
  "/api/uploadImage",
  uploadImage.single("image"),
  (req: any, res: any) => {
    if (!req.file) {
      return res.status(400).send("No file selected");
    }
    const imageName = req.file.originalname;
    const tempPath = req.file.path;
    const targetPath = path.join(imagesDirectory, imageName);

    fs.rename(tempPath, targetPath, (err): any => {
      if (err) {
        console.error("Error during file transfer: ", err);
        return res.status(500).send("Error while saving the file!");
      }
      // Set full permissions on the file
      fs.chmod(targetPath, 0o777, (chmodErr) => {
        if (chmodErr) {
          console.error("Error setting file permissions: ", chmodErr);
          return res.status(500).send("Error setting file permissions!");
        }
        res.status(200).send("The photo was sent and saved successfully!");
      });
    });
  }
);

// Route to serve index.html for any other routes
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Function to find image path based on imageName
function findImagePath(imageName: string) {
  const imagesDirectory = "./src/data/images";

  const imageExtensions = [".png", ".jpeg", ".jpg"];

  const directoriesToSearch = [imagesDirectory];
  let currentDirectory;

  while (directoriesToSearch.length > 0) {
    currentDirectory = directoriesToSearch.shift();

    try {
      if (currentDirectory !== undefined) {
        const files = fs.readdirSync(currentDirectory);

        for (const file of files) {
          const filePath = path.join(currentDirectory, file);
          const stats = fs.statSync(filePath);

          if (stats.isDirectory()) {
            directoriesToSearch.push(filePath);
          } else {
            const fileNameWithoutExtension = path.parse(file).name;

            if (
              fileNameWithoutExtension === imageName &&
              imageExtensions.includes(path.extname(file))
            ) {
              return filePath;
            }
          }
        }
      }
    } catch (err) {
      console.error("Error reading directory:", err);
    }
  }

  return null;
}

// Function to get content type of an image based on its extension
function getImageContentType(extension: string) {
  switch (extension) {
    case ".png":
      return "image/png";
    case ".jpeg":
    case ".jpg":
      return "image/jpeg";
    default:
      return "application/octet-stream";
  }
}
