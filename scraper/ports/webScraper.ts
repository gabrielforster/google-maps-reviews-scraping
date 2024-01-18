import https from 'node:https';
import { ScheduledEvent, Context } from 'aws-lambda';
import puppeteer, { HTTPRequest } from 'puppeteer';

const url = "https://www.google.com/maps/place/Catholic+University+of+Santa+Catarina/@-26.4669318,-49.1178055,17z/data=!4m8!3m7!1s0x94de940dbec22f4d:0xf2864ccc867a7dc1!8m2!3d-26.4669366!4d-49.1152252!9m1!1b1!16s%2Fg%2F122bxtf4?entry=ttu";

const reviewsDataUrl = "https://www.google.com/maps/rpc/listugcposts";

export async function run (event: ScheduledEvent, context: Context) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--lang=en-US,en'],
  }) 

  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'languages', {
      get: function () {
        return ['en-US', 'en', 'bn'];
      },
    });
  });

  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US'
  });

  await page.goto(url);
  const pageTitle = await page.title();

  await page.evaluate(() => {
    const buttonsWrapper = document.querySelector("div[role='tablist']")
    if (!buttonsWrapper) {
      throw new Error("Buttons wrapper not found");
    }

    // const button = Array.from(buttonsWrapper.children)
    //   .find(button => button.innerHTML.includes("Reviews")) as HTMLButtonElement | null

    const button = Array.from(buttonsWrapper.children)[1] as HTMLButtonElement | null

    if (!button) {
      throw new Error("Reviews button not found");
    }

    button.click();
  })

  const reviewsCount = await page.evaluate(() => {
    const wrapper = Array.from(document.getElementsByClassName("fontBodySmall"))

    return wrapper[0].innerHTML.split(" ")[0];

    // const reviewsText = wrapper.find((element) => element.innerHTML.includes("reviews"))
    // if (!reviewsText) {
    //   throw new Error("Reviews text not found");
    // }
    //
    // const [count] = reviewsText.innerHTML.split(" ");
    // return count;

  });

  const reviewsData: any[] = [];

  await new Promise<void>(async (resolveMain) => {
    page.setRequestInterception(true);


    page.on('request', (request: HTTPRequest) => {
      if (request.url().startsWith(reviewsDataUrl)) {
        reviewsData.push({
          url: request.url(),
          headers: request.headers(),
        })
      }

      request.continue();
    })

    await page.evaluate(async () => {
      // const sortButton = document.querySelector("button[aria-label='Sort reviews'") as HTMLButtonElement | null
      const sortButton = document.querySelector("button[aria-label='Classificar avaliações'") as HTMLButtonElement | null
      if (!sortButton) {
        throw new Error("Sort button not found");
      }

      sortButton.click();

      await new Promise(resolve => setTimeout(resolve, 250));

      const optionsMenu = document.querySelector("div[id='action-menu'")
      if (!optionsMenu) {
        throw new Error("Options menu not found");
      }

      const mostRelevantOption = Array.from(optionsMenu.children)
        // .find(element => element.innerHTML.includes("Most relevant")) as HTMLButtonElement | null
        .find(element => element.innerHTML.includes("Mais relevantes")) as HTMLButtonElement | null
      if (!mostRelevantOption) {
        throw new Error("Most relevant option not found");
      }

      mostRelevantOption.click();

      const reviewsWrapper = sortButton.parentElement?.parentElement?.parentElement
      if (!reviewsWrapper) {
        throw new Error("Reviews wrapper not found");
      }

      let hasChanged = true;

      while (hasChanged) {
        const currentLastReview = reviewsWrapper.children[8].children[reviewsWrapper.children[8].children.length - 1];

        reviewsWrapper.scrollTo(0, reviewsWrapper.scrollHeight);

        await new Promise(resolve => setTimeout(resolve, 1500));

        const newLastReview = reviewsWrapper.children[8].children[reviewsWrapper.children[8].children.length - 1];

        hasChanged = currentLastReview !== newLastReview;
      }

    })

    resolveMain();
  })

  console.log(reviewsData);
};
