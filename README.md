# What is Geo-survey?

Geo-survey is a tool for collecting user data in surveys which incorporate geographical or spatial elements, enabling the assessment and analysis of data in relation to specific locations or geographic areas. Its use is governed by [GNU Affero General Public License v3.0](https://github.com/markulaw/geo-survey/blob/main/LICENSE).

The app can operate as a **spatial questionnaire tool**, which combines survey capabilities with digital mapping functionalities (i.e. questions are answered on the map), as well as **a simple survey platform** where questions are answered by clicking on predefined text strings or images. Combining these two functionalities provides the app with the flexibility to serves eg. as **an application for surveying and analyzing the spatial distribution of emotions**. Moreover, the application provides tools for **automated scoring and analysis of collected survey replies**.

<p>
<img src='https://github.com/markulaw/geo-survey/assets/62136542/ef14e7be-4345-4a83-bf50-33d741618a51' width="45%"/>
<img src='https://github.com/markulaw/geo-survey/assets/61965733/c1f05604-e7b7-4e77-80fe-3914ad6e3b2a' width="45%"/>  
<img src='https://github.com/markulaw/geo-survey/assets/62136542/801e88d0-ec3e-458e-b97a-5db82a773085' width="45%"/>
<img src='https://github.com/markulaw/geo-survey/assets/61965733/f9699f04-ffbe-4763-bf8e-91a660e788f2' width="45%"/>
<img src='https://github.com/markulaw/geo-survey/assets/62136542/7dc74b90-8cc2-4d84-a1d0-903db266f652' width="45%"/>
<img src='https://github.com/markulaw/geo-survey/assets/62136542/4024c4a2-fdb7-49cc-8605-3be82dc483af' width="45%"/>

</p>


For more information, see the [Wiki](https://github.com/markulaw/geo-survey/wiki).

## How to launch the app?


**Steps to be executed on local machine**
1. Build Docker images of all services:
```shell
docker-compose build --no-cache
```

2. Start all services:
```shell
docker-compose up -d
```
> The application will be available at: `http://localhost/dashboard`
<img src='https://github.com/markulaw/geo-survey/assets/62136542/1f99fe62-0866-4559-9b4d-ab2db78d5926' width="45%"/>



3. To view service logs run:
```shell
docker-compose logs -f
```

4. To stop and remove all services run:
```shell
docker-compose down
```

To publish the application on a Web server (eg. using AWS), see the [Wiki](https://github.com/markulaw/geo-survey/wiki/How-to-launch-the-app#AWS).


## How to create a survey?

Open the administration panel (/adminPanel) and click the 'Survey management ' tab.  In the section 'Add a new survey', upload a .json file prepared according to the [instructions](https://github.com/markulaw/geo-survey/wiki/How-to-create-a-geosurvey). If you wish to include images in the survey, upload them in the 'Image management' section under 'Add an image to the survey'. 

<img src='https://github.com/markulaw/geo-survey/assets/62136542/5b1804e7-91cb-49bb-bc2c-73df45167bca' width="45%"/>

You can have sample survey files in the '/backend/src/data/' folder of the app.

