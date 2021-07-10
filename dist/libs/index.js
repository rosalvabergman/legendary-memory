"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.execShellCommand = exports.checkMail = exports.closeRl = exports.askQuestion = exports.replaceAll = exports.randomDate = exports.lastLine = exports.writeToCsv = exports.randomItem = exports.normalizeString = exports.base64Encode = exports.base64Decode = exports.sleep = void 0;

var _path = _interopRequireDefault(require("path"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _axios = _interopRequireDefault(require("axios"));

var _readline = _interopRequireDefault(require("readline"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rl = _readline.default.createInterface({
  input: process.stdin,
  output: process.stdout
});

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

exports.sleep = sleep;

const base64Decode = string => {
  const encoded = Buffer.from(string, 'base64');
  return encoded.toString('ascii');
};

exports.base64Decode = base64Decode;

const base64Encode = string => {
  const plain = Buffer.from(string, 'ascii');
  return plain.toString('base64');
};

exports.base64Encode = base64Encode;

const normalizeString = string => {
  return String(string).toLowerCase().replace(/[^A-Za-z0-9 ]/g, '').replace(/[\])}[{(]/g, '').replace(/'/g, '').replace(/ /g, '-');
};

exports.normalizeString = normalizeString;

const randomItem = items => items[Math.floor(Math.random() * items.length)];

exports.randomItem = randomItem;

const writeToCsv = async (file, content) => {
  await _fsExtra.default.appendFile(_path.default.join(process.cwd(), '.logs', `${file}.csv`), content, 'utf-8');
};

exports.writeToCsv = writeToCsv;

const lastLine = async file => {
  const lines = String(await _fsExtra.default.readFile(_path.default.join(process.cwd(), '.logs', `${file}.csv`), 'utf-8')).trim().split('\n');
  return lines[lines.length - 1];
};

exports.lastLine = lastLine;

const randomDate = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())).toISOString().split('T')[0];
};

exports.randomDate = randomDate;

const replaceAll = (obj, sentence) => {
  return obj.reduce((f, s) => String(f).replace(new RegExp(Object.keys(s)[0], 'g'), s[Object.keys(s)[0]]), sentence);
};

exports.replaceAll = replaceAll;

const askQuestion = prompt => {
  return new Promise((resolve, reject) => {
    rl.question(prompt, resolve);
  });
};

exports.askQuestion = askQuestion;

const closeRl = () => {
  return new Promise((resolve, reject) => {
    rl.close();
    resolve();
  });
};

exports.closeRl = closeRl;

const pollRequest = (fn, retries = Infinity, timeoutBetweenAttempts = 5000) => {
  return Promise.resolve().then(fn).catch(function retry(err) {
    if (retries-- > 0) return sleep(timeoutBetweenAttempts).then(fn).catch(retry);
    throw err;
  });
};

const checkMail = async ({
  type,
  email,
  name
}) => {
  try {
    return pollRequest(() => _axios.default.get('https://sendgrid-inbound-parse.vercel.app/api/email', {
      params: {
        type,
        email,
        name
      }
    }, {
      timeout: 10000
    }).then(function validate(res) {
      if (!res.data.data) throw res;
      return JSON.parse(res.data.data);
    }), 60, 5000);
  } catch (e) {
    throw e;
  }
};

exports.checkMail = checkMail;

const execShellCommand = cmd => {
  const exec = require('child_process').exec;

  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }

      resolve(stdout ? stdout : stderr);
    });
  });
};

exports.execShellCommand = execShellCommand;