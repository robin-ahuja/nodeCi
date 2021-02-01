const Buffer = require('safe-buffer').Buffer;
 //keygrip is use to generate session.sig 
 const KeyGrip = require('keygrip');

 //get keys -- kind of our (developers) secret
 const keys = require('../../config/dev');

 const keygrip = require('keygrip');
module.exports = (user) => {
    //this is the structure of session object when we decode it
    const sessionObject = {
        passport: {
            user: user._id.toString() //as it is mongo db _id object, need to cast it
        }
    };

    //now create session object string from above object
    //it will generate the same session string that we get while actual login
    //during 'login with google' button
    const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');

    //now generate session.sg (session signature) which is combination of
    //your session + clientKey 
    //it is used to verify whether anyone modify session to hack into our application
    //so we compare the hash generated

   
    const kgrip = new keygrip([keys.cookieKey]);

    //generate session.sig
    const sig = kgrip.sign('session=' + session);

    return {session, sig};

}