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
  visualFeedback: true
}));

class Gitlab {
  constructor(args) {
    this.FIRST_NAME = String(args.name).split(' ')[0];
    this.LAST_NAME = String(args.name).split(' ')[1];
    this.NAME = args.name;
    this.USERNAME = args.username;
    this.EMAIL = args.email;
    this.PASSWORD = args.password;
    this.TYPE = args.type;
    this.AUTH_URL = 'https://gitlab.com/-/trial_registrations/new?glm_source=about.gitlab.com&glm_content=free-trial';
  }

  async getPuppeteer() {
    return new Promise(async (resolve, reject) => {
      try {
        const launchOptions = {
          executablePath: process.env.PUPPETEER_EXEC_PATH,
          // executablePath:
          //   '/home/chairulanwar/Documents/projects/chromium-browser/chrome',
          headless: false,
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
        await currentTab.setUserAgent(userAgent.toString()); // await currentTab.setUserAgent(
        //   'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
        // )

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
        await page.waitForSelector('#new_user_first_name'); //First name

        console.log('[+] Inputting first name');
        await page.type('#new_user_first_name', this.FIRST_NAME, {
          delay: 100
        });
        await page.waitForTimeout(1000); //Last name

        console.log('[+] Inputting last name');
        await page.type('#new_user_last_name', this.LAST_NAME, {
          delay: 100
        });
        await page.waitForTimeout(1000); //Username

        console.log('[+] Inputting username');
        await page.type('#new_user_username', this.USERNAME, {
          delay: 100
        });
        await page.waitForTimeout(1000); //Email

        console.log('[+] Inputting email');
        await page.type('#new_user_email', this.EMAIL, {
          delay: 200
        });
        await page.waitForTimeout(1000); //Password

        console.log('[+] Inputting password');
        await page.type('#new_user_password', this.PASSWORD, {
          delay: 200
        });
        await page.waitForTimeout(1000);

        if ((await page.$('.g-recaptcha')) !== null) {
          //Solve captcha
          console.log('[+] Solve the captcha'); // try {
          //   await solveCaptcha(page)
          // } catch (e) {
          //   console.log(e)
          //   console.log('[+] Backup captcha solving')
          //   await page.solveRecaptchas().catch(() => {
          //     throw '[+] Failed to solve captcha'
          //   })
          // }

          await page.solveRecaptchas().catch(() => {
            throw '[+] Failed to solve captcha';
          });
        } //Submit


        console.log('[+] Submitting');
        await Promise.all([page.waitForNavigation({
          timeout: 60000
        }), page.click('input[type="submit"]')]);
        const isSuccess = await page.evaluate(() => {
          let el = document.querySelector('.well-confirmation');
          return el ? true : false;
        });

        if (isSuccess) {
          console.log('[+] Done. Please check your mailbox');
        } else {
          reject('[+] Failed');
        }

        await page.waitForTimeout(1000);
        resolve('DONE');
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
        await page.goto(confirmLink);
        await page.waitForTimeout(8000);
        console.log('[+] Done\n');
        resolve('DONE');
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }

  async signIn(browser, page) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('[+] Signing in');
        await page.goto(this.AUTH_URL);
        await page.waitForSelector('#new_user_first_name'); //Open new tab

        const [target] = await Promise.all([new Promise(resolve => browser.once('targetcreated', resolve)), page.click('a[href="/users/sign_in?redirect_to_referer=yes"]', {
          button: 'middle'
        })]);
        await page.waitForTimeout(1000);
        const signInPage = await target.page();
        await page.waitForTimeout(3000);
        await signInPage.bringToFront();
        await signInPage.waitForSelector('#user_login'); //Email

        console.log('[+] Inputting email');
        await signInPage.type('#user_login', this.EMAIL, {
          delay: 200
        });
        await signInPage.waitForTimeout(1000); //Password

        console.log('[+] Inputting password');
        await signInPage.type('#user_password', this.PASSWORD, {
          delay: 200
        });
        await signInPage.waitForTimeout(1000); //Submit

        console.log('[+] Submitting');
        await signInPage.click('input[type="submit"]');
        await signInPage.waitForNavigation({
          timeout: 5000,
          waitUntil: 'domcontentloaded'
        }).catch(async () => await signInPage.waitForTimeout(3000));
        console.log('[+] Done\n');
        await page.waitForTimeout(1000);
        resolve({
          session: signInPage
        });
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }

  async selectRole(page) {
    return new Promise(async (resolve, reject) => {
      try {
        // Select role
        const isTargetPage = await page.evaluate(() => {
          const el = document.querySelector('#user_role');
          return el ? true : false;
        });

        if (isTargetPage) {
          console.log('[+] Selecting role');
          const listRole = ['software_developer', 'development_team_lead', 'devops_engineer', 'systems_administrator', 'security_analyst', 'data_analyst', 'product_manager', 'product_designer'];
          const role = (0, _libs.randomItem)(listRole);
          await page.select('#user_role', role);
          await page.waitForTimeout(1000); //Setup for company?

          await page.click('#user_setup_for_company_false');
          await page.waitForTimeout(1000); //Submit

          await page.click('button[type="submit"]');
          await page.waitForNavigation().catch();
          console.log('[+] Done\n');
        }

        await page.waitForTimeout(1000);
        resolve('DONE');
      } catch (e) {
        console.error(e);
        resolve();
      }
    });
  }

  async skipTrial(page) {
    return new Promise(async (resolve, reject) => {
      try {
        await page.waitForTimeout(1000); //Skip trial

        const isTargetPage = await page.$x("//a[contains(text(), 'Skip Trial')]");

        if (isTargetPage !== null && isTargetPage !== void 0 && isTargetPage.length) {
          console.log('[+] Skipping trial offer');
          isTargetPage[0].click();
          await page.waitForNavigation();
          console.log('[+] Done\n');
        }

        await page.waitForTimeout(1000);
        resolve('DONE');
      } catch (e) {
        console.error(e);
        resolve();
      }
    });
  }

  async createToken(page) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('[+] Creating token');
        const url = 'https://gitlab.com/-/profile/personal_access_tokens';
        await page.goto(url);
        await page.waitForSelector('#personal_access_token_name');
        console.log('[+] Inputting token label');
        await page.type('#personal_access_token_name', (0, _libs.normalizeString)(chance.animal()), {
          delay: 100
        });
        await page.waitForTimeout(1000);
        console.log('[+] Inputting expiry date');
        const expireAt = (0, _libs.randomDate)(new Date(2021, 8, 1), new Date(2022, 12, 31));
        await page.type('#personal_access_token_expires_at', expireAt, {
          delay: 100
        });
        await page.waitForTimeout(1000);
        await page.click('#personal_access_token_name', {
          clickCount: 5
        });
        console.log('[+] Selecting token permission');
        await page.click('#personal_access_token_scopes_api');
        await page.waitForTimeout(1000);
        await page.click('#personal_access_token_scopes_read_user');
        await page.waitForTimeout(1000);
        await page.click('#personal_access_token_scopes_read_api');
        await page.waitForTimeout(1000);
        await page.click('#personal_access_token_scopes_read_repository');
        await page.waitForTimeout(1000);
        await page.click('#personal_access_token_scopes_write_repository');
        await page.waitForTimeout(1000);
        await page.click('#personal_access_token_scopes_read_registry');
        await page.waitForTimeout(1000);
        await page.click('#personal_access_token_scopes_write_registry');
        await page.waitForTimeout(1000);
        console.log('[+] Creating');
        await Promise.all([page.waitForNavigation(), page.click('input[type="submit"]')]);
        const token = await page.evaluate('document.querySelector("#created-personal-access-token").getAttribute("value")');
        console.log('[+] Done\n');
        await page.waitForTimeout(1000);
        resolve(token);
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }

}

var _default = Gitlab;
exports.default = _default;