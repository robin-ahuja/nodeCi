Number.prototype._called = {};
const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
}, 300000);

afterEach(async () => {
    await page.close();
});

describe('when logged in', async () => {
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    })

    test('can see glog create form', async() => {
        const label = await page.getContentsOf('form label');

        expect(label).toEqual('Blog Title');
    });

    //nested describe for valid inputs
    describe('And using valid inputs', async () => {

        beforeEach(async () => {
            await page.type('.title input', 'my title');
            await page.type('.content input', 'my content');
            await page.click('form button');
        });

        test('Submitting takes user to review screen', async () => {
            const text = await page.getContentsOf('h5');

            expect(text).toEqual('Please confirm your entries');

        });

        test('Submitting then saving adds blog to index page', async () => {
            await page.click('button.green');

            //when we create new blogpost, it navigate to list page of blogpost
            //so find any element on list page by waiting it to check whether your
            //blog has created

            await page.waitFor('.card');

            //now check your newly created title and content

            const title = await page.getContentsOf('.card-title');
            const content = await page.getContentsOf('p');

            expect(title).toEqual('my title');

            expect(content).toEqual('my content');
        });
    });


    //nested describe for invalid inputs
    describe('And using invalid inputs', async () => {
        beforeEach(async () => {
            await page.click('form button');
        });

        test('the form show the error message', async () => {
            const titleError = await page.getContentsOf('.title .red-text');
            
            const contentError = await page.getContentsOf('.content .red-text');

            expect(titleError).toEqual('You must provide a value');

            expect(contentError).toEqual('You must provide a value');
        });
    });
});

describe('when user not logged in', async() => {
    const actions = [
        {
            method: 'get',
            url: '/api/blogs'
        }, 
        {
            method: 'post',
            url: '/api/blogs',
            data: {title: 'My Title', content: 'My Content'}
        }
    ];

    ////REPLACEMENT OF THESE 2 METHODS BY REFACTORING THE CODE, AS API ARE SAME, ONLY PARAMETERS ARE DIFFERENT
    // Method 1: Replaced with Method 3
    // test('User cannot create blog post', async() => {
    //    const result = await page.post('/api/blogs',{title: 'My Title', content: 'My Content'});

    //     expect(result).toEqual({error: 'You must log in!'});
    // });

    // // Method 2: Replaced with Method 3
    // test('user cannot get the list of posts', async ()=> {
    //     const result = await page.get('/api/blogs');
    //      expect(result).toEqual({error: 'You must log in!'});
    // });

    //Method 3: refactored method for Method 1 & 2
    test('blog related actions are prohibited', async () => {
       const results = await page.execRequests(actions);
        for(let result of results) {
            expect(result).toEqual({error: 'You must log in!'});
        }
    });
});