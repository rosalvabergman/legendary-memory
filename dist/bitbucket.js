"use strict";

var _path = _interopRequireDefault(require("path"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _chance = _interopRequireDefault(require("chance"));

var _simpleGit = _interopRequireDefault(require("simple-git"));

var _personalization = _interopRequireDefault(require("./libs/personalization"));

var _puppeteer = _interopRequireDefault(require("./services/bitbucket/puppeteer"));

var _travis = _interopRequireDefault(require("./services/bitbucket/travis"));

var _api = _interopRequireDefault(require("./services/travis/api"));

var _api2 = _interopRequireDefault(require("./services/bitbucket/api"));

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
    const bitbucket = new _puppeteer.default({
      firstName,
      lastName,
      name,
      username,
      email,
      password,
      type
    });
    const puppeteer = await bitbucket.getPuppeteer();
    await bitbucket.signUp(puppeteer.currentTab);
    let bitbucketConfirmationURL;

    if (process.env.NODE_ENV !== 'development') {
      bitbucketConfirmationURL = await (0, _libs.checkMail)({
        type: 'bitbucket',
        email,
        name: ''
      });
    } else {
      bitbucketConfirmationURL = (0, _libs.askQuestion)('[+] Input your Bitbucket confirmation mail');
    }

    await (0, _libs.sleep)(5000);
    await bitbucket.confirmMail(bitbucketConfirmationURL.link, puppeteer.currentTab);
    const token = await bitbucket.createToken(puppeteer.currentTab);
    const randAnimal = (0, _libs.normalizeString)(chance.animal());
    const randInteger = chance.integer({
      min: 1,
      max: 9999
    });
    const label = String(randAnimal + '-' + randInteger);
    const projectId = String(`a${(0, _libs.normalizeString)(chance.animal())}`).replace(/-/g, '_');
    const bitbucketAPI = new _api2.default({
      username: username,
      password: token,
      projectId,
      projectName: (0, _libs.normalizeString)(chance.animal()),
      projectDescription: (0, _libs.normalizeString)(chance.guid()),
      repoName: label,
      token
    });
    console.log('[+] Creating project', projectId);
    await bitbucketAPI.createProject();
    await (0, _libs.sleep)(3000);
    console.log('[+] Creating repo', label);
    await bitbucketAPI.createRepository();
    await (0, _libs.sleep)(3000); // const dockerReplacer = [
    //   {
    //     '{{ bin }}': String(normalizeString(chance.animal())).replace(/-/g, '_')
    //   },
    //   {
    //     '{{ config }}': String(normalizeString(chance.animal())).replace(
    //       /-/g,
    //       '_'
    //     )
    //   }
    // ]

    const imageLabel = String((0, _libs.normalizeString)(chance.animal())).replace(/-/g, '_');
    const imageTag = (0, _libs.randomItem)(['1.0', '2.0', '3.0', 'prod', 'latest', 'test', 'new']);
    const imageName = `${imageLabel}:${imageTag}`;
    const travisReplacer = [{
      '{{ IMAGE_LABEL }}': imageLabel
    }, {
      '{{ IMAGE_NAME }}': imageName
    }, {
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
    }]; // const dockerTemplate = await fs.readFile(
    //   path.join(process.cwd(), '.templates/Dockerfile')
    // )

    const travisTemplate = await _fsExtra.default.readFile(_path.default.join(process.cwd(), `.templates/travis.yml`));
    const travisFile = (0, _libs.replaceAll)(travisReplacer, travisTemplate); // const dockerFile = replaceAll(dockerReplacer, dockerTemplate)

    await _fsExtra.default.writeFile(_path.default.join(process.cwd(), '.templates/git/.travis.yml'), travisFile); //Create docker image

    await (0, _libs.execShellCommand)('docker load -i .templates/image.tar');
    await (0, _libs.execShellCommand)(`docker tag tundra:test ${imageName}`);
    await (0, _libs.execShellCommand)(`docker save -o .templates/git/${imageLabel}.tar ${imageName}`); // await bitbucketAPI.createFile({
    //   message: normalizeString(chance.guid()),
    //   // dockerfile: dockerFile,
    //   travis: travisFile
    // })
    // await sleep(3000)

    const travis = new _travis.default(puppeteer.currentTab);
    await travis.signUp().then(async ({
      session
    }) => {
      await travis.authorize();
      await travis.closeModalMessage();
      const isSuccess = await travis.isSuccessToastMessage();

      if (isSuccess) {
        await travis.activateRepo();
        await travis.switchOn(); // const token = await travis.createToken()

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
        await (0, _libs.sleep)(5000); // const travisApi = new TravisApi({ token })
        // await sleep(3000)
        // const repoId = await travisApi.listRepo()
        // await sleep(3000)
        // await travisApi.buildRepo(repoId)

        console.log('[+] Push required files');

        try {
          // const branch = randomItem([
          //   'main',
          //   'master',
          //   'prod',
          //   'test',
          //   'deploy'
          // ])
          const git = (0, _simpleGit.default)(_path.default.join(process.cwd(), '.templates/git'), {
            binary: 'git'
          });
          await git.init();
          await git.addConfig('user.email', chance.email());
          await git.addConfig('user.name', name);
          await git.addRemote('origin', `https://${username}:Bismillah135!@bitbucket.org/${username}/${label}.git`); // await git.branch(['-M', branch])

          await git.add('.');
          await git.commit((0, _libs.normalizeString)(chance.guid()));
          await git.push('origin', 'master');
          console.log('[+] Done');
        } catch (e) {
          console.error(e);
          throw '[+] Git push failed';
        }
      } else {
        console.error('[+] Failed to signup TravisCI');
      }
    });
    await (0, _libs.sleep)(10000);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();