const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

//Custom page

class Page {
  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    const customPage = new Page(page);

    return new Proxy(customPage, {
      get: function (target, property) {
        return target[property] || browser[property] || page[property];
      },
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    await this.page.setCookie({ name: 'session', value: session });
    await this.page.setCookie({ name: 'session.sig', value: sig });
    await this.page.goto('http://localhost:3000/blogs');
    await this.page.waitFor('a[href="/auth/logout"]');
  }

  async getContentOf(selector) {
    return this.page.$eval(selector, (el) => el.innerHTML);
  }

  get(route) {
    return this.page.evaluate(
      (route) =>
        fetch(route, {
          method: 'GET',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((res) => res.json())
          .catch((error) => error),
      route,
    );
  }

  post(route, data) {
    return this.page.evaluate(
      (route, data) =>
        fetch(route, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
          .then((res) => res.json())
          .catch((error) => error),
      route,
      data,
    );
  }

  execRequests(actions) {
    return Promise.all(
      actions.map(({ method, path, data }) => this[method](path, data)),
    );
  }
}

module.exports = Page;
