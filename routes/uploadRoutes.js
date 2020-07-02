const AWS = require('aws-sdk');
const { v1: uuid } = require('uuid');
const requireLogin = require('../middlewares/requireLogin');
const keys = require('../config/keys');

const s3 = new AWS.S3({
  accessKeyId: keys.accessKeyId,
  secretAccessKey: keys.secretAccessKey,
  signatureVersion: 'v4',
  region: 'ap-south-1',
});

module.exports = (app) => {
  app.get('/api/upload', requireLogin, (req, res) => {
    const Key = `${req.user.id}/${uuid()}.jpeg`;

    s3.getSignedUrl(
      'putObject',
      {
        Bucket: 'nikunj-blog-images',
        ContentType: 'image/jpeg',
        Key,
      },
      (err, url) => res.send({ Key, url }),
    );
  });
};
