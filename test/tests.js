const graph = require ('../controllers/graph');

let supertest = require("supertest");
let should = require("should");
const { functionExpression } = require('babel-types');

let server = supertest.agent("http://127.0.0.1:3000");
let token = "";

const testAdmin = { "username": "admin", "password": "pass", "role": 1 };
const testNurse = { "username": "nurse", "password": "pass", "role": 3 };
const testNoPerm = { "username": "noperm", "password": "pass", "role": 4 };
const createUser = async (user) => {
  let res = null;
  await graph.createUser(user.username, user.password, user.role, (result) => {res = result;});
  return res;
};

const getUser = async(user) => {
  let data = null;

  await graph.getUser(user.username, async function(res) {
    if (res.status) {
      data = res.value;
    } else
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

describe("Tests with token required", () => {
  let nurseToken = null;
  let adminToken = null;
  let noPermToken = null;
  
  before(async () => {
    let resNurseToken = await loginWithUser(testNurse);
    let resAdminToken = await loginWithUser(testAdmin);
    let resNoPermToken = await loginWithUser(testNoPerm);
    nurseToken = resNurseToken.body.token;
    adminToken = resAdminToken.body.token;
    noPermToken = resNoPermToken.body.token;
  });

  describe("Registration test", () => {
    it("should return a 201 code", done => {
      server
        .post("/users/")
        .set('Authorization', `Bearer ${adminToken}`)
        .send({"username": "test", "password": "test" , "role": 1})
        .expect(201)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Registration fail test", () => {
    it("should return a 400 code", done => {
      server
        .post("/users/")
        .set('Authorization', `Bearer ${adminToken}`)
        .send("username=test")
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Registration bad permissions", () => {
    it("should return a 401 code", done => {
      server
        .post("/users/")
        .set('Authorization', `Bearer ${nurseToken}`)
        .send({"username": "test", "password": "test" , "role": 1})
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
    it("should return a 400 error code", done => {
        server
            .post("/auth")
            .send("username=foo&password=toto")
            .expect(400)
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
        .get("/users/")
        .set("Authorization", `Bearer ${nurseToken}`)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.name.should.equal("nurse");
          done();
        });
    });
  });

  describe("Get user infos test", () => {
    it("should return a 200 code", done => {
      server
        .get("/users/")
        .send("username=nurse")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.name.should.equal("nurse");
          done();
        });
    });
  });

  describe("Get user infos test no permissions", () => {
    it("should return a 401 code", done => {
      server
        .get("/users/?username=admin")
        .set("Authorization", `Bearer ${nurseToken}`)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Get non-existing user infos", () => {
    it("should return a 404 code", done => {
      server
        .get("/users/?username=notauser")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Change self infos test", () => {
    it("should return a 202 code", done => {
      server
        .put("/users/")
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
        .put("/users/")
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
        .put("/users/")
        .send("username=admin&password=pass")
        .set("Authorization", `Bearer ${nurseToken}`)
        .expect(401)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Change non-existing user infos", () => {
    it("should return a 404 code", done => {
      server
        .put("/users/")
        .send("username=nonexisting&password=pass")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Delete user test no permissions", () => {
    it("should return a 401 code", done => {
      server
        .delete("/users/")
        .send("username=test")
        .set("Authorization", `Bearer ${noPermToken}`)
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
        .delete("/users/")
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
        .delete("/users/")
        .set("Authorization", `Bearer ${nurseToken}`)
        .expect(204)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Add first preference test", () => {
    it("should return a 202 code", done => {
      server
        .post("/users/prefs/")
        .send({"name": "testPref", "value": "yes"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(202)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Add second preference test", () => {
    it("should return a 202 code", done => {
      server
        .post("/users/prefs/")
        .send({"name": "testPref2", "value": "true"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(202)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Update first preference test", () => {
    it("should return a 202 code", done => {
      server
        .post("/users/prefs/")
        .send({"name": "testPref", "value": "no"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(202)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("List preferences test", () => {
    it("should return a 200 code", done => {
      server
        .get("/users/prefs/")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.testPref.should.equal("no");
          res.body.testPref2.should.equal("true");
          done();
        });
    });
  });

  describe("Delete first preference test", () => {
    it("should return a 202 code", done => {
      server
        .delete("/users/prefs/")
        .send({"name": "testPref"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(202)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.testPref2.should.equal("true");
          done();
        });
    });
  });

  describe("Delete second preference test (empty list)", () => {
    it("should return a 202 code", done => {
      server
        .delete("/users/prefs/")
        .send({"name": "testPref2"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(202)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("List preferences test (empty list)", () => {
    it("should return a 200 code", done => {
      server
        .get("/users/prefs/")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          let check = true;
          Object.keys(res.body).forEach(function(_key) {
            check = false;
          });
          check.should.equal(true);
          done();
        });
    });
  });

  describe("Add preference with missing parameter", () => {
    it("should return a 400 code", done => {
      server
        .post("/users/prefs/")
        .send({"name": "testPref"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Delete preference with missing parameter", () => {
    it("should return a 400 code", done => {
      server
        .delete("/users/prefs/")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Create a service with no permission", function() {
    it("should return a 401 code", done => {
      server
        .post("/services/")
        .send({"name": "TestService"})
        .set("Authorization", `Bearer ${noPermToken}`)
        .expect(401)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Create a service", function() {
    it("should return a 201 code", done => {
      server
        .post("/services/")
        .send({"name": "TestService"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(201)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Create already existing service", function() {
    it("should return a 400 code", done => {
      server
        .post("/services/")
        .send({"name": "TestService"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Create a service with no name", function() {
    it("should return a 400 code", done => {
      server
        .post("/services/")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  })

  let serviceID = null;
  describe("Get services list", function() {
    it("should return a 200 code", done => {
      server
        .get("/services/")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200)
        .end(function(err, res) {
          serviceID = res.body.services[0].id;
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Get services list with no permissions", function() {
    it("should return a 401 code", done => {
      server
        .get("/services/")
        .set("Authorization", `Bearer ${noPermToken}`)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Update service", function() {
    it("should return a 202 code", done => {
      server
        .put(`/services/${serviceID}`)
        .send({"name": "TestRename"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(202)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Update service with a non numerical ID", function() {
    it("should return a 400 code", done => {
      server
        .put(`/services/abcd`)
        .send({"name": "TestRename"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Update service without name", function() {
    it("should return a 400 code", done => {
      server
        .put(`/services/${serviceID}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Update non-existing service", function() {
    it("should return a 404 code", done => {
      server
        .put(`/services/666`)
        .send({"name": "TestRename"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Create a room", function() {
    it("should return a 201 code", done => {
      server
        .post("/rooms/")
        .send({"room_nb": "24", "service_id": serviceID, "beds": 3})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(201)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Create already existing room", function() {
    it("should return a 400 code", done => {
      server
        .post("/rooms/")
        .send({"room_nb": "24", "service_id": serviceID, "beds": 3})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Create a room without permissions", function() {
    it("should return a 401 code", done => {
      server
        .post("/rooms/")
        .set("Authorization", `Bearer ${noPermToken}`)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Create a room with missing parameter", function() {
    it("should return a 400 code", done => {
      server
        .post("/rooms/")
        .send({"service_id": serviceID, "beds": 3})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Create a room with non numerical serviceID", function() {
    it("should return a 400 code", done => {
      server
        .post("/rooms/")
        .send({"room_nb": "24", "service_id": "error", "beds": 3})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Create a room with non numerical beds number", function() {
    it("should return a 400 code", done => {
      server
        .post("/rooms/")
        .send({"room_nb": "24", "service_id": serviceID, "beds": "error"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Get room list", function() {
    it("should return a 200 code", done => {
      server
        .get("/rooms/")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200)
        .end(function(err, res) {
          res.body.length.should.equal(1);
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Get room list without permission", function() {
    it("should return a 401 code", done => {
      server
        .get("/rooms/")
        .set("Authorization", `Bearer ${noPermToken}`)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });


  describe("Get a room", function() {
    it("should return a 200 code", done => {
      server
        .get("/rooms/")
        .query({"room_nb": "24", "service_id": serviceID})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Get a room with room_nb but no service_id", function() {
    it("should return a 400 code", done => {
      server
        .get("/rooms/")
        .query({"room_nb": "24"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Get a room with a non numerical service_id", function() {
    it("should return a 400 code", done => {
      server
        .get("/rooms/")
        .query({"room_nb": "24", "service_id": "abcd"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Update a room", function() {
    it("should return a 202 code", done => {
      server
        .put("/rooms/number")
        .send({"room_nb": "24", "new_room_nb": "24", "service_id": serviceID})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(202)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Update a room number with a missing parameter", function() {
    it("should return a 400 code", done => {
      server
        .put("/rooms/number")
        .send({"room_nb": "24", "service_id": serviceID})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Update a room number without permission", function() {
    it("should return a 401 code", done => {
      server
        .put("/rooms/number")
        .send({"room_nb": "24", "new_room_nb": "66", "service_id": serviceID})
        .set("Authorization", `Bearer ${noPermToken}`)
        .expect(401)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Update a room number with non-numerical service_id", function() {
    it("should return a 400 code", done => {
      server
        .put("/rooms/number")
        .send({"room_nb": "24", "new_room_nb": "66", "service_id": "abcd"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Create a bed", function() {
    it("should return a 201 code", done => {
      server
        .post("/beds/")
        .send({"room_nb": "24", "service_id": serviceID})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(201)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Create a bed without permission", function() {
    it("should return a 401 code", done => {
      server
        .post("/beds/")
        .send({"room_nb": "24", "service_id": serviceID})
        .set("Authorization", `Bearer ${noPermToken}`)
        .expect(401)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Create a bed with invalid status", function() {
    it("should return a 400 code", done => {
      server
        .post("/beds/")
        .send({"room_nb": "24", "service_id": serviceID, "status": "42"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Create a bed with invalid clean state", function() {
    it("should return a 400 code", done => {
      server
        .post("/beds/")
        .send({"room_nb": "24", "service_id": serviceID, "to_clean": "42"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });
  
  describe("Create a bed with no room_nb", function() {
    it("should return a 400 code", done => {
      server
        .post("/beds/")
        .send({"service_id": serviceID})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Create a bed with no service_id", function() {
    it("should return a 400 code", done => {
      server
        .post("/beds/")
        .send({"room_nb": "42"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Create a bed with non-numerical service_id", function() {
    it("should return a 400 code", done => {
      server
        .post("/beds/")
        .send({"room_nb": "42", "service_id": "abcd"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Create a bed with non-existing service_id", function() {
    it("should return a 400 code", done => {
      server
        .post("/beds/")
        .send({"room_nb": "42", "service_id": 666})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });


  let bed = null;
  describe("Get beds", function() {
    it("should return 200 code", done => {
      server
        .get("/beds/")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200)
        .end(function(err, res) {
          bed = res.body[0].uuid;
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Update bed", function() {
    it("should return a 202 code", done => {
      server
        .put(`/beds/${bed}/clean`)
        .send({"to_clean": true})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(202)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Update bed with invalid uuid", function() {
    it("should return a 400 code", done => {
      server
        .put(`/beds/notuuid/clean`)
        .send({"to_clean": true})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Update non-existing bed", function() {
    it("should return a 404 code", done => {
      server
        .put(`/beds/d7cbd8fa-4c31-45a8-b50d-43911d06a77d/clean`)
        .send({"to_clean": true})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Update a bed with no permissions", function() {
    it("should return a 401 code", done => {
      server
        .put(`/beds/${bed}/clean`)
        .send({"to_clean": true})
        .set("Authorization", `Bearer ${noPermToken}`)
        .expect(401)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Update a bed with invalid clean state", function() {
    it("should return a 400 code", done => {
      server
        .put(`/beds/${bed}/clean`)
        .send({"to_clean": "42"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Delete bed without permission", function() {
    it("should return a 401 code", done => {
      server
        .delete(`/beds/${bed}`)
        .set("Authorization", `Bearer ${noPermToken}`)
        .expect(401)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Delete bed with invalid uuid", function() {
    it("should return a 400 code", done => {
      server
        .delete(`/beds/42`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Delete non-existing bed", function() {
    it("should return a 404 code", done => {
      server
        .delete(`/beds/d7cbd8fa-4c31-45a8-b50d-43911d06a77d`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Delete bed", function() {
    it("should return a 204 code", done => {
      server
        .delete(`/beds/${bed}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(204)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Delete room without permission", function() {
    it("should return a 401 code", done => {
      server
        .delete("/rooms/")
        .set("Authorization", `Bearer ${noPermToken}`)
        .send({"room_nb": "24", "service_id": serviceID})
        .expect(401)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Delete room without room_nb", function() {
    it("should return a 400 code", done => {
      server
        .delete("/rooms/")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({"service_id": serviceID})
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Delete room with non-numerical service_id", function() {
    it("should return a 400 code", done => {
      server
        .delete("/rooms/")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({"room_nb": "24", "service_id": "abcd"})
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Delete room", function() {
    it("should return a 204 code", done => {
      server
        .delete("/rooms/")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({"room_nb": "24", "service_id": serviceID})
        .expect(204)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Delete service without permissions", function() {
    it("should return a 401 code", done => {
      server
        .delete(`/services/${serviceID}`)
        .set("Authorization", `Bearer ${noPermToken}`)
        .expect(401)
        .end(err => {
          if (err) return done(err);
          done();
        });
      });
  });

  describe("Delete service without valid service_id", function() {
    it("should return a 400 code", done => {
      server
        .delete(`/services/abcd`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
      });
  });

  describe("Delete non-existing service", function() {
    it("should return a 404 code", done => {
      server
        .delete(`/services/6666`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404)
        .end(err => {
          if (err) return done(err);
          done();
        });
      });
  });

  describe("Delete service", function() {
    it("should return a 204 code", done => {
      server
        .delete(`/services/${serviceID}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(204)
        .end(err => {
          if (err) return done(err);
          done();
        });
      });
  });

  describe("Get a role without permissions", function() {
    it("should return a 401 code", function(done) {
      server
      .get("/roles")
      .query("role=admin")
      .set('Authorization', `Bearer ${noPermToken}`)
      .expect(401)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
    });
  });

  describe("Get a role with name", function() {
    it("should return a role", function(done) {
      server
      .get("/roles")
      .query("role=admin")
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        
        res.body.name.should.equal("admin");
        res.body.index.should.equal(1)
        done();
      });
    });
  });
  
  describe("Get a role with index", function() {
    it("should return a role", function(done) {
      server
      .get("/roles")
      .set('Authorization', `Bearer ${adminToken}`)
      .query("index=1")
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        
        res.body.name.should.equal("admin");
        res.body.index.should.equal(1)
        done();
      });
    })
  });
  
  describe("Get all roles", function() {
    it("should return all roles", function(done) {
      server
      .get("/roles/all")
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
  
        res.body.length.should.equal(4);
        done();
      })
    })
  });

  describe("Get a role with index", function() {
    it("should return a role", function(done) {
      server
      .get("/roles")
      .set('Authorization', `Bearer ${adminToken}`)
      .query("index=1")
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        
        res.body.name.should.equal("admin");
        res.body.index.should.equal(1)
        done();
      });
    })
  });

  describe("Role creation", () => {
    it("should create a role and return a 201 code", done => {
      server
        .post("/roles/")
        .set('Authorization', `Bearer ${adminToken}`)
        .send({"role": "cleaner", "index": 4, "permissions": ["services.get", "services.getAll", "rooms.get", "rooms.getAll", "beds.clean"]})
        .expect(201)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Role creation without permissions", () => {
    it("should return a 401 code", done => {
      server
        .post("/roles/")
        .set('Authorization', `Bearer ${noPermToken}`)
        .send({"role": "cleaner", "index": 4, "permissions": ["services.get", "services.getAll", "rooms.get", "rooms.getAll", "beds.clean"]})
        .expect(401)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Role creation with a missing parameter", () => {
    it("should return a 400 code", done => {
      server
        .post("/roles/")
        .set('Authorization', `Bearer ${adminToken}`)
        .send({"index": 4, "permissions": ["services.get", "services.getAll", "rooms.get", "rooms.getAll", "beds.clean"]})
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Change role without permissions", () => {
    it("should return a 401 code", done => {
      server
        .put("/roles/")
        .send({"role": "cleaner", "permissions": ["services.get", "services.getAll", "rooms.get", "rooms.getAll", "beds.clean", "user.update.self"]})
        .set("Authorization", `Bearer ${noPermToken}`)
        .expect(401)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Change role without name", () => {
    it("should return a 400 code", done => {
      server
        .put("/roles/")
        .send({"permissions": ["services.get", "services.getAll", "rooms.get", "rooms.getAll", "beds.clean", "user.update.self"]})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });


  describe("Change role permissions", () => {
    it("should return a 202 code", done => {
      server
        .put("/roles/")
        .send({"role": "cleaner", "permissions": ["services.get", "services.getAll", "rooms.get", "rooms.getAll", "beds.clean", "user.update.self"]})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(202)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Delete role without permissions", () => {
    it("should return a 401 code", done => {
      server
        .delete("/roles/")
        .send({"role": "cleaningagent"})
        .set("Authorization", `Bearer ${noPermToken}`)
        .expect(401)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Delete role with no identifier", () => {
    it("should return a 400 code", done => {
      server
        .delete("/roles/")
        .send({})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Delete role", () => {
    it("should return a 204 code", done => {
      server
        .delete("/roles/")
        .send({"role": "cleaningagent"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(204)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Add in waiting list", () => {
    it("should return a 201 code", done => {
      server
        .post("/waiting/")
        .send({"service_id": 1, "comment": "Entorse cheville"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(201)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Add in waiting list without permissions", () => {
    it("should return a 401 code", done => {
      server
        .post("/waiting/")
        .send({"service_id": 1, "comment": "Entorse cheville"})
        .set("Authorization", `Bearer ${noPermToken}`)
        .expect(401)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Add in waiting list with non-numerical service_id", () => {
    it("should return a 400 code", done => {
      server
        .post("/waiting/")
        .send({"service_id": "abcd", "comment": "Entorse cheville"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Add in waiting list without service_id", () => {
    it("should return a 400 code", done => {
      server
        .post("/waiting/")
        .send({"comment": "Entorse cheville"})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  let ticketDate = null;
  describe("Get waiting list", () => {
    it("should return a 200 code", done => {
      server
        .get("/waiting/")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          ticketDate = res.body[0].date;
          done();
        });
    });
  });

  describe("Get waiting list without permissions", () => {
    it("should return a 401 code", done => {
      server
        .get("/waiting/")
        .set("Authorization", `Bearer ${noPermToken}`)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });


  describe("Get waiting ticket", () => {
    it("should return a 200 code", done => {
      server
        .get("/waiting/")
        .query(`date=${ticketDate}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Get non-existing waiting ticket", () => {
    it("should return 404 code", done => {
      server
        .get("/waiting/")
        .query(`date=20212212`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Get waiting ticket with non-numerical service_id", () => {
    it("should return a 400 code", done => {
      server
        .get("/waiting/")
        .query(`service_id=abcd`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Change waiting ticket service", () => {
    it("should return a 202 code", done => {
      server
        .put("/waiting/")
        .send({"date": ticketDate, "service_id": 2})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(202)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Change waiting ticket service without permissions", () => {
    it("should return a 401 code", done => {
      server
        .put("/waiting/")
        .send({"date": ticketDate, "service_id": 2})
        .set("Authorization", `Bearer ${noPermToken}`)
        .expect(401)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Change waiting ticket service with bad date", () => {
    it("should return a 404 code", done => {
      server
        .put("/waiting/")
        .send({"date": "20212212", "service_id": 2})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Delete waiting card with no permissions", () => {
    it("should return a 401 code", done => {
      server
        .delete("/waiting/")
        .send(`date=${ticketDate}`)
        .set("Authorization", `Bearer ${noPermToken}`)
        .expect(401)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Delete waiting card without date", () => {
    it("should return a 400 code", done => {
      server
        .delete("/waiting/")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Delete non-existing waiting card", () => {
    it("should return a 404 code", done => {
      server
        .delete("/waiting/")
        .send(`date=20212212`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe("Delete waiting card", () => {
    it("should return a 204 code", done => {
      server
        .delete("/waiting/")
        .send(`date=${ticketDate}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(204)
        .end(err => {
          if (err) return done(err);
          done();
        });
    });
  });
});