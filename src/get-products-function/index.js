
const  { Cluster } = require('puppeteer-cluster');
const { addExtra } = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { performance } = require('perf_hooks');
const axios = require('axios');

const vendors = require('../vendorApis');

const puppeteer = addExtra(require('puppeteer'));
puppeteer.use(StealthPlugin());

const productPageLinks = [
  'https://www.newegg.ca/msi-geforce-rtx-3080-rtx-3080-ventus-3x-10g-oc/p/N82E16814137598',
  'https://www.newegg.ca/msi-geforce-rtx-3080-rtx-3080-gaming-x-trio-10g/p/N82E16814137597',
  'https://www.newegg.ca/msi-geforce-rtx-3070-rtx-3070-ventus-3x-oc/p/N82E16814137601',
  'https://www.newegg.ca/evga-geforce-rtx-3080-10g-p5-3897-kr/p/N82E16814487518',
  'https://www.newegg.ca/asus-geforce-rtx-3080-tuf-rtx3080-10g-gaming/p/N82E16814126453',
  'https://www.newegg.ca/sapphire-radeon-rx-5500-xt-100418nt-8gsel/p/N82E16814202359',
  'https://www.newegg.ca/msi-geforce-rtx-3080-rtx-3080-ventus-3x-10g-oc/p/N82E16814137598',
  'https://www.newegg.ca/msi-geforce-rtx-3080-rtx-3080-gaming-x-trio-10g/p/N82E16814137597',
  'https://www.newegg.ca/msi-geforce-rtx-3070-rtx-3070-ventus-3x-oc/p/N82E16814137601',
  'https://www.newegg.ca/evga-geforce-rtx-3080-10g-p5-3897-kr/p/N82E16814487518',
  'https://www.newegg.ca/asus-geforce-rtx-3080-tuf-rtx3080-10g-gaming/p/N82E16814126453',
  'https://www.newegg.ca/sapphire-radeon-rx-5500-xt-100418nt-8gsel/p/N82E16814202359',
  'https://www.newegg.ca/msi-geforce-rtx-3080-rtx-3080-ventus-3x-10g-oc/p/N82E16814137598',
  'https://www.newegg.ca/msi-geforce-rtx-3080-rtx-3080-gaming-x-trio-10g/p/N82E16814137597',
  'https://www.newegg.ca/msi-geforce-rtx-3070-rtx-3070-ventus-3x-oc/p/N82E16814137601',
  'https://www.newegg.ca/evga-geforce-rtx-3080-10g-p5-3897-kr/p/N82E16814487518',
  'https://www.newegg.ca/asus-geforce-rtx-3080-tuf-rtx3080-10g-gaming/p/N82E16814126453',
  'https://www.newegg.ca/sapphire-radeon-rx-5500-xt-100418nt-8gsel/p/N82E16814202359',
  'https://www.newegg.ca/msi-geforce-rtx-3080-rtx-3080-ventus-3x-10g-oc/p/N82E16814137598',
  'https://www.newegg.ca/msi-geforce-rtx-3080-rtx-3080-gaming-x-trio-10g/p/N82E16814137597'
];

const processProductPage = async (productPage, productPageLink) => {
  let ret = '';
  let t0 = performance.now();
  await productPage.goto(productPageLink, { waitUntil: 'domcontentloaded' });
  let t1 = performance.now();
  const loadTime = t1 - t0;
  t0 = performance.now();
  // await productPage.screenshot({ path: `/mnt/c/Users/cldd5/ss-${productPageLinks.indexOf(productPageLink)}.png` });
  const sellerEl = await productPage.$('.product-seller strong');
  // console.log(sellerEl);
  const sellerText = await productPage.evaluate(sellerEl => sellerEl.textContent, sellerEl);
  console.log(sellerText);
  const productBuyBtnSpan = await productPage.$('.product-buy span.btn');
  const productBuyText = productBuyBtnSpan && await productPage.evaluate(el => el.textContent, productBuyBtnSpan);
  if ((!productBuyText || productBuyText !== 'Sold Out') && sellerText === 'Newegg') {
    const priceDollarsEl = await productPage.$('.price-current strong');
    const priceCentsEl = await productPage.$('.price-current sup');
    const priceDollars = await productPage.evaluate(el => el.textContent, priceDollarsEl);
    const priceCents = await productPage.evaluate(el => el.textContent, priceCentsEl);
    ret = `$${priceDollars}${priceCents} ${productPageLink}`;
  }
  t1 = performance.now();
  const crawlTime = t1 - t0;
  console.log(`${productPageLink} loaded in ${loadTime}ms, crawled in ${crawlTime}ms`);
  return ret;
}

function chunk(array, size) {
  const chunked_arr = [];
  let index = 0;
  while (index < array.length) {
    chunked_arr.push(array.slice(index, size + index));
    index += size;
  }
  return chunked_arr;
}

const getProducts = async () => {
  const t0 = performance.now();

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 2
  });

  await cluster.task(async ({ page, data }) => {
    const { vendor, task } = data;
    await task({ page });
  });

  cluster.queue({ vendor: 'newegg', task: vendors.newegg.getVideoCards });

  await cluster.idle();
  await cluster.close();

  const t1 = performance.now();
  console.log(`${t1 - t0}ms run time`);
  // const res = await fetch('http://httpbin.org/get');
  // const json = await res.json();
  // console.log(json.origin);
  // return json.origin;
  // console.log(res);
};

getProducts();

// exports.handler = async (event, context) => {
//   return await getProducts();
// }