const pup = require("puppeteer");

const pathToExtension = require("path").join(__dirname, "abp_chrome");
const pathToImages = require("path").join(__dirname, "img");
const pathToJson = require("path").join(__dirname, "ads_position");

// List with all switches: https://peter.sh/experiments/chromium-command-line-switches/
const listArgs = [
  "--no-sandbox",
  "--disable-default-app",
  "--disable-sync",
  "--disable-translate",
  "--hide-scrollbars",
  "--mute-audio",
  "--no-first-run",
  "--safebrowsing-disable-auto-update",
  "--ignore-certificate-errors",
  "--ignore-ssl-errors",
  "--disable-gpu",
  "--ignore-certificate-errors-spki-list",
  "--disable-dev-shm-usage",
  `--disable-extensions-except=${pathToExtension}`,
  `--load-extension=${pathToExtension}`,
];

// Helper function to add timeouts
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runner() {
  console.group("Generate image and json file with ads location....");
  const browser = await pup.launch({
    // NOTE: Headless chrome is not loading extensions
    // Ticket: https://bugs.chromium.org/p/chromium/issues/detail?id=706008
    headless: false,
    slowMo: 100,
    defaultViewport: {
      width: 1200,
      height: 1200,
    },
    args: listArgs,
  });
  // Wait 5 seconds for Adblock Plus to initialize and download all needed filter lists
  await sleep(5000);
  console.log("✓  Browser and Adblock initialized");

  // Navigate to test page and load all elements
  const page = await browser.newPage();
  await page.goto(`${process.env.BASE_URL}/2015/07/31/world/mh370-debris-investigation/index.html`, {
    waitUntil: "networkidle2",
  });
  console.log("✓  Navigate to CNN page and waited for loading");

  let height = 0;
  let result = false;
  let counter = 10;

  // Load all the ads scrolling until it is not possible more
  while (counter > 0) {
    height = await page.evaluate("document.body.scrollHeight");
    await page.$eval("#footer-wrap", async (el) => {
      // Scroll until the footer
      el.scrollIntoView(false, { behaviour: "smooth" });
      // Scroll up to trigger the loading of advertisements
      window.scrollBy(0, -el.offsetHeight / 2);
    });
    // Wait 3 seconds to load articles/ads
    // TODO: Improve the method to wait for elements to be visible or load events
    await sleep(3000);
    // Check if the scroll height didn't change (page is not loading more articles/ads)
    result = await page.evaluate(`document.body.scrollHeight === ${height}`);
    if (result) {
      console.log("✓  All the elements (articles/ads) were loaded");
      break;
    } else {
      counter -= 1;
    }
  }
  // Raise error if scrolled more than 10 times and page is still loading
  if (counter === 0) {
    console.error("✗  Failed to load the full page");
    throw "User scroll 10 times the page and still it is loading articles/ads";
  }

  // After page is loaded, get a list of all ads
  const listAds = await page.$x("//*[./a[contains(@onmousedown, 'paid.outbrain.com')]]");
  const date = new Date().toISOString().slice(0, 19);
  let listLocations = [];
  console.log(`✓  Number of ads found ${listAds.length}`);
  for (let ad of listAds) {
    // Modify the CSS of the element for visualization of red rectangles where ads
    await ad.evaluate((elem) => {
      elem.style.borderColor = "red";
      elem.style.borderStyle = "solid";
      elem.style.borderWidth = "5px";
    });
    // Add the dimensions to a list for later create the json file
    listLocations.push(await ad.boundingBox());
  }
  console.log("✓  CSS in ads modified and dimensions recorded");

  // Save JSON file with ads dimensions
  const fs = require("fs");
  fs.writeFile(`${pathToJson}/cnn_ads_${date}.json`, JSON.stringify(listLocations), "utf8", function(err) {
    if (err) throw err;
    console.log(`✓  JSON file created successfully with name "cnn_ads_${date}.json"`);
  });

  // Take screenshot of the full page (ads will be into red borders)
  await page.screenshot({ path: `${pathToImages}/cnn_ads_${date}.png`, fullPage: true });
  console.log(`✓  Screenshot saved "cnn_ads_${date}.png"`);
  await browser.close();
  console.groupEnd();
  process.exit(0);
}

// Run the script and exit if an error happens
try {
  runner();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
