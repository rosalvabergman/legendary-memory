"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _puppeteerExtra = _interopRequireDefault(require("puppeteer-extra"));

var _puppeteerExtraPluginStealth = _interopRequireDefault(require("puppeteer-extra-plugin-stealth"));

var _puppeteerAutoscrollDown = _interopRequireDefault(require("puppeteer-autoscroll-down"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_puppeteerExtra.default.use((0, _puppeteerExtraPluginStealth.default)());

class Travis {
  constructor(page) {
    this.PAGE = page;
    this.AUTH_URL = 'https://api.travis-ci.com/auth/handshake/bitbucket?redirect_uri=https://travis-ci.com/signup';
  }

  async signUp() {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('\n[+] Signing up Travis-CI');
        await this.PAGE.goto(this.AUTH_URL);
        await this.PAGE.waitForTimeout(1000);
        await (0, _puppeteerAutoscrollDown.default)(this.PAGE);
        resolve({
          session: this.PAGE
        });
      } catch (e) {
        console.error('[+] Failed'); // reject(e)
      }
    });
  }

  async authorize() {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('[+] Authorizing Bitbucket');
        await this.PAGE.waitForSelector('button[value="approve"]').then(async () => {
          await this.PAGE.click('button[value="approve"]');
          await this.PAGE.waitForNavigation();
        }).catch(() => console.error('[+] Authorize button not exists'));
        resolve('DONE');
      } catch (e) {
        console.error('[+] Failed to authorize'); // reject(e)
      }
    });
  }

  async closeModalMessage() {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('[+] Closing modal message');
        await this.PAGE.waitForSelector('iframe[name="intercom-modal-frame"]').then(async () => {
          //If welcome modal
          const frameModal = await this.PAGE.$('iframe[name="intercom-modal-frame"]');
          const modal = await frameModal.contentFrame();
          await modal.click('span[aria-label="Close"]');
          await this.PAGE.waitForTimeout(5000);
        }).catch(async () => {
          console.error('IFRAME NOT DETECT. Reloading');
          await this.PAGE.reload();
        });
        resolve('DONE');
      } catch (e) {
        console.error('[+] Modal message not found'); // reject(e)
      }
    });
  }

  async isSuccessToastMessage() {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('[+] Is success message?');
        await this.PAGE.waitForSelector('.notice-banner--red', {
          timeout: 15000
        }).catch(async () => await this.PAGE.goto('https://travis-ci.com/getting_started', {
          waitUntil: 'networkidle0'
        }));
        await this.PAGE.waitForTimeout(3000);
        resolve(true);
      } catch (e) {
        console.error('[+] Success message not found');
        resolve(false); // reject(e)
      }
    });
  }

  async activateRepo() {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('[+] Activate repositories');
        await this.PAGE.click('a[href="/account/repositories"]:nth-child(3)').catch(() => console.log('[+] Activated'));
        await this.PAGE.waitForTimeout(7000);
        resolve('DONE');
      } catch (e) {
        console.error('[+] Failed');
        reject(e);
      }
    });
  }

  async switchOn() {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('[+] Switch on');
        await this.PAGE.click('.switch-inner');
        await this.PAGE.waitForTimeout(7000);
        resolve('DONE');
      } catch (e) {
        console.error('[+] Failed');
        reject(e);
      }
    });
  }

  async createToken() {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('[+] Creating token');
        await this.PAGE.goto('https://travis-ci.com/account/preferences');
        await this.PAGE.waitForTimeout(7000);
        const token = await this.PAGE.evaluate('document.querySelector(`button[title="Copy to clipboard"]`).getAttribute("data-clipboard-text")');
        console.log('[+] Done. Please check your mailbox\n');
        resolve(token);
      } catch (e) {
        console.error('[+] Failed');
        reject(e);
      }
    });
  }

  async confirmMail(confirmLink, page) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('[+] Confirming your account');
        await page.goto(confirmLink);
        await page.waitForTimeout(3000);
        console.log('[+] Done\n');
        resolve('DONE');
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }

}

var _default = Travis;
exports.default = _default;