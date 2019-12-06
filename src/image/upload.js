const multiparty = require('multiparty');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');
const uuid = require('uuid');
const hashUtil = require('../util/hash');
const queries = require('../../db/queries/project');
const imageQueries = require('../../db/queries/image');

async function upload(req, res, next) {
    try {
        // Check if the project exists
        const project = await queries.getProject(req.params.id);

        if (project.length === 0) {
            throw({ success: false, status: 400, message: 'This id does not seem to exist' });
        }

        const images = await uploadAllImages(req);

        const imagesDb = images.map((image) => {
            return {
                id: uuid.v4(),
                filename: image.Key,
                url: image.Location,
                project: req.params.id,
                created: new Date(),
                created_by: req.user.id,
                sha_256: image.sha_256,
                banned: false,
                validated: false
            }
        });

        await imageQueries.insertImages(imagesDb);

        res.status(200);
        res.send({
            success: true,
            message: 'Images are uploaded to the project.'
        });
    } catch (error) {
        next(error);
    }
}

async function uploadAllImages(req) {
    return new Promise(async (resolve, reject) => {
        try {
            const form = new multiparty.Form({
                maxFields: 100
            });

            const images = [];

            form.parse(req, async (error, fields, files) => {
                if (error) {
                    reject({ success: false, message: error.message });
                    return;
                }

                await Promise.all(files.null.map(async (file) => {
                    const response = await uploadImageS3(file, req.params.id);
                    response.sha_256 = await hashUtil.createHashFromFile(file.path);
                    images.push(response);
                }));

                resolve(images);
            });
        } catch (error) {
            reject(error);
        }
    });
}

async function uploadImageS3(fileObject, project_id) {
    return new Promise(async (resolve, reject) => {
        try {
            const S3 = new AWS.S3();

            // Create project bucket if it does not exists yet.
            await checkBucket(project_id);

            const filename = crypto.randomBytes(8).toString('hex');
            const file = fs.createReadStream(fileObject.path);

            const params = {
                Bucket: project_id,
                Key: filename + path.extname(fileObject.path).toLowerCase(),
                Body: file,
                ACL: 'public-read'
            };

            S3.upload(params, function(err, data) {
                if (err) {
                    reject({ success: false, message: 'There was a problem with S3 Upload' });
                } else {
                    resolve(data);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

async function checkBucket(project_id) {
    return new Promise(async (resolve, reject) => {
        try {
            const S3 = new AWS.S3();
            const params = {
                Bucket: project_id
            }

            try {
                await S3.headBucket(params).promise();

                resolve();
            } catch (error) {
                if (error.statusCode === 404) {
                    await S3.createBucket(params).promise();
                    resolve();
                } else {
                    throw({ success: false, message: 'Could not make the required bucket' });
                }
            }
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = upload;