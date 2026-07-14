# Darren's Performance Testing Demo

This project is a practical demonstration of performance testing for a simple web application. It includes a lightweight Node.js + Express web application with static pages and three API endpoints that behave differently (fast, slow, CPU‑intensive), plus JMeter test plans and k6 test scripts for load, stress, spike, and soak testing. The purpose is to show how different load profiles affect a real (though simple) system, and to give you a foundation for writing your own performance tests.

## Background – Why Performance Testing?

Performance testing helps you answer critical questions before your system goes live: Can it handle the expected number of users? What happens when traffic suddenly spikes? Where is the breaking point? Does performance degrade over time due to memory leaks or resource exhaustion? The four most common test types are:

- **Load Test** – verifies the system works under normal concurrent usage.
- **Stress Test** – finds the breaking point by pushing beyond normal limits.
- **Spike Test** – simulates sudden, massive traffic surges (e.g., flash sales, viral events).
- **Soak / Endurance Test** – detects memory leaks or degradation over a long period at steady load.

This demo lets you run all four against a real web server and compare the results.

## Prerequisites

Make sure you have these tools installed on your machine: Node.js (v14 or later) and npm (comes with Node), Apache JMeter (v5.x) – ensure the `jmeter` command is in your PATH or use the full path to the executable, and k6 – available for Windows, macOS, Linux, and as a Docker image. You can download Node.js from nodejs.org, JMeter from jmeter.apache.org, and k6 from k6.io/docs/getting-started/installation.
```cmd
npm -v
node -v
npm install -g npm@latest (to upgrade)

java -version
winget install Microsoft.OpenJDK.21 (if not installed)
if you run java -version in a new window and it doesn't work just add it to the path

setx /M PATH "%PATH%;C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot\bin"

winget install --id=DEVCOM.JMeter -e
winget install k6 --source winget
```

## Project Structure

Your project folder should look like this:

```
├── README.md          <-- this file
├── app/
│   ├── server.js      # Express server
│   ├── package.json   # Node dependencies
│   └── public/        # Static files (HTML, CSS, JS)
│       ├── index.html
│       ├── about.html
│       ├── style.css
│       └── script.js
├── jmeter/
│   ├── load-test.jmx   # Load test plan
│   ├── stress-test.jmx # Stress test plan
│   ├── spike-test.jmx  # Spike test plan
│   └── soak-test.jmx   # Soak test plan
└── k6/
    ├── load-test.js    # Load test script
    ├── stress-test.js  # Stress test script
    ├── spike-test.js   # Spike test script
    └── soak-test.js    # Soak test script
```

The `app/` folder contains the web application – run it with `npm start`. The `jmeter/` folder holds XML test plans, each defining a different load profile. The `k6/` folder holds JavaScript test scripts, each implementing a different load profile using k6's stages API.

## 1. Set Up and Run the Web Application
```cmd
npm install
npm start
http://localhost:3000
```
The application serves static pages and three API endpoints: `GET /api/data` (fast JSON response), `GET /api/slow` (waits 2 seconds before responding), and `GET /api/cpu` (performs a CPU‑intensive loop of 10 million iterations). To start the app, open a terminal, navigate to the `app` folder, run `npm install` to install dependencies, then run `npm start`. The app will be available at `http://localhost:3000`. Open this URL in your browser to verify that the homepage and the "Get Data / Slow / CPU" buttons work. Keep this terminal running while you execute the performance tests.

## 2. Running JMeter Tests

**Run these commands in an Administrator Command Prompt:**

```cmd
set PATH=C:\Windows\System32;%PATH%
set PATH=C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot\bin;%PATH%
set JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot
jmeter -t jmeter/load-test.jmx
```

The provided JMeter test plans (`.jmx` files) each include a Thread Group with specific user counts, ramp‑up times, and loop counts; HTTP Request Defaults pointing to `localhost:3000`; a Random Controller that distributes requests evenly across the four endpoints (`/`, `/api/data`, `/api/slow`, `/api/cpu`); and View Results Tree and Aggregate Report listeners for debugging and metrics.

The test profiles are as follows: `load-test.jmx` (Load Test) uses 50 threads, 30s ramp‑up, 10 loops, no scheduler; `stress-test.jmx` (Stress Test) uses 100 threads, 60s ramp‑up, forever loops, 5 min duration; `spike-test.jmx` (Spike Test) uses 200 threads, 5s ramp‑up, forever loops, 2 min duration; `soak-test.jmx` (Soak Test) uses 30 threads, 30s ramp‑up, forever loops, 30 min duration. You can adjust these values directly in the JMeter GUI or by editing the XML.

