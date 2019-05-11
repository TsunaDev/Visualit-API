let supertest = require("supertest");
let should = require("should");

let server = supertest.agent("http://127.0.0.1:3000");

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
