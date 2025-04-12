const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

function uploadToS3(folderName, fileName, fileData) {

    var bucketName = process.env.AWS_BUCKET_NAME;

    return new Promise((resolve, reject) => {

        const s3 = new AWS.S3();

        const params = {
            Bucket: bucketName,
            Key: folderName + fileName,
            Body: fileData.buffer,
            ACL: 'public-read'
        };

        s3.upload(params, (err, data) => {
            if (err) {
                console.error('Error uploading file to S3:', err);
                reject(err);
            } else {
                // console.log('File uploaded successfully:', data.Location);
                resolve(data.Location);
            }
        });
    })
}

function removeTos3(key) {

    var bucket = process.env.AWS_BUCKET_NAME;

    return new Promise((resolve, reject) => {
        const params = {
            Bucket: bucket,
            Key: key,
        };

        s3.deleteObject(params, (err, data) => {
            if (err) {
                return reject(err);
            }
            // console.log(data);
            resolve(data);
        });
    });
};

module.exports = { uploadToS3, removeTos3 };
