let supertest = require("supertest");
let should = require("should");

let server = supertest.agent("http://127.0.0.1:3000");
let token = "";

describe("Homepage test", function() {
  it("should return homepage", function(done) {
    server
    .get("/")
    .expect("Content-type", /text\/html/)
    .expect(200)
    .then(res => {
      res.status.should.equal(200);
      done();
    });
  });
});

describe("Log in test", () => {
    it("should return a token", done => {
        server
            .post("/auth")
            .send("username=foo&password=bar")
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                if (!(res.body.token && res.body.expiresIn))
                    return done(Error("Missing field"));
                token = res.body.token;
                done();
            })
    });
});

describe("Log in test failure", () => {
    it("should return a 401 error code", done => {
        server
            .post("/auth")
            .send("username=foo&password=toto")
            .expect(401)
            .end(err => {
                if (err) return done(err);
                done();
            });
    });
});

describe("Authentication test", () => {
    it("should return a 200 code", done => {
        server
            .get("/auth/amilogged")
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .end(err => {
                if (err) return done(err);
                done();
            });
    });
});

describe("Authentication fail test", () => {
    it("should return a 401 code", done => {
        server
            .get("/auth/amilogged")
            .expect(401)
            .end(err => {
                if (err) return done(err);
                done();
            });
    });
});