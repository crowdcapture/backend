const multiparty = require('multiparty');
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');
const uuid = require('uuid');
const probe = require('probe-image-size');
const randomString = require('crypto-random-string');
const sharp = require('sharp');

const uuidUtil = require('../util/uuid');
const hashUtil = require('../util/hash');
const queries = require('../../db/queries/project');
const imageQueries = require('../../db/queries/image');

async function upload(req, res, next) {
    try {
        if (!uuidUtil.uuidValidator(req.params.id)) {
            throw({ success: false, status: 400, message: 'ID should be a valid UUID.' });
        }

        // Check if the project exists
        const project = await queries.getProject(req.params.id);

        if (project.length === 0) {
            throw({ success: false, status: 400, message: 'This id does not seem to exist' });
        }

        const images = await uploadAllImages(req);

        const imagesDb = images.map((image) => {
            return {
                id: uuid.v4(),
                filename: image.filename,
                url: `https://${process.env.AWS_S3_BUCKET_NAME}.${process.env.AWS_ENDPOINT}/${image.Key}`,
                urlSmall: `https://${process.env.AWS_S3_BUCKET_NAME}.${process.env.AWS_ENDPOINT}/${image.keySmall}`,
                project: req.params.id,
                created: new Date(),
                created_by: req.user.id,
                sha_256: image.sha_256,
                banned: false,
                validated: false,
                height: image.height,
                width: image.width,
                heightSmall: image.heightSmall,
                widthSmall: image.widthSmall
            }
        });

        await imageQueries.insertImages(imagesDb);
        await updateProject(project, imagesDb);

        res.status(200);
        res.send({
            success: true,
            message: 'Images are uploaded to the project.'
        });
    } catch (error) {
        next(error);
    }
}

async function updateProject(project, images) {
    return new Promise(async (resolve, reject) => {
        try {
            await queries.updateProject({
                image_count: project[0].image_count + images.length
            }, project[0].id);

            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

async function uploadAllImages(req) {
    return new Promise(async (resolve, reject) => {
        try {
            const form = new multiparty.Form({
                maxFields: 1,
                maxFilesSize: 25000000 // 25 mb
            });

            const images = [];

            form.parse(req, async (error, fields, files) => {
                if (error) {
                    reject({ success: false, message: error.message });
                    return;
                }

                if (!files.fileArray) {
                    reject({ success: false, message: 'Files are not structured in an expected way.'});
                }

                await Promise.all(files.fileArray.map(async (file) => {
                    // Check if an image with this sha_256 already exists (in this project)
                    const sha_256 = await hashUtil.createHashFromFile(file.path);

                    const shaResult = await imageQueries.getImageBySHA(sha_256, req.params.id);

                    if (shaResult.length > 0) {
                        reject({ success: false, status: 400, message: 'This image was already uploaded to this project.'});
                    }

                    const response = await prepareImages(file, req.params.id);
                    const imageProperties = await getImageProperties(file.path);

                    response.sha_256 = sha_256;
                    response.width = imageProperties.width;
                    response.height = imageProperties.height;

                    images.push(response);
                }));

                resolve(images);
            });
        } catch (error) {
            reject(error);
        }
    });
}

async function getImageProperties(filePath) {
    return new Promise(async (resolve, reject) => {
        try {
            const image = fs.createReadStream(filePath);

            const properties = await probe(image);

            resolve({ width: properties.width, height: properties.height });
        } catch (error) {
            reject(error);
        }
    });
}

async function prepareImages(fileObject, project_id) {
    return new Promise(async (resolve, reject) => {
        try {
            const filename = randomString({length: 16, characters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'});
            const fileExt = `${filename}${path.extname(fileObject.path).toLowerCase()}`;
            let key = `${project_id}/original/${fileExt}`;

            // Upload original big image
            const data = await uploadImageToS3(fileObject.path, fileExt, key);
            const small = await resizeImage(fileObject.path, fileExt);
            
            key = `${project_id}/small/${fileExt}`;

            data.widthSmall = small.widthSmall;
            data.heightSmall = small.heightSmall;
            data.keySmall = key;

            await uploadImageToS3(`temp/${fileExt}`, fileExt, key);

            // Remove temp image after uploading
            fs.unlink(`temp/${fileExt}`, (error) => {
                if (error) {
                    reject({ success: false, message: 'Removing file did not work.'});
                }

                return;
            });

            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

async function resizeImage(filepath, fileExt) {
    return new Promise(async (resolve, reject) => {
        try {
            const file = await sharp(filepath)
                .resize(null, 700)
                .toFile(`temp/${fileExt}`);

            const data = {
                widthSmall: file.width,
                heightSmall: file.height
            }

            resolve(data);
        } catch (error) {
            reject(error);
        }
    });
}

async function uploadImageToS3(filepath, filename, key) {
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
                    data.filename = filename;

                    resolve(data);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = upload;