# What is the geo-survey?

A geo-survey is a tool used to collect data and information in surveys while incorporating geographical or spatial elements, enabling the assessment and analysis of data in relation to specific locations or geographic areas. Its use is governed by [GNU General Public License v3.0](https://github.com/markulaw/geo-survey/blob/main/LICENSE).

The app can operate as both **a simple survey platform** and a **geo-survey tool**, which combines survey capabilities with digital mapping functionalities (questions are answered on the map). Additionally, it serves as **a application for surveying and analyzing the spatial distribution of emotions**.

For more information, see the [Wiki](https://github.com/markulaw/geo-survey/wiki).

## How to launch the app?


**Steps to be executed on local machine**
1. Build services' Docker images:
```shell
docker-compose build --no-cache
```

2. Then, run command to start all services:
```shell
docker-compose up -d
```
> The application will be available at: `http://localhost/dashboard`
![image](https://github.com/markulaw/geo-survey/assets/62136542/1f99fe62-0866-4559-9b4d-ab2db78d5926)


3. To view services logs run:
```shell
docker-compose logs -f
```

4. Cleanup - to stop and remove all services run:
```shell
docker-compose down
```

To make the application available from the Internet (using AWS), see the [Wiki](https://github.com/markulaw/geo-survey/wiki/How-to-launch-the-app#AWS).


## How to create a survey?

Go to the administration panel (/adminPanel) to the 'Survey management ' tab.  In the section 'Add a new survey', upload the .json file you have prepared with regard to the [this instructions](https://github.com/markulaw/geo-survey/wiki/How-to-create-a-geosurvey). Place the images you wish to include in the survey in 'Image management' under 'Add an image to the survey'. 

![image](https://github.com/markulaw/geo-survey/assets/62136542/8c825472-c5d5-48f7-b37a-5d2c95f1610b)

The sample surveys are located in the repository in the path '/backend/src/data/'.
