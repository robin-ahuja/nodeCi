Number.prototype._called = {};

const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page  = await Page.build();
    await page.goto('http://localhost:3000');
    
}, 30000);

afterEach(async () => {    
    await page.close();
});

test('header has a correct value', async () => {
    const text = await page.getContentsOf('a.brand-logo');
    console.log(text);
    expect(text).toEqual('Blogster');

});

test('clicking login starts oAuth Flow', async () => {
    await page.click('.right a');

    const url = await page.url();

    expect(url).toMatch(/accounts\.google\.com/);
});

test('when signed in, show logout button', async () => {
   
    await page.login();

   //after successfully login, try to logout
   const text = await page.getContentsOf('a[href="/auth/logout"]');
   expect(text).toEqual('Logout');
});