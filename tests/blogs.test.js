const Page = require('./helpers/page');
let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('While logged in', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('.fixed-action-btn a');
  });

  test('Can see blog create form', async () => {
    const label = await page.getContentOf('form label');
    expect(label).toEqual('Blog Title');
  });

  describe('Valid Inputs', async () => {
    beforeEach(async () => {
      await page.type('.title input', 'My Title');
      await page.type('.content input', 'My Content');
      await page.click('form button');
    });

    test('Submitting takes user to review screen', async () => {
      const text = await page.getContentOf('form h5');
      expect(text).toEqual('Please confirm your entries');
    });

    test('Submitting and then saving adds blog to user page', async () => {
      await page.click('button.green');
      await page.waitFor('.card');

      const title = await page.getContentOf('.card-title');
      const content = await page.getContentOf('p');

      expect(title).toEqual('My Title');
      expect(content).toEqual('My Content');
    });
  });

  describe('Invalid Input', async () => {
    beforeEach(async () => {
      await page.click('form button');
    });
    test('Form shows error message', async () => {
      const titleError = await page.getContentOf('.title .red-text');
      const contentError = await page.getContentOf('.content .red-text');
      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  });
});

describe('When user is not logged in', async () => {
  const actions = [
    {
      method: 'get',
      path: '/api/blogs',
    },
    {
      method: 'post',
      path: '/api/blogs',
      data: { title: 'T', content: 'C' },
    },
  ];

  test('Blogs related actions are prohibited', async () => {
    const results = await page.execRequests(actions);
    results.map((result) =>
      expect(result).toEqual({ error: 'You must log in!' }),
    );
  });
});