To run JMeter in GUI mode (interactive), execute `jmeter -t jmeter/load-test.jmx` and then click the green Start button. You can open other `.jmx` files via File → Open to switch test types. To run JMeter in non‑GUI mode (command line) with an HTML report, first create a results folder with `mkdir -p results`, then run `jmeter -n -t jmeter/load-test.jmx -l results/load-test.jtl -e -o results/load-test-report`. After execution, open `results/load-test-report/index.html` in a browser to see the dashboard. Repeat for other test plans by changing the input filename and output folder accordingly.

## 3. Running k6 Tests
```cmd
cd k6
k6 run load-test.js
```

The k6 scripts are written in JavaScript and use a `stages` array to define the load profile. Each script also includes weighted endpoint selection (so `/api/data` is called twice as often as the others) and a small random `sleep()` to simulate user think time.

The test profiles are: `load-test.js` (Load) – ramp to 50 users over 30s, stay for 2min, ramp down over 30s; `stress-test.js` (Stress) – warm‑up to 10 users over 2min, ramp to 100 over 5min, ramp to 200 over 2min, stay for 3min, ramp down over 2min; `spike-test.js` (Spike) – 20 users for 1min, spike to 300 over 10s, stay for 1min, drop to 20 over 10s, recover for 1min; `soak-test.js` (Soak) – ramp to 30 users over 5min, stay for 1 hour, ramp down over 5min.

To run k6 tests, navigate to the `k6` folder with `cd k6`, then run any script directly with `k6 run load-test.js`. For a JSON output useful for further analysis, use `k6 run --out json=results/load-test.json load-test.js`. Replace `load-test.js` with `stress-test.js`, `spike-test.js`, or `soak-test.js` to run the other tests. Note that the soak test runs for 1 hour – you may want to shorten the duration in the script if you are just experimenting.

## 4. Understanding the Results

In JMeter, the Aggregate Report shows average, min, max, throughput (requests per second), and error percentage for each endpoint. The View Results Tree lets you inspect individual request and response details. The HTML Dashboard provides charts for response times, throughput, and active threads over time. Key metrics to look for are response time (the 95th percentile should be within your SLA), throughput (requests per second), and error rate (should be near zero for load and soak tests).

In k6, after each run the terminal prints a summary with `http_req_duration` (response times – min, avg, max, p90, p95), `http_req_failed` (failure rate), and `http_reqs` (total requests and rate). The built‑in thresholds will fail the test if they are not met – for example, if the error rate exceeds 1% in the load test. You can also output JSON and visualise it with external tools like Grafana.

## 5. Customising the Tests

To add more endpoints, update `server.js` with new routes and then add them to the Random Controller in JMeter or to the `endpoints` array in the k6 scripts. To change user loads, adjust `num_threads` in JMeter or the `stages` array in k6. To modify think time, change the `sleep()` value in k6 or add a Constant Timer or Gaussian Random Timer in JMeter under the Thread Group. To enforce different SLAs, modify the `thresholds` object in k6 or add Response Assertions in JMeter.

## 6. Troubleshooting

If the app won't start because port 3000 is already in use, change the `PORT` variable in `server.js` and update all test scripts to use the new port. If JMeter cannot connect to localhost, ensure the app is running and if you are using a different host, update the `HTTPSampler.domain` in HTTP Request Defaults. If k6 fails with "connection refused", check that the app is running and the port matches. If you run out of memory during stress or spike tests, reduce the number of users or the intensity of the CPU endpoint (lower the loop count in `server.js`). If the JMeter GUI is slow, run in non‑GUI mode for large tests.

## 7. Next Steps

You can integrate these tests into a CI/CD pipeline (e.g., GitHub Actions, Jenkins) to run automatically on every deployment. Use Grafana and Prometheus with k6 to visualise metrics in real time. Extend the app with a database or external API to simulate more realistic scenarios. Experiment with distributed testing using JMeter slaves or k6 cloud or clusters.

This demo is provided "as‑is" for educational purposes. Feel free to use and modify it for your own learning or internal projects. For further details, refer to the official documentation of JMeter (jmeter.apache.org/usermanual) and k6 (k6.io/docs).