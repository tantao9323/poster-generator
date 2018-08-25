const fs = require('fs'); // 读写文件操作
const mkdirp = require('mkdirp'); // 递归创建文件夹
const qr = require('qr-image');
const sharp = require('sharp');
const jimp = require('jimp');
const utils = {};

utils.createQr = (baseUrl, userInfo, cb) => {
    // 邀请链接
    const invitationUrl = `${baseUrl}/${userInfo.invitationCode}`;
    // 生成二维码图片
    const qrPng = qr.image(invitationUrl, {
        type: 'png', // 图片类型
        size: 5, // 图片尺寸
        margin: 2 // 图片边距
    });
    // 生成的二维码图片保存的路径
    const savePath = `./static/img/qrcode/${userInfo.id}`;
    // 如果没有目录先创建目录
    if (!fs.existsSync(savePath)) {
        mkdirp.sync(savePath, err => {
            if (err) {
                console.error(err);
                cb(err, null);
                return;
            }
        });
    }
    // 保存二维码图片的完整路径
    const imgName = `./static/img/qrcode/${userInfo.id}/${userInfo.invitationCode}.png`;
    // 保存二维码图片
    const qrPipe = qrPng.pipe(fs.createWriteStream(imgName));
    qrPipe.on('error', err => {
        console.error(err);
        cb(err, null);
        return;
    })
    qrPipe.on('finish', () => {
        cb(null, imgName);
    })
};

utils.addQr = async (userInfo, sourceImg, qrImg, cb) => {
    // 合成的海报的保存路径
    const savePath = `./static/img/water/${userInfo.id}`;
    // 如果没有目录先创建目录
    if (!fs.existsSync(savePath)) {
        mkdirp.sync(savePath, err => {
            if (err) {
                console.error(err);
                cb(err, null);
                return;
            }
        });
    }
    // 保存合成海报的完整路径
    const imgName = `./static/img/water/${userInfo.id}/${userInfo.invitationCode}.png`;
    // 合成并保存海报
    await sharp(sourceImg) // sourceImg：海报模板的完整路径
        .resize(375, 667) // 海报的width和height，单位为px
        .overlayWith(qrImg, { // qrImg：二维码图片的完整路径
            left: 106, // 二维码图片放置的位置，单位为px
            top: 418 // 二维码图片放置的位置，单位为px
        })
        .toFile(imgName);
    cb(null, imgName);
};

utils.addText = (baseUrl, userInfo, locale, waterImg, cb) => {
    const text1 = userInfo.nickName; // 用户昵称
    const text2 = userInfo.invitationCode; // 用户邀请码
    const savePath = `./static/img/poster/${locale}/${userInfo.id}`; // 最终合成海报的保存路径
    // 如果没有目录先创建目录
    if (!fs.existsSync(savePath)) {
        mkdirp.sync(savePath, err => {
            if (err) {
                console.error(err);
                cb(err, null);
                return;
            }
        });
    }
    // 保存最终合成海报的完整路径
    const imgName = `./static/img/poster/${locale}/${userInfo.id}/${userInfo.invitationCode}.png`;
    // 返回最终合成海报的完整路径
    const output = `${baseUrl}/static/img/poster/${locale}/${userInfo.id}/${userInfo.invitationCode}.png`;
    jimp.read(waterImg) // waterImg：添加二维码后的海报的完整路径
        .then(image => {
            const loadedImage = image; // loadedImage：加载的图片实例
            // 载入字体
            jimp.loadFont(jimp.FONT_SANS_32_BLACK).then(font => {
                // 根据载入的字体把文字添加到图片的指定位置，单位为px
                loadedImage.print(font, 130, 220, text1);
                jimp.loadFont(jimp.FONT_SANS_32_BLACK).then(font => {
                    loadedImage.print(font, 185, 326, text2).write(imgName, () => {
                        cb(null, output);
                    });
                });
            });
        })
        .catch(err => {
            console.error(err);
            cb(err, null);
        });
};

module.exports = utils;