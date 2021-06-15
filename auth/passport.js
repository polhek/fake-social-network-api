const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');
const { ExtractJwt } = require('passport-jwt');
require('dotenv').config();
const User = require('../models/user');
const request = require('request');
const fs = require('fs');
const path = require('path');
const aws = require('aws-sdk');

aws.config.region = 'us-east-2';

// Secret for JWT token strategy ...

const secretOrKey = process.env.secretOrKey;

// Facebook app secret and ID ...
const FB_id = process.env.FB_ID;
const FB_secret = process.env.FB_SECRET;

// JWT-TOKEN-STRATEGY ...
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secretOrKey,
    },
    async (payload, done) => {
      try {
        // Find the user by its id, which is saved in payload.sub...
        const user = await User.findById(payload.sub);

        // if user doesnt exist, handle it ...
        if (!user) {
          return done(null, false);
        }

        // return the user if it exists ...
        done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Facebook strategy ...
passport.use(
  'facebookToken',
  new FacebookTokenStrategy(
    { clientID: FB_id, clientSecret: FB_secret },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists...
        const existingUser = await User.findOne({ facebook_id: profile.id });

        if (existingUser) {
          await existingUser.save();
          return done(null, existingUser);
        }

        const profilePicture = `https://graph.facebook.com/${profile.id}/picture?width=200&height=200&access_token=${accessToken}`;
        const s3 = new aws.S3();

        const newUser = new User({
          first_name: profile.name.givenName,
          last_name: profile.name.familyName,
          email: profile.emails[0].value,
          profile_img_url: profilePicture,
          facebook_id: profile.id,
        });

        request(
          { uri: profilePicture, encoding: null },
          (err, response, body) => {
            if (err || response.statusCode !== 200) {
              console.log('failed to get image');
              console.log(err);
            } else {
              s3.upload(
                {
                  Body: body,
                  Key: `profile/images/${newUser._id}.jpeg`,
                  Bucket: process.env.S3_BUCKET_NAME,
                },
                (err, data) => {
                  if (err) {
                    return err;
                  } else {
                    return data;
                  }
                }
              );
            }
          }
        );
        newUser.profile_img_url = `https://${process.env.S3_BUCKET_NAME}.s3.us-east-2.amazonaws.com/profile/images/${newUser._id}.jpeg`;
        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        return done(err, false, err.message);
      }
    }
  )
);
