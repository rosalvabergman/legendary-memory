"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Travis {
  constructor(args) {
    this.TOKEN = args.token;
  }

  async listRepo() {
    return new Promise(async (resolve, reject) => {
      try {
        var _result$;

        console.log('[+] Getting repository ID');
        const url = `https://api.travis-ci.com/repos`;
        const result = await _axios.default.get(url, {
          headers: {
            'Travis-API-Version': '3',
            Authorization: `token ${this.TOKEN}`,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36'
          }
        }).then(d => {
          var _d$data;

          return d === null || d === void 0 ? void 0 : (_d$data = d.data) === null || _d$data === void 0 ? void 0 : _d$data.repositories;
        });
        resolve(result === null || result === void 0 ? void 0 : (_result$ = result[0]) === null || _result$ === void 0 ? void 0 : _result$.id);
      } catch (e) {
        reject(e);
      }
    });
  }

  async buildRepo(repoId) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('[+] Trigger travis Build');
        const url = ` https://api.travis-ci.com/repo/${repoId}/requests`;
        const result = await _axios.default.post(url, '', {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Travis-API-Version': '3',
            Authorization: `token ${this.TOKEN}`,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36'
          }
        }).then(d => d.data);
        console.log('[+] Done');
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  }

}

var _default = Travis;
exports.default = _default;