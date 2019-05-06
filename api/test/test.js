let supertest = require("supertest");
let should = require("should");

let server = supertest.agent("http://localhost:3000");

describe("Homepage test", function() {
  it("should return homepage", function(done) {
    server
    .get("/")
    .expect("Content-type", /json/)
    .expect(200)
    .end(function(err, res) {
      res.status.should.equal(200);
      done();
    });
  });
});
