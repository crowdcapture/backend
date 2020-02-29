const uuidUtil = require('../util/uuid');
const sharp = require('sharp');
const fetch = require('node-fetch');
const queries = require('../../db/queries/image');
const fs = require('fs');
const AWS = require('aws-sdk');

async function flip(req, res, next) {
    try {
        if (!req.params.id) {
            throw ({ success: false, status: 400, message: 'Some required properties where not set' });
        }

        if (!uuidUtil.uuidValidator(req.params.id)) {
            throw ({ success: false, status: 400, message: 'ID should be a valid UUID.' });
        }

        // Check if the image exists
        const image = await queries.getImage(req.params.id);

        if (image.length === 0) {
            throw ({ success: false, status: 400, message: 'This id does not seem to exist' });
        }

        const filename = image[0].filename;

        // Process the original image
        await downloadImage(image[0].url, filename);
        const data = await rotateImage(`temp/t-${filename}`, filename, false);
        await uploadImageToS3(`temp/${filename}`, filename, `${image[0].project}/original/${filename}`);

        // Process the thumbnail image
        const dataSmall = await rotateImage(`temp/t-${filename}`, filename, true);
        data.heightSmall = dataSmall.height;
        data.widthSmall = dataSmall.width;
        await uploadImageToS3(`temp/${filename}`, filename, `${image[0].project}/small/${filename}`);

        await cleanup(`temp/${filename}`, filename);
        await queries.updateImage(data, image[0].id);

        res.status(200);
        res.send({
            success: true,
            message: 'Images where flipped.'
        });
    } catch (error) {
        next(error);
    }
}

async function downloadImage(url, fileExt) {
    return new Promise(async (resolve, reject) => {
        const res = await fetch(url);
        const fileStream = fs.createWriteStream(`temp/t-${fileExt}`);

        res.body.pipe(fileStream);

        res.body.on("error", (error) => {
            reject(error);
        });

        fileStream.on("finish", function () {
            resolve();
        });
    });
}

async function rotateImage(filepath, fileExt, resize) {
    return new Promise(async (resolve, reject) => {
        try {
            let file;

            if (resize) {
                file = await sharp(filepath)
                    .resize(null, 700)
                    .rotate(90)
                    .toFile(`temp/${fileExt}`);
            } else {
                file = await sharp(filepath)
                    .rotate(90)
                    .toFile(`temp/${fileExt}`);
            }

            const data = {
                width: file.width,
                height: file.height
            }

            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

async function uploadImageToS3(filepath, fileExt, key) {
    return new Promise((resolve, reject) => {
        try {
            const endpoint = new AWS.Endpoint(process.env.AWS_ENDPOINT);

            const S3 = new AWS.S3({
                endpoint: endpoint,
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            });

            const file = fs.createReadStream(filepath);

            const params = {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: key,
                Body: file,
                ACL: 'public-read'
            };

            S3.upload(params, function(err, data) {
                if (err) {
                    reject({ success: false, message: 'There was a problem with S3 Upload' });
                } else {
                    data.filename = fileExt;

                    resolve(data);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

async function cleanup(filepath, fileExt) {
    return new Promise((resolve, reject) => {
        try {
            // Remove temp image after uploading
            fs.unlink(filepath, (error) => {
                if (error) {
                    reject({ success: false, message: 'Removing file did not work.'});
                }

                return;
            });

            // Remove temp downloaded image after uploading
            fs.unlink(`temp/t-${fileExt}`, (error) => {
                if (error) {
                    reject({ success: false, message: 'Removing file did not work.'});
                }

                return;
            });

            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = flip;