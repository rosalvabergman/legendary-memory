"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _puppeteerExtra = _interopRequireDefault(require("puppeteer-extra"));

var _puppeteerExtraPluginStealth = _interopRequireDefault(require("puppeteer-extra-plugin-stealth"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_puppeteerExtra.default.use((0, _puppeteerExtraPluginStealth.default)());

class Travis {
  constructor(page) {
    this.PAGE = page;
    this.AUTH_URL = 'https://api.travis-ci.com/auth/handshake/gitlab?redirect_uri=https://travis-ci.com/signup';
  }

  async signUp() {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('\n[+] Signing up Travis-CI');
        await this.PAGE.goto(this.AUTH_URL);
        await this.PAGE.waitForTimeout(1000);
        console.log('[+] Authorizing Gitlab');
        await this.PAGE.waitForSelector('input[value="Authorize"]', {
          timeout: 5000
        }).catch(async () => await this.PAGE.goto(this.AUTH_URL));
        await this.PAGE.waitForTimeout(1000);
        await this.PAGE.click('input[value="Authorize"]');
        await this.PAGE.waitForNavigation({
          waitUntil: 'networkidle0'
        });
        await this.PAGE.waitForSelector('iframe[name="intercom-modal-frame"]').then(async () => {
          //If welcome modal
          const frameModal = await this.PAGE.$('iframe[name="intercom-modal-frame"]');
          const modal = await frameModal.contentFrame();
          await modal.click('span[aria-label="Close"]');
          await this.PAGE.waitForTimeout(5000);
        }).catch(async () => {
          console.error('IFRAME NOT DETECT. Reloading');
          await this.PAGE.reload();
        }); //If toast message mail confirmation

        await this.PAGE.waitForSelector('.notice-banner--red', {
          timeout: 5000
        }).catch(async () => await this.PAGE.goto('https://travis-ci.com/getting_started', {
          waitUntil: 'networkidle0'
        }));
        await this.PAGE.waitForTimeout(5000);
        const isSuccess = await this.PAGE.evaluate(() => {
          let el = document.querySelector('.notice-banner--red');
          return el ? true : false;
        });

        if (isSuccess) {
          console.log('[+] Activate repositories');

          try {
            await this.PAGE.waitForSelector('a[href="/account/repositories"]:nth-child(3)').catch(async () => {
              await this.PAGE.reload();
              await this.PAGE.waitForSelector('a[href="/account/repositories"]:nth-child(3)');
            });
            await this.PAGE.click('a[href="/account/repositories"]:nth-child(3)');
            await this.PAGE.waitForTimeout(7000);
          } catch (e) {
            console.log('[+] Activated');
          }

          console.log('[+] Switch on');

          try {
            await this.PAGE.waitForSelector('.switch-inner').catch(async () => {
              await this.PAGE.reload();
              await this.PAGE.waitForSelector('.switch-inner');
            });
            await this.PAGE.click('.switch-inner');
            await this.PAGE.waitForTimeout(7000);
          } catch (e) {
            reject(e);
          }

          console.log('[+] Go to settings page');
          await this.PAGE.goto('https://travis-ci.com/account/preferences', {
            waitUntil: 'networkidle0'
          });
          await this.PAGE.waitForTimeout(7000);
          console.log('[+] Getting token');
          const token = await this.PAGE.evaluate('document.querySelector(`button[title="Copy to clipboard"]`).getAttribute("data-clipboard-text")');
          console.log('[+] Done. Please check your mailbox\n');
          resolve({
            session: this.PAGE,
            token
          });
        } else {
          console.error('[+] Failed');
          reject(e);
        } // resolve()

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
        await page.goto(confirmLink, {
          waitUntil: 'networkidle0'
        });
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