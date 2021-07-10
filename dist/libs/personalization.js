"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _chance = _interopRequireDefault(require("chance"));

var _index = require("./index");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const chance = new _chance.default();

class Personalization {
  async getFirstname() {
    return new Promise(async (resolve, reject) => {
      try {
        resolve((0, _index.normalizeString)(chance.first()));
      } catch (e) {
        reject(e);
      }
    });
  }

  async getLastname() {
    return new Promise(async (resolve, reject) => {
      try {
        resolve((0, _index.normalizeString)(chance.last()));
      } catch (e) {
        reject(e);
      }
    });
  }

  async getFullname() {
    return new Promise(async (resolve, reject) => {
      try {
        resolve((await this.getFirstname()) + ' ' + (await this.getLastname()));
      } catch (e) {
        reject(e);
      }
    });
  }

  async getUsername() {
    return new Promise(async (resolve, reject) => {
      try {
        resolve((0, _index.normalizeString)((await this.getFirstname()) + (await this.getLastname()) + chance.integer({
          min: 111,
          max: 999
        })));
      } catch (e) {
        reject(e);
      }
    });
  }

  async getEmail() {
    return new Promise(async (resolve, reject) => {
      try {
        const domain = process.env.DOMAIN.split(',');
        resolve(String((0, _index.normalizeString)(chance.animal() + chance.integer({
          min: 111,
          max: 999
        })) + `@${(0, _index.randomItem)(domain)}`));
      } catch (e) {
        reject(e);
      }
    });
  }

  async getPassword() {
    return new Promise(async (resolve, reject) => {
      try {
        resolve('Bismillah135!');
      } catch (e) {
        reject(e);
      }
    });
  }

}

var _default = Personalization;
exports.default = _default;