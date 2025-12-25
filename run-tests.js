const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');

const PORT = 8080;
const ROOT_DIR = path.resolve(__dirname);

async function runTests() {
  let server;
  let browser;

  try {
    // 1. Start the Express server
    const app = express();
    app.use(express.static(ROOT_DIR));
    
    await new Promise((resolve, reject) => {
        server = app.listen(PORT, (err) => {
            if (err) return reject(err);
            console.log(`Express server started on port ${PORT}`);
            resolve();
        });
    });

    // 2. Launch Puppeteer
    console.log('Launching headless browser...');
    browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    console.log('Browser launched.');

    // Log all browser console messages to Node console
    page.on('console', msg => {
        console.log(`PAGE CONSOLE [${msg.type().toUpperCase()}]:`, msg.text());
    });

    // 4. Create a promise that resolves when QUnit is done
    let qunitDonePromise = new Promise((resolve, reject) => {
      page.exposeFunction('onQunitDone', (details) => {
        resolve(details);
      });
    });

    // 3. Navigate to the test page
    const testUrl = `http://localhost:${PORT}/tests/index.html`;
    console.log(`Navigating to ${testUrl}`);
    await page.goto(testUrl, { waitUntil: 'networkidle0' });
    console.log('Page loaded.');

    // 5. Wait for the QUnit.done promise to resolve
    console.log('Waiting for tests to complete...');
    const qunitResults = await qunitDonePromise;
    console.log('Tests completed.');

    // 6. Log results and determine exit code
    console.log('\n--- Test Results ---');
    console.log(`Total: ${qunitResults.total}`);
    console.log(`Passed: ${qunitResults.passed}`);
    console.log(`Failed: ${qunitResults.failed}`);
    console.log('--------------------\n');

    if (qunitResults.failed > 0) {
      console.error(`${qunitResults.failed} tests failed!`);
      return 1;
    } else {
      console.log('All tests passed!');
      return 0;
    }

  } catch (error) {
    console.error('An error occurred during the test run:', error);
    return 1;
  } finally {
    // 7. Cleanup
    if (browser) {
      await browser.close();
      console.log('Browser closed.');
    }
    if (server) {
      await new Promise(resolve => server.close(resolve));
      console.log('Server stopped.');
    }
  }
}

runTests().then(exitCode => {
  process.exit(exitCode);
});