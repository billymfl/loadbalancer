# Loadbalancer

Loadbalancer is a Node.js microservice used by chat servers. Chat servers register with the LB and when someone creates a chat room the LB returns the least loaded chat server to use. 

Chat servers (another repo) create rooms by forking a separate process. The least loaded chat server is the one with the lowest number of rooms (available cpu cores).


## Installation

If running locally, use npm to install the dependencies. Before starting the app a SSL cert/key must be provided in the keys/ folder. [Generate these keys](https://flaviocopes.com/express-https-self-signed-certificate/) for local testing. The default listening port is 80.

(all commands assume you are in the loadbalancer directory)

```bash
npm install
KEY=<secret-key> npm start
```

Running the tests (uses Mocha and Chai)

```bash
npm test
```

Running in a Docker container, build the loadbalancer image
```bash
docker build loadbalancer:2.0 .
```

Start an instance of the app
```bash
docker run --rm -p 80:80 -e "KEY=<YOUR_KEY>" loadbalancer:2.0
```

Accessing at https://0.0.0.0:80 via browser or

```bash
curl --insecure https://0.0.0.0:80/
```

will return app name and version number.

## Usage
All config settings are set via environment variables. The only required env var is the secret KEY to be used. This is the key the chat servers send in the X-API-Key header for authenticating. See [env.example](env.example) for the full list of env variables that can be setup.

The app can be run in a containerized environment (Docker) and the default logging is to console/stdout, which follows the [12-factor app](https://12factor.net/) methodology. A service like Splunk running in another container can be used (via HTTP Event Collector) for ingestion/search/archival of log data. 

If running the app locally for testing the logger can be set to log4js to write to a local log file. There is also an option to directly log to Splunk.

#### Examples

Running in Docker and having Splunk ingest log data.

Create a docker network so loadbalancer and splunk can communicate

```bash
docker create network lb_micro
```

Pull down [Splunk image](https://hub.docker.com/r/splunk/splunk/)
```bash
docker pull splunk/splunk
```

Run splunk instance (and set a SPLUNK_PWD)
```bash
docker run -d -p 8000:8000 -p 8088:8088 -e "SPLUNK_START_ARGS=--accept-license" -e "SPLUNK_PASSWORD=<SPLUNK_PWD>" --name splunk --network lb_micro splunk/splunk:latest

```

Setup a HTTP Data Collector (HEC) in Splunk

1) Log into Splunk at http://localhost:8000, using admin:<SPLUNK PWD> you setup
2) Settings > Data Input 
3) Select Http Event Collector
4) Select Global Settings, click 'Enable', enable 'SSL', default 8088 port.
5) Click 'New Token', enter a name, click 'Next' and again all the way to 'Submit'. Copy the token value shown on that final screen. This is the <SPLUNK_TOKEN>.

Run loadbalancer instance from the already built image (and set a KEY for the lb and enter the SPLUNK_TOKEN from the above step)
```bash
docker run --rm -p 80:80 -e "KEY=<KEY>" --name lb --network lb_micro --log-driver=splunk --log-opt splunk-token=<SPLUNK_TOKEN> --log-opt splunk-url=https://0.0.0.0:8088 --log-opt splunk-insecureskipverify=true loadbalancer:2.0
```

Registering a server on the loadbalancer
```bash
curl --insecure -X PUT -H "X-API-Key: <KEY>" https://0.0.0.0:80/register/http%3A%2F%2Fwww.testing.com/26/10/1.1
```

Should get response of
```json
{"status":"ok","message":"Registered http://www.testing.com"}
```

Viewing list of registered servers
```bash
curl --insecure -H "X-API-Key: <KEY>" https://0.0.0.0:80/info/json
```

Result (if above curl is issued within 30 seconds):
```json
{"status":"ok","message":{"http://www.testing.com":{"name":"http://www.testing.com","cpus":26,"rooms":10,"version":"1.1","timestamp":1565722700,"capacity":16}}}
```
Note: Servers that don't send a heartbeat within a certain time period are cleaned up after 30 seconds.

## License

This project is licensed under the [MIT license.](LICENSE)
