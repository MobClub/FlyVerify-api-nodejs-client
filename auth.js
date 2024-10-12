let host = "identify-auth.zztfly.com";
let url = "/auth/auth/sdkClientFreeLogin";

let appkey = "";
let appSecret = "";
let token = "59616292321333248";
let opToken = "opToken";
let operator = "CUCC";
let md5 = "";

/**
 1.安装模块
 npm install md5-node --save
 2.引入模块
 var md5=require('md5-node');
 3.使用
 md5('123456');
 */
var md5Util = require('md5-node');
let http = require("http");
let _crypto = require('crypto');

function generateSign(request, secret) {
    let keys = Object.keys(request).sort();
    let ret = '';
    keys.forEach(value => ret += `${value}=${request[value]}&`);
    ret = ret.substr(0, ret.length - 1) + secret;
    return md5Util(ret);
}
var cipheriv = function (en, code, data) {
    var buf1 = en.update(data, code), buf2 = en.final();
    var r = new Buffer(buf1.length + buf2.length);
    buf1.copy(r); buf2.copy(r, buf1.length);
    return r;
};
/**
 * @return {string}
 */
var  EncryptDES = function (data, key, vi) {
    return data = cipheriv(_crypto.createCipheriv('des', key, vi), 'utf8', data).toString('base64');
};
/**
 * @return {string}
 */
var DecryptDES = function (data, key, vi) {
    return cipheriv(_crypto.createDecipheriv('des', key, vi), 'base64', data) .toString('utf8');
};

let data = {
    'appkey': appkey,
    'token': token,
    'opToken': opToken,
    'operator': operator,
    'timestamp': new Date().getTime()
};
data['sign'] = generateSign(data, appSecret);
data = JSON.stringify(data);

var opt = {
    host: host,
    port:'80',
    method:'POST',
    path: url,
    headers:{
        "Content-Type": 'application/json',
        "Content-Length": data.length
    }
};

var body = '';
var req = http.request(opt, function(res) {
    console.log("response: " + res.statusCode);
    res.on('data',function(data){
        body += data;
    }).on('end', function(){
        let parse = JSON.parse(body);
        if (parse.status == 200) {
            parse.res = DecryptDES(parse.res, appSecret.substr(0, 8), '00000000');
        }
        console.log(parse);
    });
}).on('error', function(e) {
    console.log("error: " + e.message);
})
req.write(data);
req.end();
