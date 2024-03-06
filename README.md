# How to create a geosurvey
Set all needed data:
1. "id" - survey number (number)
2. "title" - survey name (string)
3. "desription" - survey description (string)
4. "zoom" - map zoom (number, scope: 0-18, 0 - min zoom, 18 - max zoom)
5. "center" - the point on which the map is centered (coordinates [latitude (number), longitude (number)])
6. "mapUrl" - map URL (URL, for example from mapbox)
7. "summary" - true/false (boolean, true - if you want a summary/thanks to respondents after completing a survey/ false - otherwise)
8. (optional) "summaryDetails" - if you have selected "summary" as true, in "summaryDetails" you provide the details of the summary/thanks:
* (optional) "generic" - true/false (boolean, true - if you want generic thanks: "Thank you for completing the survey."/ false - otherwise)
* (optional) "custom" - custom thanks (string)
* (optional) "pointsWithoutConditions" - true/false (boolean, true - the score obtained will always be displayed/ false - otherwise)
* (optional) "pointsAbovePercentage" - the number of points above which the total score obtained will be displayed (number)
* (optional) "percentageWithoutConditions" - true/false (boolean, true - the number of percentage obtained will always be displayed/ false - otherwise)
* (optional) "percentageAboveThreshold" - the number of percentage of points above which the total percentage of points obtained will be displayed (number)
* (optional) "categoriesDescriptionAboveThresholdPercentage" - the number of percentages needed to display the description of the category in which the respondent scored the highest number of points (number)
* (optional) "theBestCategorySummaryDescription" - true/false (boolean, true - the description of the best category will be displayed without conditions, false - otherwise)
9. "categories" - true/false (boolean, true - if you want scores assigned in categories you specify/ false - otherwise)
10. "categoriesNames" - names of scoring categories (string [], names of scoring categories/ empty array if you don't want scoring categories)
11. "questions" - survey questions (described below)
```json
{
    "id": 0,
    "title": "Survey title",
    "desription": "Survey description",
    "zoom": 12,
    "center": [54.35, 18.64],
    "mapUrl": <mapUrl>,
    "summary": true/false,
    "summaryDetails": {
      "thanks": {
        "generic": true/false,
        "custom": "custom summary/thanks"
      },
      "points": {
        "pointsWithoutConditions": 50,
        "pointsAbovePercentage": 50
      },
      "percentage" : {
        "percentageWithoutConditions": true/false,
        "percentageAboveThreshold": 50
      },
      "categories": {
        "categoriesDescriptionAboveThresholdPercentage": 50,
        "theBestCategorySummaryDescription": true
      }
    },
    "categories": true/false,
    "categoriesNames": [],
    "questions": [
```
# How to create questions in a geoquestionnaire

## Point type question
1. "id" - question number (number)
2. "answerType" - answer type (string - "Point")
3. "question" - question content (string)
4. "type" - GeoJSON type (string - "Point")
5. "coordinates" - coordinates of the good answer (coordinates [longitude! (number), latitude! (number)])
6. (optional) "mapCenter" - the point on which the map is centered only in this question (coordinates [latitude (number), longitude (number)])
7. (optional) "mapZoom" - map zoom only in this question (number, scope: 0-18, 0 - min zoom, 18 - max zoom)
8. (optional) "acceptableDistance" - the maximum distance [m] from the correct answer that will be scored, if not specified -> generic: 30 m (number)
9. (optional) "scoringCategories" - scoring categories (array):
* "name" - category name (string) 
* (optional) "theBestCategorySummaryDescription" - jeśli korzystasz z kategorii punktacji i chcesz pokazać respondentowi kategorię punktacji, w której uzyskał najwięcej punktów (string, opis, który zostanie wyświetlony respondentowi) 
* "score" - maximum number of points to be obtained in the category (number)
```json
{
        "id": 1,
        "answerType": "Point",
        "question": "Question content",
        "mapCenter": [52.114503, 19.423561],
        "mapZoom": 6.5,
        "answer": {
          "acceptableDistance": 50000,
          "geometry": {
            "type": "Point",
            "coordinates": [20.3832993, 53.7759825]
          },
          "scoringCategories": [
            {
              "name": "name 1",
              "theBestCategorySummaryDescription": "description 1",
              "score": 1
            },
            {
              "name": "name 2",
              "theBestCategorySummaryDescription": "description 2",
              "score": 1
            },
            {[...]}
      },
```

## LineString type question
1. "id" - survey number (number)
2. "answerType" - answer type (string - "LineString")
3. "question" - question content (string)
4. (optional) "mapCenter" - the point on which the map is centered only in this question (coordinates [latitude (number), longitude (number)])
5. (optional) "mapZoom" - map zoom only in this question (number, scope: 0-18, 0 - min zoom, 18 - max zoom)
6. (optional) "accetableMin" - the minimum percentage of hits on the polygon that will be scored (number)
7. "type" - GeoJSON type (string - "Polygon")
8. "coordinates" - coordinates of the good answer (coordinates array - [[longitude! (number), latitude! (number)], [...]])
9. (optional) "scoringCategories" - as above
```json
{
        "id": 2,
        "answerType": "LineString",
        "question": "question content",
        "mapCenter": [52.114503, 19.423561],
        "mapZoom": 6.5,
        "answer": {
          "accetableMin": 50,
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [18.652961254119873, 54.348702855583035],
                [18.651373386383057, 54.34913433168772],
                [18.64781141281128, 54.34984094219094],
                [18.647468090057373, 54.35000352341927],
                [18.646620512008667, 54.350191116345016],
                [18.64616721868515, 54.350264590007555],
                [18.64429235458374, 54.35038496146865],
                [18.64380955696106, 54.34947825867151],
                [18.644195795059204, 54.34944699270101],
                [18.644474744796753, 54.3499847640796],
                [18.6468243598938, 54.34971587926996],
                [18.647403717041016, 54.349603322315645],
                [18.647607564926147, 54.34970337295693],
                [18.65280032157898, 54.348552775876065],
                [18.652961254119873, 54.348702855583035]
              ]
            ]
          }
        }
      },
```
## Polygon type question
1. "id" - survey number (number)
2. "answerType" - answer type (string - "Polygon")
3. "question" - question content (string)
4. (optional) "mapCenter" - the point on which the map is centered only in this question (coordinates [latitude (number), longitude (number)])
5. (optional) "mapZoom" - map zoom only in this question (number, scope: 0-18, 0 - min zoom, 18 - max zoom)
6. (optional) "accetableMin" - the minimum percentage of hits on the polygon that will be scored (number)
7. "type" - GeoJSON type (string - "Polygon")
8. "coordinates" - coordinates of the good answer (coordinates array - [[longitude! (number), latitude! (number)], [...]])
9. (optional) "scoringCategories" - as above
```json
{
        "id": 3,
        "answerType": "Polygon",
        "question": "question content",
        "mapCenter": [52.114503, 19.423561],
        "mapZoom": 6.5,
        "answer": {
          "accetableMin": 50,
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [18.645601272583008, 54.35222957092619],
                [18.653197288513184, 54.35222957092619],
                [18.653197288513184, 54.358331824292414],
                [18.645601272583008, 54.358331824292414],
                [18.645601272583008, 54.35222957092619]
              ]
            ]
          }
        }
      },
```

## Single choice type question
1. "id" - survey number (number)
2. "answerType" - answer type (string - "SingleChoice")
3. "question" - question content (string)
4. "type" - type (string - "SingleChoice")
5. "answers" - an array of available answer choices (string [])
6. "points" - scoring for selected answers, answer from first index -> points from first index (number [])
7. (optional) "scoringCategories" - as above
```json
{
        "id": 4,
        "answerType": "SingleChoice",
        "question": "question content",
        "answer": {
          "geometry": {
            "type": "SingleChoice"
          },
          "answers": ["answer 1", "answer 2", "answer 3", "answer 4"],
          "points": [1, 1, 1, 0]
        }
},
```

## Multiple choices type question
1. "id" - survey number (number)
2. "answerType" - answer type (string - "MultipleChoice")
3. "question" - question content (string)
4. "type" - type (string - "MultipleChoice")
5. "answers" - an array of available answer choices (string [])
6. "points" - scoring for selected answers, answer from first index -> points from first index (number [])
7. (optional) "scoringCategories" - as above
```json
{
        "id": 5,
        "answerType": "MultipleChoice",
        "question": "question content",
        "answer": {
          "geometry": {
            "type": "MultipleChoice"
          },
          "answers": ["answer 1", "answer 2", "answer 3", "answer 4"],
          "points": [1, 1, 1, 0]
        }
},
```

## Single image choice type question
1. "id" - survey number (number)
2. "answerType" - answer type (string - "SingleImage")
3. "question" - question content (string)
4. "type" - type (string - "SingleImage")
5. "answers" - an array of available image answer choices (string [] - paths to images)
6. "points" - scoring for selected answers, answer from first index -> points from first index (number [])
7. (optional) "scoringCategories" - as above
```json
{
        "id": 6,
        "answerType": "SingleImage",
        "question": "question content?",
        "answer": {
          "geometry": {
            "type": "SingleImage"
          },
          "answers": [
            "/images/img1.png",
            "/images/img2.png",
            "/images/img3.png",
            "/images/img4.png"
          ],
          "points": [1, 1, 1, 0]
        }
},
```

## Multiple images choice type question
1. "id" - survey number (number)
2. "answerType" - answer type (string - "Images")
3. "question" - question content (string)
4. (optional - can be to added in all types of questions) "img" - image under the question (string - a path to an image)
5. "type" - type (string - "Images")
6. "answers" - an array of available image answer choices (string [] - paths to images)
7. "points" - scoring for selected answers, answer from first index -> points from first index (number [])
8. (optional) "scoringCategories" - as above
```json
{
        "id": 7,
        "answerType": "Images",
        "question": "question content",
        "img": "/images/img0.png",
        "answer": {
          "geometry": {
            "type": "Images"
          },
          "answers": [
            "/images/img1.png",
            "/images/img2.png",
            "/images/img3.png",
            "/images/img4.png",
            "/images/img5.png",
            "/images/img6.png"
          ],
          "points": [-0.25, 0.25, 0.25, -0.25, 0.25, 0.25]
        }
}
```

## Slider type question
1. "id" - survey number (number)
2. "answerType" - answer type (string - "Slider")
3. "question" - question content (string)
4. "type" - type (string - "Slider")
5. "goodAnswer" - a correct answer that will be scored
6. (optional) "scoringCategories" - as above
```json
{
                "id": 8,
                "answerType": "Slider",
                "question": "question content",
                "answer": {
                    "geometry": {
                        "type": "Slider",
                    },
                    "goodAnswer": 50
                },
            },
```

## Table type question
1. "id" - survey number (number)
2. "answerType" - answer type (string - "Table")
3. "question" - question content (string)
4. "type" - type (string - "Table")
5. "table" - question rows (string [])
6. "answers" - an array of available image answer choices (string [] - paths to images)
7. "points" - scoring for selected answers (number [])
7. (optional) "scoringCategories" - as above
```json
{
        "id": 9,
        "answerType": "Table",
        "question": "question content",
        "answer": {
          "geometry": {
            "type": "Table"
          },
          "table": [
            "row 1",
            "row 2",
            "row 3",
            "row 4"
          ],
          "answers": ["answer 1", "answer 2", "answer 3"],
          "points": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
}
```

# Geo surveys

- [Geo surveys](#geo-surveys)
  - [Prerequisites](#prerequisites)
  - [Production deployment](#production-deployment)
    - [AWS EC2 deployment](#aws-ec2-deployment)
    - [Application docker-compose deployment](#application-docker-compose-deployment)
    - [Cleanup](#cleanup)
  - [Debug (local) deployment](#debug-local-deployment)
    - [Application docker-compose deployment](#application-docker-compose-deployment-1)


## Prerequisites
Make sure you have:
* AWS account;
* AWS security credentials (`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`) ready;
* Terraform and AWS CLI installed on your local system;
* GitHub personal access tokens allowing you to clone the repository and push images to GitHub Container Registry;

## Production deployment
To make the application available from the Internet we will:
* deploy a VM in a public cloud using Terraform;
* deploy the application in the VM using docker-compose;

### AWS EC2 deployment


**Steps to be executed on local machine**
1. Export AWS security credentials in the current shell (prepend commands with space to prevent writing to bash history):
```shell 
 export AWS_ACCESS_KEY_ID=<your-access-key-id>
 export AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
```

2. Deploy EC2 instance in AWS:
```shell
cd aws-deployment
terraform apply
```

3. Change permissions of created private key (will be used to SSH into the VM):
```shell
chmod 400 ./ec2-instances.pem
```

4. Get public address of deployed VM:
```shell
terraform show | grep public_dns
```

5. SSH into remote VM using its public address and SSH key:
```shell
ssh -i ec2-instances.pem ubuntu@<ec2-public-dns-from-previous-step>
```

6. Cleanup - to destroy all services created in AWS run commands:
```shell
terraform destroy
rm ./ec2-instances.pem
```

### Application docker-compose deployment

**Steps to be executed on local machine**
1. Login to GitHub Container Registry:
```shell
 export CR_PAT=<your-personal-access-token>
echo $CR_PAT | docker login ghcr.io -u <username> --password-stdin
```

2. Replace value of `axiosConfig.baseURL` variable in `frontend/src/api/axiosApi.ts` file with current VM public DNS.

3. Build and push services' Docker images to own GitHub Container Registry:
```shell
docker-compose build --no-cache && docker-compose push
```

4. Logout from GHCR:
```shell
docker logout
```

**Steps to be executed on remote VM**
1. After logging into VM clone the repository:
```shell
git clone https://github.com/laurazembrzuska/geosurveys
cd geosurveys
```

2. Then, run command to start all services:
```shell
docker-compose up -d
```
> The application will be available at: `http://<ec2-public-dns>/dashboard`


3. To view services logs run:
```shell
docker-compose logs -f
```

4. Cleanup - to stop and remove all services run:
```shell
docker-compose down
```

### Cleanup
**Steps to be executed on remote VM**
1. After logging into AWS EC2 stop and remove all services:
```shell
docker-compose down
```

**Steps to be executed on local machine**
1. Destroy all services created in AWS:
```shell
cd aws-deployment
terraform destroy
rm ./ec2-instances.pem
```

## Debug (local) deployment
To make the application available locally for debugging purposes we will:
* deploy the application on local machine using docker-compose;

### Application docker-compose deployment

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


3. To view services logs run:
```shell
docker-compose logs -f
```

4. Cleanup - to stop and remove all services run:
```shell
docker-compose down
```
