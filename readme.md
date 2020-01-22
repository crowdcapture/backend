# CrowdCapture Backend

[![Known Vulnerabilities](https://snyk.io/test/github/crowdcapture/backend/badge.svg?targetFile=package.json)](https://snyk.io/test/github/crowdcapture/backend?targetFile=package.json)

This is the NodeJS code that runs the backend of CrowdCapture.

To run this code locally you can run `docker-compose build` and `docker-compose up`. This will start the NodeJS process and a Postgress Database.

## Environment Variables
The following list of environment variables should be set in a .env file.

- AWS_ACCESS_KEY_ID
- AWS_REGION
- AWS_SECRET_ACCESS_KEY
- AWS_S3_BUCKET_NAME
- POSTGRES_PASSWORD
- POSTGRES_USER
- POSTGRES_DB
- MJ_APIKEY
- MJ_SECRETKEY
- MJ_SEND_EMAIL=true
- JWT_SECRET