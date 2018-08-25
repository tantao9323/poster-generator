const async = require('async');
const utils = require('./utils');

const main = async (qrBaseUrl, posterBaseUrl, userInfo, locale) => {
    const task1 = cb => {
        utils.createQr(qrBaseUrl, userInfo, (err, data) => {
            if (err) {
                console.error('Create QRCode Error', err);
                cb(err, null);
                return;
            }
            cb(null, data);
        })
    }
    const task2 = (qrImage, cb) => {
        const sourceImg = `./static/img/postertemplate/${locale}.png`;
        utils.addQr(userInfo, sourceImg, qrImage, (err, data) => {
            if (err) {
                console.error('Add QrImage Error', err);
                cb(err, null);
                return;
            }
            cb(null, data);
        })
    }
    const task3 = (waterImage, cb) => {
        utils.addText(posterBaseUrl, userInfo, locale, waterImage, (err, data) => {
            if (err) {
                console.error('Add Text Error', err);
                cb(err, null);
                return;
            }
            cb(null, data);
        })
    }
    const output = await new Promise((resolve, reject) => {
        async.waterfall([task1, task2, task3], (err, result) => {
            if (err) {
                console.error('Create Poster Error', err);
                reject(err);
                return;
            }
            resolve(result);
        })
    })
    return output;
}

const userInfo = {
    id: 'Foo',
    nickName: 'Bar',
    invitationCode: 'Baz'
};
const locale = 'en';
const qrBaseUrl = 'https://www.example.com/invitation';
const posterBaseUrl = 'https://www.example.com';

main(qrBaseUrl, posterBaseUrl, userInfo, locale).then(console.log);