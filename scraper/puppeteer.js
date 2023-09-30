const puppeteer = require('puppeteer');
const fs = require('fs');

function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Set headless to false
  });
  const page = await browser.newPage();

  for (let pageNumber = 17; pageNumber <= 83; pageNumber++) {
    const pageUrl = `https://www.examtopics.com/exams/amazon/aws-certified-solutions-architect-associate-saa-c03/view/${pageNumber}/`;

    // Navigate to the page
    await page.goto(pageUrl);
    //mannual input in case needed
    await delay(9000);

    // Add your logic here to extract data from the current page
    const pageData = await extractDataFromPage(page);

    // Write the accumulated data to a JSON file
    const jsonFileName = `data/exam_data_${pageNumber}.json`;
    fs.writeFileSync(jsonFileName, JSON.stringify(pageData, null, 2));
    console.log(`Data from ${pageData.length} pages has been written to ${jsonFileName}`);
  }

  await browser.close();
})();

async function extractDataFromPage(page) {
  const data = [];

  for (let i = 1; i <= 11; i++) { // Assuming you have 10 questions per page
    const questionXPath = `/html/body/div[2]/div/div[3]/div/div[1]/div[${i}]/div[2]/p[1]`;
    const choicesXPath = [
      `/html/body/div[2]/div/div[3]/div/div[1]/div[${i}]/div[2]/div/ul/li[1]`,
      `/html/body/div[2]/div/div[3]/div/div[1]/div[${i}]/div[2]/div/ul/li[2]`,
      `/html/body/div[2]/div/div[3]/div/div[1]/div[${i}]/div[2]/div/ul/li[3]`,
      `/html/body/div[2]/div/div[3]/div/div[1]/div[${i}]/div[2]/div/ul/li[4]`
    ];

    const question = await page.evaluate((questionXPath) => {
      const element = document.evaluate(questionXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      return element ? element.textContent.trim() : null;
    }, questionXPath);

    const choices = [];

    for (const choiceXPath of choicesXPath) {
      const choice = await page.evaluate((choiceXPath) => {
        const element = document.evaluate(choiceXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        return element ? element.textContent.trim() : null;
      }, choiceXPath);

      try {
        // Remove newline characters and extra spaces
        const cleanedChoice = choice.replace(/\n/g, '').replace(/\s+/g, ' ').trim();
        // Remove "Most Voted" if it exists
        const finalChoice = cleanedChoice.replace('Most Voted', '').trim();
        choices.push(finalChoice);
      }catch(e){
        console.log(choice)
      }
    }

    data.push({ question, choices });
  }
  // Return the extracted data as an object
  return data;
}
