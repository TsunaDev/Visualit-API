const graph = require ('../controllers/graph');

let supertest = require("supertest");
let should = require("should");
const { functionExpression } = require('babel-types');

let server = supertest.agent("http://127.0.0.1:3000");
let token = "";

const testAdmin = { "username": "admin", "password": "pass", "role": 1 };
const testNurse = { "username": "nurse", "password": "pass", "role": 3 };

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
  
  before(async () => {
    let resNurseToken = await loginWithUser(testNurse);
    let resAdminToken = await loginWithUser(testAdmin);
    nurseToken = resNurseToken.body.token;
    adminToken = resAdminToken.body.token;
  });

  describe("Registration test", () => {
    it("should return a 201 code", done => {
      server
        .post("/user/")
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
        .post("/user/")
        .set('Authorization', `Bearer ${adminToken}`)
        .send("username=test")
        .expect(400)
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
        .get("/user/")
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
        .get("/user/")
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
          console.log(res.body);
          serviceID = res.body[0].id;
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



  describe("Create a room", function() {
    it("should return a 201 code", done => {
      server
        .post("/rooms/")
        .send({"number": "24", "service_id": serviceID, "beds": 3})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(201)
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

  describe("Get a room", function() {
    it("should return a 200 code", done => {
      server
        .get("/rooms/")
        .send({"number": "24", "service_id": serviceID})
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200)
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


  describe("Get a role with name", function() {
    it("should return a role", function(done) {
      server
      .get("/roles")
      .send("role=admin")
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
      .send("index=1")
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        
        res.body.name.should.equal("admin");
        res.body.index.should.equal(1)
        done();
      });
    })
  })
  
  describe("Get all roles", function() {
    it("should return all roles", function(done) {
      server
      .get("/roles/all")
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
  
        res.body.length.should.equal(3);
        done();
      })
    })
  })

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

  let ticketDate = null;
  describe("Get waiting list", () => {
    it("should return a 200 code", done => {
      server
        .get("/waiting/")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          console.log(res.body);
          ticketDate = res.body[0].date;
          done();
        });
    });
  });

  describe("Get waiting ticket", () => {
    it("should return a 200 code", done => {
      server
        .get("/waiting/")
        .send(`date=${ticketDate}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200)
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