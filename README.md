# The Odinbook - REST API

This is backend for my fake social network. It was build using NodeJS and ExpressJS framework. For database I used MongoDB with Mongoose and PassportJS with Facebook for oAuth validation. Images are saved to Amazon S3.

## Technology Used

1. NodeJS
2. ExpressJS
3. PassportJS
4. MongoDB with Mongoose
5. AWS S3

## Frontend Repository

[Frontend Github Repository](https://github.com/polhek/fake-social-network-front)

## To make app work:

You need to provide in your .env file the following variables:

- secretOrKey
- FB_ID
- FB_SECRET
- DB_URL (atlas)
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- S3_BUCKET_NAME

## TODO:

- reconstruct/add to the app normal login, with username and password, for the sake of testing the app without Facebook oAuth, so everyone can join and test the app, not just "test" users with the right Facebook authentication token.
