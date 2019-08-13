const ChatServer = require('../models/ChatServer');
const chai = require('chai');
const assert = chai.assert;

describe('ChatServer', function() {
  const name = 'mock name';
  const cpus = '16';
  const rooms = '10';
  const version = '1.0';

  describe('#new()', function() {
    it('should create a new chat server', function() {
      const ts = Math.floor(new Date() /1000);
      const chatServer = new ChatServer(name, cpus, rooms, version);

      assert.equal(chatServer.getName(), name);
      assert.equal(chatServer.getCpus(), cpus);
      assert.equal(chatServer.getRooms(), rooms);
      assert.equal(chatServer.getVersion(), version);
      assert.equal(chatServer.getTimestamp(), ts);
    });
  });

  describe('test setter ang getter methods', function() {
    let cs;
    let oldTs;

    before(function() {
      // runs before all tests in this block
      cs = new ChatServer(name, cpus, rooms, version);
      oldTs = cs.getTimestamp();
    });

    describe('#setName()', function() {
      it('should set name', function() {
        // cs = new ChatServer(name, cpus, rooms, load, version);
        cs.setName('new mock name');
        assert.equal(cs.getName(), 'new mock name');
      });
    });

    describe('#setCpus()', function() {
      it('should set cpus', function() {
        cs.setCpus(24);
        assert.equal(cs.getCpus(), 24);
      });
    });

    describe('#setRooms()', function() {
      it('should set rooms', function() {
        cs.setRooms(12);
        assert.equal(cs.getRooms(), 12);
      });
    });

    describe('#setVersion()', function() {
      it('should set version', function() {
        cs.setVersion('2.0');
        assert.equal(cs.getVersion(), '2.0');
      });
    });

    describe('#getCapacity()', function() {
      it('should return capacity of chat server', function() {
        // reset values
        cs.setCpus(cpus);
        cs.setRooms(rooms);
        assert.equal( cs.getCapacity(), 6);
      });
    });

    describe('#updateTimestamp()', function() {
      it('should update timestamp', function(done) {
        this.timeout(2000);

        setTimeout(function() {
          const newTs = Math.floor(new Date() /1000);

          cs.updateTimestamp();
          const currTs = cs.getTimestamp();

          assert.equal(currTs, newTs);
          assert.notEqual(currTs, oldTs);
          done();
        }, 1000);
      });
    });
  });
});
