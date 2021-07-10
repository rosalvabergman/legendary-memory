"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _puppeteerExtra = _interopRequireDefault(require("puppeteer-extra"));

var _puppeteerExtraPluginStealth = _interopRequireDefault(require("puppeteer-extra-plugin-stealth"));

var _puppeteerExtraPluginRecaptcha = _interopRequireDefault(require("puppeteer-extra-plugin-recaptcha"));

var _captcha = _interopRequireDefault(require("./captcha"));

var _userAgents = _interopRequireDefault(require("user-agents"));

var _chance = _interopRequireDefault(require("chance"));

var _libs = require("../../libs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const chance = new _chance.default();
const userAgent = new _userAgents.default();

_puppeteerExtra.default.use((0, _puppeteerExtraPluginStealth.default)()).use((0, _puppeteerExtraPluginRecaptcha.default)({
  provider: {
    id: '2captcha',
    token: process.env.CAPTCHA_KEY
  },
  visualFeedback: true,
  opts: {
    useEnterpriseFlag: true,
    useActionValue: true
  }
}));

class Bitbucket {
  constructor(args) {
    this.NAME = args.name;
    this.USERNAME = args.username;
    this.EMAIL = args.email;
    this.PASSWORD = args.password;
    this.TYPE = args.type;
    this.AUTH_URL = 'https://id.atlassian.com/signup?application=bitbucket&continue=https%3A//bitbucket.org/account/signin/%3Foptintocst%3D1%26next%3D/%3Faidsignup%3D1';
  }

  async getPuppeteer() {
    return new Promise(async (resolve, reject) => {
      try {
        const launchOptions = {
          executablePath: process.env.PUPPETEER_EXEC_PATH,
          // executablePath:
          //   '/home/chairulanwar/Documents/projects/chromium-browser/chrome',
          headless: true,
          args: ['--disable-web-security', '--no-sandbox', '--disable-setuid-sandbox', '--start-maximized', '--disable-features=IsolateOrigins,site-per-process']
        };
        const browser = await _puppeteerExtra.default.launch(launchOptions);
        const pages = await browser.pages();

        if (pages.length > 1) {
          await pages[0].close();
        }

        const currentTab = await browser.newPage();
        await currentTab.setViewport({
          width: userAgent.data.viewportWidth,
          height: userAgent.data.viewportHeight
        });
        await currentTab.setUserAgent(userAgent.toString());
        resolve({
          browser,
          currentTab
        });
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }

  async signUp(page) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('[+] Signing up');
        await page.goto(this.AUTH_URL);
        await page.waitForSelector('#email');
        const recaptchaFailed = await page.$x('//*[@id="form-sign-up"]/div[4]/div/div/div/noscript', {
          timeout: 1000
        });

        if (recaptchaFailed !== null && recaptchaFailed !== void 0 && recaptchaFailed.length) {
          throw 'User-Agent not supported';
        } //Email


        console.log('[+] Inputting email');
        await page.type('#email', this.EMAIL, {
          delay: 200
        });
        await page.waitForTimeout(1000); //Name

        console.log('[+] Inputting name');
        await page.type('#displayName', this.NAME, {
          delay: 100
        });
        await page.waitForTimeout(1000);
        const hiddenField = (await page.$$('div.hidden')).length;

        if (hiddenField == 1) {
          console.log('[+] Inputting password');
          await page.type('#password', this.PASSWORD, {
            delay: 200
          }).catch(() => console.log('Password field not required'));
          await page.waitForTimeout(1000);
        } //Submit


        console.log('[+] Submitting');
        await page.waitForSelector('#signup-submit');
        await page.click('button[id="signup-submit"]');
        console.log('[+] Solve the captcha'); // if (Boolean(process.env.CREDITS) === true) {
        //   const { captchas, filtered, solutions, solved, error } =
        //     await page.solveRecaptchas()
        //   if (error) {
        //     console.error('[+] Captcha error', error)
        //     throw error
        //   }
        // } else {
        //   await solveCaptcha(page).catch(e => {
        //     console.error(e)
        //     throw e
        //   })
        // }

        await (0, _captcha.default)(page).catch(e => {
          console.error(e);
          throw e;
        });
        await page.waitForXPath(`${"//h5[contains(text(), 'Check your inbox to finish signup')]"} |
            ${"//h5[contains(text(), 'Check your inbox to log in')]"}`, {
          timeout: 10000
        });
        const welcomeMessage = await page.$x("//h5[contains(text(), 'Check your inbox to finish signup')]");
        const welcomeMessage2 = await page.$x("//h5[contains(text(), 'Check your inbox to log in')]");

        if (welcomeMessage !== null && welcomeMessage !== void 0 && welcomeMessage.length || welcomeMessage2 !== null && welcomeMessage2 !== void 0 && welcomeMessage2.length) {
          console.log('[+] Done. Please check your mailbox');
          resolve('DONE');
        } else {
          console.log('[+] Failed');
        }
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }

  async confirmMail(confirmLink, page) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('[+] Confirming your account');
        await page.goto(confirmLink, {
          waitUntil: 'networkidle0'
        });
        await page.waitForTimeout(7000);

        try {
          const passwordFieldExists = await page.evaluate(() => {
            const el = document.querySelector('#password');
            return el ? true : false;
          });

          if (passwordFieldExists) {
            console.log('[+] Inputting password');
            await page.type('#password', this.PASSWORD, {
              delay: 200
            });
            await page.waitForTimeout(1000);
            await page.click('button[id="signup-submit"]');
            console.log('[+] Solve the captcha'); // if (Boolean(process.env.CREDITS) === true) {
            //   const { captchas, filtered, solutions, solved, error } =
            //     await page.solveRecaptchas()
            //   if (error) {
            //     console.error('[+] Captcha error', error)
            //     throw error
            //   }
            // } else {
            //   await solveCaptcha(page).catch(e => {
            //     console.error(e)
            //     throw e
            //   })
            // }

            await (0, _captcha.default)(page).catch(e => {
              console.error(e);
              throw e;
            });
            await page.waitForSelector('input[name="username"]', {
              timeout: 60000
            });
          }
        } catch (e) {} //Username


        console.log('[+] Inputting username');
        await page.waitForSelector('#js-username-field', {
          timeout: 60000
        });
        await page.type('#js-username-field', this.USERNAME, {
          delay: 100
        });
        await page.waitForTimeout(3000);
        await page.waitForSelector('button[id="js-continue-cta-link"', {
          timeout: 0
        });
        await page.click('button[id="js-continue-cta-link"]');
        await page.waitForNavigation();
        console.log('[+] Done\n');
        resolve('DONE');
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }

  async createToken(page) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('[+] Creating token');
        const url = 'https://bitbucket.org/account/settings/app-passwords/new';
        await page.goto(url);
        await page.waitForSelector('#id_name');
        console.log('[+] Inputting token label');
        await page.type('#id_name', (0, _libs.normalizeString)(chance.animal()), {
          delay: 100
        });
        await page.waitForTimeout(1000);
        console.log('[+] Selecting token permission');
        await page.click('#scope-email');
        await page.waitForTimeout(1000);
        await page.click('#scope-account');
        await page.waitForTimeout(1000);
        await page.click('#scope-account-write');
        await page.waitForTimeout(1000);
        await page.click('#scope-project');
        await page.waitForTimeout(1000);
        await page.click('#scope-project-write');
        await page.waitForTimeout(1000);
        await page.click('#scope-repository');
        await page.waitForTimeout(1000);
        await page.click('#scope-repository-write');
        await page.waitForTimeout(1000);
        await page.click('#scope-repository-admin');
        await page.waitForTimeout(1000);
        await page.click('#scope-repository-delete');
        await page.waitForTimeout(1000);
        console.log('[+] Creating');
        await Promise.all([page.waitForNavigation(), page.click('button[type="submit"]')]);
        const appPassword = await page.evaluate('document.querySelector("#app-passwords").getAttribute("data-app-password")').then(value => JSON.parse(value));
        const token = appPassword.password;
        console.log('[+] Done\n');
        resolve(token);
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }

}

var _default = Bitbucket;
exports.default = _default;