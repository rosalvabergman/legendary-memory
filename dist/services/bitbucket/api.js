"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _formData = _interopRequireDefault(require("form-data"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class BitbucketAPI {
  constructor(args) {
    this.USERNAME = args.username;
    this.PASSWORD = args.password;
    this.PROJECT_ID = args.projectId;
    this.PROJECT_NAME = args.projectName;
    this.PROJECT_DESCRIPTION = args.projectDescription;
    this.REPO_NAME = args.repoName;
    this.TOKEN = args.token;
  }

  async createProject() {
    return new Promise(async (resolve, reject) => {
      try {
        const url = `https://api.bitbucket.org/2.0/workspaces/${this.USERNAME}/projects`;
        const result = await _axios.default.post(url, {
          name: this.PROJECT_NAME,
          key: this.PROJECT_ID,
          description: this.PROJECT_DESCRIPTION,
          links: {
            avatar: {
              href: 'http://i.imgur.com/72tRx4w.gif'
            }
          },
          is_private: true
        }, {
          auth: {
            username: this.USERNAME,
            password: this.PASSWORD
          },
          headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
          }
        }).then(d => d.data);
        resolve(result);
      } catch (e) {
        console.error(e.response.data.error);
        reject(e);
      }
    });
  }

  async createRepository(args) {
    return new Promise(async (resolve, reject) => {
      try {
        const url = `https://api.bitbucket.org/2.0/repositories/${this.USERNAME}/${this.REPO_NAME}`;
        const result = await _axios.default.post(url, {
          scm: 'git',
          project: {
            key: this.PROJECT_ID
          },
          is_private: true
        }, {
          auth: {
            username: this.USERNAME,
            password: this.PASSWORD
          },
          headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
          }
        }).then(d => d.data);
        resolve(result);
      } catch (e) {
        console.error(e.response.data.error);
        reject(e);
      }
    });
  }

  async createFile(args) {
    return new Promise(async (resolve, reject) => {
      try {
        let formData = new _formData.default();
        formData.append('message', args.message);
        formData.append('author', 'John Doe <john.doe@example.com>');
        formData.append('branch', 'main'); // formData.append('Dockerfile', args.dockerfile)

        formData.append('.travis.yml', args.travis);
        const url = `https://api.bitbucket.org/2.0/repositories/${this.USERNAME}/${this.REPO_NAME}/src`;
        const result = await _axios.default.post(url, formData, {
          auth: {
            username: this.USERNAME,
            password: this.PASSWORD
          },
          headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
            ...formData.getHeaders()
          }
        }).then(d => d.data);
        resolve(result);
      } catch (e) {
        console.error(e.response.data.error);
        reject(e);
      }
    });
  }

}

var _default = BitbucketAPI;
exports.default = _default;