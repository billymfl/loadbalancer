const ChatServer = require('./ChatServer');
const _ = require('underscore');
/**
 * Registry class
 */
class Registry {
  /**
   * @param  {object} logger
   */
  constructor() {
    this.logger;
    this.servers = {};
    this.timeout = 30;
  }

  /**
   * @param  {object} logger
   */
  setLogger(logger) {
    this.logger = logger;
  }
  /**
   * A chat server is registering or sending up a heartbeat
   * @param  {string} name
   * @param  {int} cpus
   * @param  {int} rooms
   * @param  {string} version
   */
  register(name, cpus, rooms, version) {
    this.cleanup();
    let chatServer;
    if (!this.servers[name]) {
      chatServer = new ChatServer(name, cpus, rooms, version);
      this.servers[name] = chatServer;
      if (this.logger) {
        this.logger.log(`Added chat server ${name}`);
      }
    } else {
      chatServer = this.servers[name];
      chatServer.updateTimestamp();
      chatServer.setCpus(cpus);
      chatServer.setRooms(rooms);
      chatServer.updateCapacity();
      if (this.logger) {
        this.logger.log(`Updated chat server ${name}`);
      }
    }
  }

  /**
   * A chat server is shutting down
   * @param  {string} name
   */
  unregister(name) {
    delete this.servers[name];
    if (this.logger) {
      this.logger.log(`Unregistered ${name}`);
    }
  }

  /**
   * Delete chat servers that haven't sent us a heartbeat
   */
  cleanup() {
    const now = Math.floor(new Date() / 1000);
    let chatServer;
    Object.keys(this.servers).forEach((name) => {
      chatServer = this.servers[name];
      if (chatServer.getTimestamp() + this.timeout < now) {
        this.unregister(name);
      }
    });
  }

  /**
     * get returns servers
     * @return {object}
     */
  get() {
    return this.servers;
  }

  /**
   * @return {string} server info in html table format
   */
  getFormatted() {
    // eslint-disable-next-line max-len
    let html = `<b>Now:</b>' ${new Date()}
  <br/><br/>
  <table width='100%' style='text-align:left'>
  <thead>
    <th>Server</th>  
    <th>CPUs</th>  
    <th>Rooms</th> 
    <th>Capacity</th>  
    <th>Timestamp</th>
  </thead>
  <tbody>`;

    // eslint-disable-next-line prefer-const
    let server;
    Object.keys(this.servers).forEach((name) => {
      server = this.servers[name];
      html += `<tr><td>${server.name}</td> 
      <td>${server.cpus}</td> 
      <td>${server.rooms}</td> 
      <td>${server.capacity}</td> 
      <td>${server.timestamp}</td>
      </tr>`;
    });

    html += `</tbody>
    </table>
    <script>setTimeout(function() { window.location.reload() }, 10000);</script>`;

    return html;
  }

  /** Least loaded for a version is server with the most capacity
   * @param  {string} version
   * @return {string} The url (name) of least loaded server for requested version, or empty
   */
  getLeastLoaded(version) {
    const sorted = _.sortBy(this.servers, 'capacity').reverse();
    // eslint-disable-next-line prefer-const
    for (let server of sorted) {
      if (server.version === version) {
        return server.name;
      }
    }
    return '';
  }
}

module.exports = new Registry(); // Singleton
