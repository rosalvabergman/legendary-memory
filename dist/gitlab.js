"use strict";

var _path = _interopRequireDefault(require("path"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _chance = _interopRequireDefault(require("chance"));

var _personalization = _interopRequireDefault(require("./libs/personalization"));

var _puppeteer = _interopRequireDefault(require("./services/gitlab/puppeteer"));

var _travis = _interopRequireDefault(require("./services/gitlab/travis"));

var _api = _interopRequireDefault(require("./services/gitlab/api"));

var _api2 = _interopRequireDefault(require("./services/travis/api"));

var _libs = require("./libs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const chance = new _chance.default();

(async () => {
  try {
    const profile = new _personalization.default();
    const firstName = await profile.getFirstname();
    const lastName = await profile.getLastname();
    const name = await profile.getFullname();
    const username = await profile.getUsername();
    const email = await profile.getEmail();
    const password = await profile.getPassword();
    const type = 'jaaxs';
    console.log('[+] Email:', email);
    const gitlab = new _puppeteer.default({
      firstName,
      lastName,
      name,
      username,
      email,
      password,
      type
    });
    const puppeteer = await gitlab.getPuppeteer();
    await gitlab.signUp(puppeteer.currentTab);
    let gitlabConfirmationURL;

    if (process.env.NODE_ENV !== 'development') {
      gitlabConfirmationURL = await (0, _libs.checkMail)({
        type: 'gitlab',
        email,
        name: ''
      });
    } else {
      gitlabConfirmationURL = (0, _libs.askQuestion)('[+] Input your Gitlab confirmation mail');
    }

    await (0, _libs.sleep)(5000);
    await gitlab.confirmMail(gitlabConfirmationURL.link, puppeteer.currentTab);
    const signIn = await gitlab.signIn(puppeteer.browser, puppeteer.currentTab);
    await gitlab.selectRole(signIn.session);
    await gitlab.skipTrial(signIn.session);
    const token = await gitlab.createToken(signIn.session);
    const gitlabAPI = new _api.default({
      email,
      name,
      token
    });
    const randAnimal = (0, _libs.normalizeString)(chance.animal());
    const randInteger = chance.integer({
      min: 1,
      max: 9999
    });
    const label = String(randAnimal + '-' + randInteger);
    await (0, _libs.sleep)(2000);
    console.log('[+] Creating project', label);
    const newProject = await gitlabAPI.createProject({
      projectName: label
    });
    await (0, _libs.sleep)(3000);
    const dockerReplacer = [{
      '{{ bin }}': String((0, _libs.normalizeString)(chance.animal())).replace(/-/g, '_')
    }, {
      '{{ config }}': String((0, _libs.normalizeString)(chance.animal())).replace(/-/g, '_')
    }];
    const travisReplacer = [{
      '{{ 1 }}': String((0, _libs.normalizeString)(chance.animal())).replace(/-/g, '_')
    }, {
      '{{ 2 }}': String((0, _libs.normalizeString)(chance.animal())).replace(/-/g, '_')
    }, {
      '{{ 3 }}': String((0, _libs.normalizeString)(chance.animal())).replace(/-/g, '_')
    }, {
      '{{ 4 }}': String((0, _libs.normalizeString)(chance.animal())).replace(/-/g, '_')
    }, {
      '{{ 5 }}': String((0, _libs.normalizeString)(chance.animal())).replace(/-/g, '_')
    }, {
      '{{ 6 }}': String((0, _libs.normalizeString)(chance.animal())).replace(/-/g, '_')
    }, {
      '{{ 7 }}': String((0, _libs.normalizeString)(chance.animal())).replace(/-/g, '_')
    }, {
      '{{ 8 }}': String((0, _libs.normalizeString)(chance.animal())).replace(/-/g, '_')
    }, {
      '{{ 9 }}': String((0, _libs.normalizeString)(chance.animal())).replace(/-/g, '_')
    }, {
      '{{ 10 }}': String((0, _libs.normalizeString)(chance.animal())).replace(/-/g, '_')
    }, {
      '{{ 11 }}': String((0, _libs.normalizeString)(chance.animal())).replace(/-/g, '_')
    }, {
      '{{ 12 }}': String((0, _libs.normalizeString)(chance.animal())).replace(/-/g, '_')
    }, {
      '{{ 13 }}': String((0, _libs.normalizeString)(chance.animal())).replace(/-/g, '_')
    }, {
      '{{ 14 }}': String((0, _libs.normalizeString)(chance.animal())).replace(/-/g, '_')
    }, {
      '{{ 15 }}': String((0, _libs.normalizeString)(chance.animal())).replace(/-/g, '_')
    }, {
      '{{ 16 }}': String((0, _libs.normalizeString)(chance.animal())).replace(/-/g, '_')
    }, {
      '{{ 17 }}': String((0, _libs.normalizeString)(chance.animal())).replace(/-/g, '_')
    }, {
      '{{ 18 }}': String((0, _libs.normalizeString)(chance.animal())).replace(/-/g, '_')
    }, {
      '{{ 19 }}': String((0, _libs.normalizeString)(chance.animal())).replace(/-/g, '_')
    }, {
      '{{ 20 }}': String((0, _libs.normalizeString)(chance.animal())).replace(/-/g, '_')
    }];
    const dockerTemplate = await _fsExtra.default.readFile(_path.default.join(process.cwd(), '.templates/Dockerfile'));
    const travisTemplate = await _fsExtra.default.readFile(_path.default.join(process.cwd(), `.templates/travis.yml`));
    const travisFile = (0, _libs.replaceAll)(travisReplacer, travisTemplate);
    const dockerFile = (0, _libs.replaceAll)(dockerReplacer, dockerTemplate);
    console.log('[+] Writing Dockerfile');
    await gitlabAPI.createFile({
      projectId: newProject.id,
      filePath: 'Dockerfile',
      content: (0, _libs.base64Encode)(dockerFile),
      message: (0, _libs.normalizeString)(chance.guid())
    });
    await (0, _libs.sleep)(3000);
    console.log('[+] Writing Travis CI');
    await gitlabAPI.createFile({
      projectId: newProject.id,
      filePath: '.travis.yml',
      content: (0, _libs.base64Encode)(travisFile),
      message: (0, _libs.normalizeString)(chance.guid())
    });
    const travis = new _travis.default(signIn.session);
    await travis.signUp().then(async ({
      session,
      token
    }) => {
      let travisConfirmationURL;

      if (process.env.NODE_ENV !== 'development') {
        travisConfirmationURL = await (0, _libs.checkMail)({
          type: 'travis',
          email: '',
          name: String(name).replace(/ /g, '-')
        });
      } else {
        travisConfirmationURL = (0, _libs.askQuestion)('[+] Input your Travis confirmation mail');
      }

      await (0, _libs.sleep)(5000);
      await travis.confirmMail(travisConfirmationURL.link, session);
      const travisApi = new _api2.default({
        token
      });
      await (0, _libs.sleep)(3000);
      const repoId = await travisApi.listRepo();
      await (0, _libs.sleep)(3000);
      await travisApi.buildRepo(repoId);
    });
    await (0, _libs.sleep)(10000);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();