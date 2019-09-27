// Citation: https://stackoverflow.com/questions/51731016/unexpected-token-export-jest-angular
class MockCookieService {
  constructor() {
    this._cookieReg = {};
  }

  check(name) {
    return !!this._cookieReg[name];
  }

  get(name) {
    return this._cookieReg[name];
  }

  getAll() {
    return this._cookieReg;
  }

  set(
    name,
    value,
    expires,
    path,
    domain,
    secure,
    sameSite
  ) {
    this._cookieReg[name] = name + '=' + value;
  }

  delete(name, path, domain) {
    delete this._cookieReg[name];
  }

  deleteAll(path, domain) {
    this._cookieReg = {};
  }
}

module.exports = {
  CookieService: MockCookieService
};
