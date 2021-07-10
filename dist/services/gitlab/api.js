"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _chance = _interopRequireDefault(require("chance"));

var _libs = require("../../libs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const chance = new _chance.default();

class Gitlab {
  constructor(args) {
    this.EMAIL = args.email;
    this.NAME = args.name;
    this.TOKEN = args.token;
  }

  async listProject() {
    return new Promise(async (resolve, reject) => {
      try {
        const url = `https://gitlab.com/api/v4/projects?owned=true`;
        const result = await _axios.default.get(url, {
          headers: {
            'PRIVATE-TOKEN': this.TOKEN,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36'
          }
        }).then(d => d.data);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  }

  async createProject(args) {
    return new Promise(async (resolve, reject) => {
      try {
        const url = `https://gitlab.com/api/v4/projects`;
        const result = await _axios.default.post(url, {
          name: args.projectName,
          visibility: 'private',
          allow_merge_on_skipped_pipeline: true,
          analytics_access_level: 'disabled',
          autoclose_referenced_issues: true,
          builds_access_level: 'disabled',
          forking_access_level: 'disabled',
          initialize_with_readme: true,
          issues_access_level: 'disabled',
          merge_requests_access_level: 'disabled',
          operations_access_level: 'private',
          only_allow_merge_if_pipeline_succeeds: true,
          packages_enabled: false,
          pages_access_level: 'disabled',
          requirements_access_level: 'disabled',
          public_builds: false,
          auto_cancel_pending_pipelines: 'enabled',
          // repository_access_level: 'private',
          request_access_enabled: false,
          wiki_access_level: 'disabled',
          // ci_config_path: args.ciPath,
          // namespace_id: args.groupId,
          import_url: (0, _libs.randomItem)(['https://gitlab.com/shank-utils/go-hn.git', 'https://gitlab.com/shank-utils/gitlab-cli.git', 'https://gitlab.com/erbesharat/go-cli-chat.git', 'https://gitlab.com/sh1nu11b1/jscrush.git', 'https://gitlab.com/josephmisiti/go-hn.git', 'https://gitlab.com/furushchev/gcli.git', 'https://gitlab.com/the-code-innovator/go-blockchain.git', 'https://gitlab.com/caffeinewriter/go-hn.git', 'https://gitlab.com/satran/twty.git', 'https://gitlab.com/caffeinewriter/go-hn.git', 'https://gitlab.com/vnktsh1/go-hn.git'])
        }, {
          headers: {
            'PRIVATE-TOKEN': this.TOKEN,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36'
          }
        }).then(d => d.data);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  }

  async deleteProject(args) {
    return new Promise(async (resolve, reject) => {
      try {
        const url = `https://gitlab.com/api/v4/projects/${args.projectId}`;
        await _axios.default.delete(url, {
          headers: {
            'PRIVATE-TOKEN': this.TOKEN,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36'
          }
        });
        resolve('Done');
      } catch (e) {
        reject(e);
      }
    });
  }

  async createFile(args) {
    return new Promise(async (resolve, reject) => {
      try {
        const url = `https://gitlab.com/api/v4/projects/${args.projectId}/repository/files/${encodeURI(args.filePath)}`;
        const result = await _axios.default.post(url, {
          branch: 'master',
          author_email: this.EMAIL,
          author_name: this.NAME,
          content: args.content,
          commit_message: args.message,
          encoding: 'base64'
        }, {
          headers: {
            'PRIVATE-TOKEN': this.TOKEN,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36'
          }
        }).then(d => d.data);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  }

  async updateFile(args) {
    return new Promise(async (resolve, reject) => {
      try {
        const url = `https://gitlab.com/api/v4/projects/${args.projectId}/repository/files/${encodeURI(args.filePath)}`;
        const result = await _axios.default.put(url, {
          branch: 'master',
          author_email: this.EMAIL,
          author_name: this.NAME,
          content: args.content,
          commit_message: args.message,
          encoding: 'base64'
        }, {
          headers: {
            'PRIVATE-TOKEN': this.TOKEN,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36'
          }
        }).then(d => d.data);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  }

  async createVariable(args) {
    return new Promise(async (resolve, reject) => {
      try {
        const url = `https://gitlab.com/api/v4/projects/${args.projectId}/variables`;
        await _axios.default.post(url, {
          id: args.projectId,
          key: String(args.key),
          value: String(args.value),
          masked: true
        }, {
          headers: {
            'PRIVATE-TOKEN': this.TOKEN,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36'
          }
        }).then(d => d.data);
        resolve('DONE');
      } catch (e) {
        reject(e);
      }
    });
  }

  async createSchedule(args) {
    return new Promise(async (resolve, reject) => {
      try {
        const url = `https://gitlab.com/api/v4/projects/${args.projectId}/pipeline_schedules`;
        const result = await _axios.default.post(url, {
          id: args.projectId,
          description: (0, _libs.normalizeString)(chance.animal()),
          ref: 'master',
          cron: `*/${args.startIn} * * * *`,
          cron_timezone: 'UTC',
          active: true
        }, {
          headers: {
            'PRIVATE-TOKEN': this.TOKEN,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36'
          }
        }).then(d => d.data);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  }

  async playSchedule(args) {
    return new Promise(async (resolve, reject) => {
      try {
        const url = `https://gitlab.com/api/v4/projects/${args.projectId}/pipeline_schedules/${args.scheduleId}/play`;
        const result = await _axios.default.post(url, '', {
          headers: {
            'PRIVATE-TOKEN': this.TOKEN,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36'
          }
        }).then(d => d.data);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  }

}

var _default = Gitlab;
exports.default = _default;