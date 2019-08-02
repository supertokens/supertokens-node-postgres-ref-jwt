const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const SuperTokens = require("../../express");
const errors = require("../../lib/build/error");
const assert = require("assert");

let urlencodedParser = bodyParser.urlencoded({ limit: "20mb", extended: true, parameterLimit: 20000 });
let jsonParser = bodyParser.json({ limit: "20mb" });

let app = express();
app.use(urlencodedParser);
app.use(jsonParser);

app.post("/login", async (req, res, next) => {
    const userId = req.body.userId;
    const jwtPaylaod = req.body.jwtPaylaod;
    const sessionData = req.body.sessionData;
    await SuperTokens.createNewSession(res, userId, jwtPaylaod, sessionData);
    res.send("success");
});

app.get("/", async (req, res, next) => {
    let errCode = 0;
    let success = false;
    try {
        const sessionInfo = await SuperTokens.getSession(req, res, true);
        success = true;
    } catch (err) {
        if (err.errType === undefined) {
            throw Error();
        }
        errCode = err.errType;
    }
    res.send({
        success,
        errCode
    });
});

app.post("/logout", async (req, res, next) => {
    let errCode = 0;
    let success = false;
    try {
        const sessionInfo = await SuperTokens.getSession(req, res, true);
        await sessionInfo.revokeSession();
        success = true;
    } catch (err) {
        if (err.errType === undefined) {
            throw Error();
        }
        errCode = err.errType;
    }
    res.send({
        success,
        errCode
    });
});

app.post("/revokeAll", async (req, res, next) => {
    let errCode = 0;
    let success = false;
    try {
        const sessionInfo = await SuperTokens.getSession(req, res, true);
        const userId = sessionInfo.userId;
        await SuperTokens.revokeAllSessionsForUser(userId);
        success = true;
    } catch (err) {
        if (err.errType === undefined) {
            throw Error();
        }
        errCode = err.errType;
    }
    res.send({
        success,
        errCode
    });
});

app.post("/refresh", async (req, res, next) => {
    let errCode = 0;
    let success = false;
    try {
        const sessionInfo = await SuperTokens.refreshSession(req, res);
        success = true;
    } catch (err) {
        if (err.errType === undefined) {
            throw Error();
        }
        errCode = err.errType;
    }
    res.send({
        success,
        errCode
    });
});

module.exports = app;
