const chai = require('chai');
const chaiHttp = require('chai-http');
const {app, config} = require('../server');
const Registry = require('../models/Registry');

const expect = chai.expect;
chai.use(chaiHttp);

describe('app', function() {
  let request;

  beforeEach(function() {
    request = chai.request(app);
  });

  afterEach(function() {
    request.close();
  });

  describe('GET /', function() {
    it('should get app name and version', function(done) {
      request
          .get('/')
          .end((err, res) => {
            expect(res.text).to.equal(`loadbalancer ${config.version}`);
            expect(res).to.have.status(200);
            done();
          });
    });
  });

  // Note: a KEY must be set in env
  describe('PUT /register', function() {
    it('should register a chat server', function(done) {
      request
          .put('/register/mockname/16/5/1.0')
          .set('X-API-Key', config.key)
          .end((err, res) => {
            expect(res.text).to.match(/.*Registered mockname.*/);
            expect(res).to.have.status(200);
            done();
          });
    });
  });

  // Note: just testing route. To actually test unregister run Registry test
  describe('DELETE /register', function() {
    it('should unregister a chat server', function(done) {
      request
          .delete('/register/mockname')
          .set('X-API-Key', config.key)
          .end((err, res) => {
            expect(res.text).to.match(/.*Unregistered mockname.*/);
            expect(res).to.have.status(200);
            done();
          });
    });
  });

  describe('GET methods', function() {
    describe('GET /find/:version', function() {
      before(function() {
        // runs before all tests in this block
        const servers = [
          {name: 'http://mockserver1.com', cpus: 16, rooms: 10, version: '1.0'},
          {name: 'http://mockserver2.com', cpus: 16, rooms: 4, version: '1.0'},
          {name: 'http://mockserver3.com', cpus: 24, rooms: 4, version: '1.1'},
          {name: 'http://mockserver4.com', cpus: 24, rooms: 10, version: '1.1'},
        ];

        servers.forEach((obj) => {
          Registry.register(obj.name, obj.cpus, obj.rooms, obj.version);
        });
      });

      it('should return least loaded chat server with a certain version (1.0)', function(done) {
        request
            .get('/find/1.0')
            .set('X-API-Key', config.key)
            .end((err, res) => {
              expect(res.text).to.match(/.*mockserver2.*/);
              expect(res).to.have.status(200);
              done();
            });
      });

      it('should return least loaded chat server for another version (1.1)', function(done) {
        request
            .get('/find/1.1')
            .set('X-API-Key', config.key)
            .end((err, res) => {
              expect(res.text).to.match(/.*mockserver3.*/);
              expect(res).to.have.status(200);
              done();
            });
      });
    });

    describe('GET /info/json', function() {
      it('should return registry info as json', function(done) {
        request
            .get('/info/json')
            .set('X-API-Key', config.key)
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.be.a('object');
              expect(res.body).to.have.property('message');
              done();
            });
      });
    });

    describe('GET /info/html', function() {
      it('should return registry info as html', function(done) {
        request
            .get('/info/html')
            .set('X-API-Key', config.key)
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.text).to.be.a('string');
              expect(res.text).to.include('</table>');
              done();
            });
      });
    });
  });
});
