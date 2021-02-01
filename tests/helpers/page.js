const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/session-factory');
const userFactory = require('../factories/user-factory');

class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless: true,
            args:['--no-sandbox']
        });
        const page = await browser.newPage();
        const customPage = new CustomPage(page);

        return new Proxy(customPage, {
            get: function(target, property) {
                return customPage[property] || browser[property] || page[property];
            }
        });
    }
    constructor(page) {
        this.page = page;
    }

    async login() {
        const user = await userFactory();
        const {session, sig} = sessionFactory(user);
       //now, set the session and session.sig in browser cookies
       await this.page.setCookie({name:'session', value: session});
       await this.page.setCookie({name: 'session.sig', value: sig});
       await this.page.goto('http://localhost:3000/blogs');
       //add wait for function, as sometimes application renders slowely and
      //control doesn't render
        //so it will not find the control
        await this.page.waitFor('a[href="/auth/logout"]');
    }

    async getContentsOf(selector) {
        return  this.page.$eval(selector, el => el.innerHTML);
    }

    async get(url) {
       return await this.page.evaluate((_url) => {
            return fetch(_url, {
                 method: 'GET',
                 credentials: 'same-origin',
                 headers: {
                   "Content-Type": 'application/json'
                 }                
               }).then(res => res.json());
         }, url);
    }

    async post(url, data) {
        return await this.page.evaluate((_url, _data) => {
            return fetch(_url, {
                 method: 'POST',
                 credentials: 'same-origin',
                 headers: {
                   "Content-Type": 'application/json'
                 },
                 body: JSON.stringify(_data)
               }).then(res => res.json());
         }, url, data);
    }

    async execRequests(actions) {
      return Promise.all(actions.map(({method, url, data}) => {
            return this[method](url, data);
        })
    );       
    }
}
module.exports = CustomPage;