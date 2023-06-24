const nodemailer = require("nodemailer");
const googleApis = require("googleapis");

const REDIRECT_URI = `https://developers.google.com/oauthplayground`;
const CLIENT_ID = `816296071323-1l0b451pli1kcprl9ch72hg48a18o8oj.apps.googleusercontent.com`;
const CLIENT_SECRET = `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`;
const REFRESH_TOKEN = `1//04AYODt2ILhpXCgYIARAAGAQSNwF-L9IrLkngpqMXoZF3cRzdn5MBZKkv3jRaTMu-Jl4TyUFi7VbIuJtzcp3swttmZBFMJIaB1yU`;

const authClient = new googleApis.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
authClient.setCredentials({refresh_token: REFRESH_TOKEN});


async function mailer(receiver,otp,userid){
    try{
        const ACCESS_TOKEN = await authClient.getAccessToken();

        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "msakshams24@gmail.com",
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: ACCESS_TOKEN
            }
        })

        const details = {
            from: "soni industries <msakshams24@gmail.com>",
            to: receiver,
            subject: "Password Change link",
            text: "message text",
            html: `<h2>you can reset your password via this link :</h2><a href='http://localhost:3000/reset/password/${userid}/${otp}'>${otp}</a>`
        }

        const result =  await transport.sendMail(details);
        return result;

    }
    catch(err){
        return err;
    }
}

module.exports = mailer;
