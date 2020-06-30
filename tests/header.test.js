const Page = require('./helpers/page');
let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

test('Header has the correct text', async () => {
  const text = await page.$eval('a.brand-logo', (el) => el.innerHTML);
  expect(text).toEqual('Blogster');
});

test('Click on Login - OAuth flow', async () => {
  await page.click('.right a');
  const url = await page.url();
  setTimeout(() => {
    expect(url).toMatch(/accounts\.google\.com/);
  }, 1000);
});

test('When signed in, show logout', async () => {
  await page.login();
  const text = await page.getContentOf('a[href="/auth/logout"]');
  expect(text).toEqual('Logout');
});
