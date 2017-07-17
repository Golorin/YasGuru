var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();

chai.use(chaiHttp);

describe('should list all videos', function () {
  it('should respond with a 200 status', function (done) {
    chai.request(server)
      .get('/api/videos/retrieve')
      .end(function(err, res) {
        res.should.have.status(200);
        done();
      });
  });

  it('should be a json', function (done) {
    chai.request(server)
      .get('/api/videos/retrieve')
      .end(function(err, res) {
        console.log(res.text);
        res.text.should.be.json;
        done();
      });
  });

});
