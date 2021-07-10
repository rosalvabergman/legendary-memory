"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _https = _interopRequireDefault(require("https"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rdn = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

const captcha = async page => {
  return new Promise(async (resolve, reject) => {
    try {
      await page.waitForFunction(() => {
        const iframe = document.querySelector('iframe[src*="api2/anchor"]');
        if (!iframe) return false;
        return !!iframe.contentWindow.document.querySelector('#recaptcha-anchor');
      });
      let frames = await page.frames();
      const recaptchaFrame = frames.find(frame => frame.url().includes('api2/anchor'));
      const checkbox = await recaptchaFrame.$('#recaptcha-anchor');
      await page.waitForTimeout(2000);
      await checkbox.click({
        delay: rdn(30, 150)
      });
      await page.waitForFunction(() => {
        const iframe = document.querySelector('iframe[src*="api2/bframe"]');
        if (!iframe) return false;
        const img = iframe.contentWindow.document.querySelector('.rc-image-tile-wrapper img');
        return img && img.complete;
      });
      frames = await page.frames();
      const imageFrame = frames.find(frame => frame.url().includes('api2/bframe'));
      const audioButton = await imageFrame.$('#recaptcha-audio-button');
      await page.waitForTimeout(2000);
      await audioButton.click({
        delay: rdn(30, 150)
      });

      while (true) {
        try {
          await page.waitForFunction(() => {
            const iframe = document.querySelector('iframe[src*="api2/bframe"]');
            if (!iframe) return false;
            return !!iframe.contentWindow.document.querySelector('.rc-audiochallenge-tdownload-link');
          }, {
            timeout: 1000
          });
        } catch (error) {
          console.log('download link not found');
          reject('Detected as automated query');
          return null;
        }

        const audioLink = await page.evaluate(() => {
          const iframe = document.querySelector('iframe[src*="api2/bframe"]');
          return iframe.contentWindow.document.querySelector('#audio-source').src;
        });
        const audioBytes = await page.evaluate(audioLink => {
          return (async () => {
            const response = await window.fetch(audioLink);
            const buffer = await response.arrayBuffer();
            return Array.from(new Uint8Array(buffer));
          })();
        }, audioLink);
        const httsAgent = new _https.default.Agent({
          rejectUnauthorized: false
        });
        const response = await (0, _axios.default)({
          httsAgent,
          method: 'post',
          url: 'https://api.wit.ai/speech',
          data: new Uint8Array(audioBytes).buffer,
          headers: {
            Authorization: `Bearer ${process.env.WITAI_KEY}`,
            'Content-Type': 'audio/mpeg3'
          }
        });

        if (undefined == response.data.text) {
          const reloadButton = await imageFrame.$('#recaptcha-reload-button');
          await reloadButton.click({
            delay: rdn(30, 150)
          });
          continue;
        }

        const audioTranscript = response.data.text.trim();
        const input = await imageFrame.$('#audio-response');
        await input.click({
          delay: rdn(30, 150)
        });
        await input.type(audioTranscript, {
          delay: rdn(30, 75)
        });
        await page.waitForTimeout(2000);
        const verifyButton = await imageFrame.$('#recaptcha-verify-button');
        await verifyButton.click({
          delay: rdn(30, 150)
        });

        try {
          await page.waitForFunction(() => {
            const iframe = document.querySelector('iframe[src*="api2/anchor"]');
            if (!iframe) return false;
            return !!iframe.contentWindow.document.querySelector('#recaptcha-anchor[aria-checked="true"]');
          }, {
            timeout: 1000
          }); // return page.evaluate(
          //   () => document.getElementById('g-recaptcha-response').value
          // )

          resolve('DONE');
        } catch (e) {
          console.log('multiple audio');
          continue;
        }
      }
    } catch (e) {
      reject(e);
      return null;
    }
  });
};

var _default = captcha;
exports.default = _default;