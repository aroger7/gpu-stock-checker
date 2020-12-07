const VIDEO_CARD_PAGE_URL = 'https://www.newegg.ca/p/pl?N=100007708%204814%20601359511%20601357282&cm_sp=Cat_video-Cards_1-_-Visnav-_-Gaming-Video-Cards_2&PageSize=96';
// const VIDEO_CARD_PAGE_URL = 'https://www.newegg.ca/p/pl?N=100007708%204814%20601359511%20601357282&cm_sp=Cat_video-Cards_1-_-Visnav-_-Gaming-Video-Cards_2&PageSize=36';

const getVideoCards = async (opts) => {
  const { page } = opts;
  await page.goto(VIDEO_CARD_PAGE_URL);
  // console.log(await page.evaluate(() => document.body.innerHTML));
  const paginationEls = await page.$$('.list-tool-pagination');
  const bottomPagination = paginationEls && paginationEls[1];
  const paginationButtons = bottomPagination && await bottomPagination.$$(':scope .btn-group-cell');  
  const totalPages = paginationButtons.length || 1;
  
  console.log('Newegg:');
  for (let i = 0; i < totalPages; i++) {
    const recaptcha = await page.$('#g-recaptcha');
    if (recaptcha) {
      console.log('looks like we hit a recaptcha');
    }
    const nextBtn = await page.$('button[title="Next"]:not(:disabled)');
    const itemCells = await page.$$('.item-cell');
    for (const itemCell of itemCells) {
      const titleLink = await itemCell.$(':scope a.item-title');
      const { title, link } = await page.evaluate(titleLink => ({
        title: titleLink.textContent,
        link: titleLink.href
      }), titleLink);
      console.log(`${title} - ${link}`);
    };

    if (nextBtn) {
      await Promise.all([
        nextBtn.click(),
        page.waitForNavigation({ waitUntil: 'domcontentloaded' })
      ]);
    }
  }
};

module.exports = { VIDEO_CARD_PAGE_URL, getVideoCards };