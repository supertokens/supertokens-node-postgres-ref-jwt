const cookie = require("../lib/build/cookieAndHeaders");
const assert = require("assert");
let cookieParser = require("cookie-parser");
const supertest = require("supertest");
const express = require("express");
const { printPath } = require("./utils");

describe(`Cookie: ${printPath("[test/cookie.test.js]")}`, () => {
    it("testing setting cookie in response with using cookie parser", function(done) {
        assert.strictEqual(typeof cookie.setCookie, "function");
        let app = express();
        app.use(cookieParser());
        app.get("/", (req, res, next) => {
            cookie.setCookie(res, "testing", "auth", req.url, false, false, Date.now() + 100000, "/");
            res.end();
        });
        supertest(app)
            .get("/")
            .expect(200)
            .end(function(err, res) {
                let responseCookie = res.headers["set-cookie"].pop().split(";")[0];
                assert.strictEqual(responseCookie, "testing=auth");
                done();
            });
    });

    it("testing getting cookie from request with using cookie parser", function(done) {
        assert.strictEqual(typeof cookie.getCookieValue, "function");
        let app = express();
        app.use(cookieParser());
        app.get("/", (req, res, next) => {
            // cookie.setCookie(res, "testing", "auth", req.url, false, false, Date.now() + 100000, "/");
            let value = cookie.getCookieValue(req, "testing");
            if (value === undefined) {
                value = "";
            }
            res.end(value);
        });
        supertest(app)
            .get("/")
            .set("Cookie", ["testing=success"])
            .expect(200)
            .end(function(err, res) {
                assert.strictEqual(res.text, "success");
                done();
            });
    });

    it("testing setting cookie in response without using cookie parser", function(done) {
        assert.strictEqual(typeof cookie.setCookie, "function");
        let app = express();
        app.get("/", (req, res, next) => {
            cookie.setCookie(res, "testing", "auth", req.url, false, false, Date.now() + 100000, "/");
            res.end();
        });
        supertest(app)
            .get("/")
            .expect(200)
            .end(function(err, res) {
                let responseCookie = res.headers["set-cookie"].pop().split(";")[0];
                assert.strictEqual(responseCookie, "testing=auth");
                done();
            });
    });

    it("testing getting cookie from request without using cookie parser", function(done) {
        assert.strictEqual(typeof cookie.getCookieValue, "function");
        let app = express();
        app.get("/", (req, res, next) => {
            // cookie.setCookie(res, "testing", "auth", req.url, false, false, Date.now() + 100000, "/");
            let value = cookie.getCookieValue(req, "testing");
            if (value === undefined) {
                value = "";
            }
            res.end(value);
        });
        supertest(app)
            .get("/")
            .set("Cookie", ["testing=success"])
            .expect(200)
            .end(function(err, res) {
                assert.strictEqual(res.text, "success");
                done();
            });
    });
});
