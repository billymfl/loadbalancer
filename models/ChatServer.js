/* eslint-disable require-jsdoc */
/**
 *
 */
class ChatServer {
  /**
     * @param  {string} name The url of the server. Acts as unique key
     * @param  {int} cpus The number of cpu cores on server
     * @param  {int} rooms The number of active rooms
     * @param {string} version The app version
     * @param {int} timestamp unix timestamp we set for removing outdated servers
     */
  constructor(name, cpus, rooms, version) {
    this.name = name;
    this.cpus = parseInt(cpus);
    this.rooms = parseInt(rooms);
    this.version = version;
    this.timestamp = this._setTimestamp();
    this.capacity = this.cpus - this.rooms;
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
  }

  getCpus() {
    return this.cpus;
  }

  setCpus(cpus) {
    this.cpus = parseInt(cpus);
  }

  getRooms() {
    return this.rooms;
  }

  setRooms(rooms) {
    this.rooms = parseInt(rooms);
  }

  /**
   * @return {int} capacity available on the server
   */
  getCapacity() {
    return this.capacity;
  }

  getVersion() {
    return this.version;
  }

  setVersion(version) {
    this.version = version;
  }

  getTimestamp() {
    return this.timestamp;
  }

  updateTimestamp() {
    this.timestamp = this._setTimestamp();
  }

  updateCapacity() {
    this.capacity = this.cpus - this.rooms;
  }

  _setTimestamp() {
    return Math.floor(new Date() / 1000);
  }
}

module.exports = ChatServer;
