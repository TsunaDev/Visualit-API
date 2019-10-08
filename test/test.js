const graph = require ('../controllers/graph');

let supertest = require("supertest");
let should = require("should");

let server = supertest.agent("http://127.0.0.1:3000");
let token = "";

const testAdmin = { "username": "admin", "password": "pass", "role": "admin" };
const testNurse = { "username": "nurse", "password": "pass", "role": "nurse" };

const createUser = async (user) => {
  let res = null;
  
  await graph.createUser(user.username, user.password, user.role, (result) => {res = result;});
  return res;
};

const getUser = async(user) => {
  let data = null;

  await graph.getUser(user.username, async function(res) {
    if (res.status)
      data = res.value;
    else
      data = await createUser(user);
  });

  return data;
}
 
const loginWithUser = async (user) => {
  await getUser(user);
  return server.post("/auth/")
      .send({ "username": user.username, "password": user.password })
      .expect(200);
};



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

describe("Registration test", () => {
  it("should return a 201 code", done => {
    server
      .post("/user/")
      .send("username=test&password=test&role=admin")
      .expect(201)
      .end(err => {
        if (err) return done(err);
        done();
      });
  });
});
describe("Registration fail test", () => {
  it("should return a 401 code", done => {
    server
      .post("/user/")
      .send("username=test")
      .expect(401)
      .end(err => {
        if (err) return done(err);
        done();
      });
  });
});

describe("Log in test", () => {
  it("should return a token", done => {
    server
      .post("/auth")
      .send("username=test&password=test")
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
          if (!(res.body.token && res.body.expiresIn))
              return done(Error("Missing field"));
          token = res.body.token;
          done();
      });
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


describe("Tests with token required", () => {
  let nurseToken = null;
  let adminToken = null;
  
  before(async () => {
    let resNurseToken = await loginWithUser(testNurse);
    let resAdminToken = await loginWithUser(testAdmin);

    nurseToken = resNurseToken.body.token;
    adminToken = resAdminToken.body.token;
  });


  describe("Authentication test", () => {
      it("should return a 200 code", done => {
          server
              .get("/auth/amilogged")
              .set('Authorization', `Bearer ${adminToken}`)
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

  describe("Get self infos test", () => {
    it("should return a 200 code", done => {
      server
        .get("/user/")
        .set("Authorization", `Bearer ${nurseToken}`)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.username.should.equal("nurse");
          done();
        });
    });
  });
  describe("Get user infos test", () => {
    it("should return a 200 code", done => {
      server
        .get("/user/")
        .send("username=nurse")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.username.should.equal("nurse");
          done();
        });
    });
  });
  describe("Get user infos test no permissions", () => {
    it("should return a 401 code", done => {
      server
        .get("/user/?username=admin")
        .set("Authorization", `Bearer ${nurseToken}`)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Change self infos test", () => {
    it("should return a 202 code", done => {
      server
        .put("/user/")
        .send("password=pass")
        .set("Authorization", `Bearer ${nurseToken}`)
        .expect(202)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });
  describe("Change user infos test", () => {
    it("should return a 202 code", done => {
      server
        .put("/user/")
        .send("username=nurse&password=pass")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(202)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });
  describe("Change user infos test no permissions", () => {
    it("should return a 401 code", done => {
      server
        .put("/user/")
        .send("username=admin&password=pass")
        .set("Authorization", `Bearer ${nurseToken}`)
        .expect(401)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Delete user test no permissions", () => {
    it("should return a 401 code", done => {
      server
        .delete("/user/")
        .send("username=test")
        .set("Authorization", `Bearer ${nurseToken}`)
        .expect(401)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });
  describe("Delete user test", () => {
    it("should return a 204 code", done => {
      server
        .delete("/user/")
        .send("username=test")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(204)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });
  describe("Delete self test", () => {
    it("should return a 204 code", done => {
      server
        .delete("/user/")
        .set("Authorization", `Bearer ${nurseToken}`)
        .expect(204)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });
});