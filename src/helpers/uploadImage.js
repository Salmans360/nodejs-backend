require('dotenv').config();
const logger = require('./logger');
const AWS = require('aws-sdk');
const imageUpload = async (base64, path) => {
  try {
    require('dotenv').config();
    const logger = require('./logger');
    const AWS = require('aws-sdk');
    let region = '';
    let accessKeyId = '';
    let secretAccessKey = '';
    let Bucket = '';
    if (process.env.NODE_ENV == 'production') {
      region = `${process.env.AWS_REGION_PROD}`;
      accessKeyId = `${process.env.ACCESS_KEY_ID_PROD}`;
      secretAccessKey = `${process.env.SECRET_ACCESS_KEY_PROD}`;
      Bucket = `${process.env.S3_BUCKET_PROD}`;
    } else {
      region = `${process.env.AWS_REGION}`;
      accessKeyId = `${process.env.ACCESS_KEY_ID}`;
      secretAccessKey = `${process.env.SECRET_ACCESS_KEY}`;
      Bucket = `${process.env.S3_BUCKET}`;
    }
    // const { ACCESS_KEY_ID, SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET } =
    //   process.env;

    AWS.config.setPromisesDependency(require('bluebird'));
    AWS.config.update({
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      region: region,
    });

    const s3 = new AWS.S3();

    const base64Data = Buffer.from(
      base64.replace(/^data:image\/\w+;base64,/, ''),
      'base64',
    );

    const type = base64.split(';')[0].split('/')[1];

    const params = {
      Bucket: Bucket,
      Key: `${path}.${type}`, // type is not required
      Body: base64Data,
      ContentEncoding: 'base64', // required
      ContentType: `image/${type}`, // required. Notice the back ticks
    };

    let location = '';
    let key = '';
    try {
      const { Location, Key } = await s3.upload(params).promise();
      location = Location;
      key = Key;
    } catch (error) {
      console.log('sfdfdsfds', error);
      return false;
    }

    return location;
  } catch (err) {
    console.log('hehehee', err);
    return false;
  }
};

module.exports = imageUpload;
