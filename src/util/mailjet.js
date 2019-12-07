const apikey = process.env.MJ_APIKEY;
const secretkey = process.env.MJ_SECRETKEY;

const mailjet = require('node-mailjet').connect(apikey, secretkey);

async function sendConfirmationEmail (url, email, token, username) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!process.env.MJ_SEND_EMAIL || process.env.NODE_ENV === 'test') {
                resolve();
            } else {
                const sendUrl = url + '/auth/confirmation/' + token;
                
                await mailjet
                    .post("send", {
                        url: 'api.mailjet.com',
                        version: 'v3.1'
                    })
                    .request({
                        "Messages": [{
                            "From": {
                                "Email": "info@crowdcapture.org",
                                "Name": "CrowdCapture"
                            },
                            "To": [{
                                "Email": email,
                                "Name": email
                            }],
                            "TemplateID": 1068172,
                            "TemplateLanguage": true,
                            "Subject": "CrowdCapture registration",
                            "Variables": {
                                "confirmation_link": sendUrl,
                                "username": username
                            }
                        }]
                    });

                resolve();
            }
        } catch (error) {
            reject(error);
        }
    });
}

async function sendResetEmail (url, email, token, username) {
    return new Promise(async (resolve, reject) => {
        try {
            if(!process.env.MJ_SEND_EMAIL || process.env.NODE_ENV === 'test') {
                resolve();
            } else {
                const sendUrl = url + '/reset/' + token;
                
                await mailjet
                    .post("send", {
                        url: 'api.mailjet.com',
                        version: 'v3.1'
                    })
                    .request({
                        "Messages": [{
                            "From": {
                                "Email": "info@crowdcapture.org",
                                "Name": "CrowdCapture"
                            },
                            "To": [{
                                "Email": email,
                                "Name": email
                            }],
                            "TemplateID": 1068265,
                            "TemplateLanguage": true,
                            "Subject": "CrowdCapture password reset",
                            "Variables": {
                                "reset_link": sendUrl,
                                "username": username
                            }
                        }]
                    });

                resolve();
            }
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    sendConfirmationEmail,
    sendResetEmail
}