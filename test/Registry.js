const Registry = require('../models/Registry');
const ChatServer = require('../models/ChatServer');
const chai = require('chai');
const assert = chai.assert;

describe('Registry', function() {
  const name = 'mock name';
  const cpus = 16;
  const rooms = 10;
  const version = '1.0';

  before(function() {
    // runs before all tests in this block
    Registry.register(name, cpus, rooms, version);
  });

  it('should register a chat server', function() {
    const list = Registry.get();

    assert.hasAnyKeys(list, [name]);
    assert.isObject(list[name]);
    assert.instanceOf(list[name], ChatServer);
  });

  // this test should come after the one above
  it('should contain unique servers (same server should have timestamp updated)', function(done) {
    let list = Registry.get();
    const oldTs = list[name].getTimestamp();
    this.timeout(2000);
    // register this one again which will just update its timestamp
    setTimeout(function() {
      Registry.register(name, cpus, rooms, version);
      list = Registry.get();
      assert.hasAllKeys(list, [name]);
      assert.notEqual(oldTs, list[name].getTimestamp());
      done();
    }, 1000);
  });

  it('should return object of registered servers', function() {
    Registry.register('mock 2', 5, 2, '1.5');
    const list = Registry.get();
    assert.hasAllKeys(list, [name, 'mock 2']);
  });

  it('should unregister a chat server', function() {
    Registry.unregister(name);
    const list = Registry.get();
    assert.doesNotHaveAnyKeys(list, [name]);
  });

  it('should set a logger', function() {
    let message;
    const Logger = {
      log: function(msg) {
        message = msg;
      },
    };

    Registry.setLogger(Logger);
    Registry.register(name, cpus, rooms, version);
    assert.match(message, /^Added chat server/);
  });

  it('should unregister chat server that has outdated timestamp', function() {
    const list = Registry.get();
    list[name].timestamp = 100000;
    assert.hasAnyKeys(list, [name]);
    Registry.cleanup();
    assert.doesNotHaveAnyKeys(list, [name]);
  });
});
