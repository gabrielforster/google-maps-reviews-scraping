import { Lambda } from "@aws-sdk/client-lambda";
import puppeteer, { HTTPRequest } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const REVIEWS_URL = "https://www.google.com/maps/rpc/listugcposts";

  const lambda = new Lambda({
  ...(
    process.env.IS_OFFLINE
      ? { region: 'localhost', endpoint: `http://localhost:${process.env.scraperPort}` }
      : {}
  ),
})


type Input = {
  url: string
  placeId: string
}

export async function handler (input: Input) {
  const { url, placeId } = input;

  try {
    const path = process.env.IS_OFFLINE
      ? undefined
      : "/opt/nodejs/node_modules/@sparticuz/chromium/bin"

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(path),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
      protocolTimeout: 450_000,
    });

    const page = await browser.newPage();

    await page.goto(url);

    await page.waitForSelector("div[role='tablist']");

    await page.evaluate(() => {
      const buttonsWrapper = document.querySelector("div[role='tablist']")
      if (!buttonsWrapper) {
        throw new Error("Buttons wrapper not found");
      }

      const button = Array.from(buttonsWrapper.children)[1] as HTMLButtonElement | null

      if (!button) {
        throw new Error("Reviews button not found");
      }

      button.click();
    })

    const reviewsData: any[] = [];

    await new Promise<void>(async (resolveMain) => {
      page.setRequestInterception(true);


      page.on('request', (request: HTTPRequest) => {
        if (request.url().startsWith(REVIEWS_URL)) {
          reviewsData.push({
            url: request.url(),
            headers: request.headers(),
          })
        }

        request.continue();
      })

      await page.waitForSelector("button[aria-label='Classificar avaliações'");

      await page.evaluate(async () => {
        const sortButton = document.querySelector("button[aria-label='Classificar avaliações'") as HTMLButtonElement | null
        if (!sortButton) {
          throw new Error("Sort button not found");
        }

        sortButton.click();

        await new Promise(resolve => setTimeout(resolve, 5000));

        const optionsMenu = document.querySelector("div[id='action-menu'")
        if (!optionsMenu) {
          throw new Error("Options menu not found");
        }

        const mostRelevantOption = Array.from(optionsMenu.children)
          .find(element => element.innerHTML.includes("Mais relevantes")) as HTMLButtonElement | null
        if (!mostRelevantOption) {
          throw new Error("Most relevant option not found");
        }

        mostRelevantOption.click();

        await new Promise(resolve => setTimeout(resolve, 500));

        const reviewsWrapper = document.querySelector("div[role='main']")?.children[1]
        if (!reviewsWrapper) {
          throw new Error("Reviews wrapper not found");
        }

        let hasChanged = true;

        while (hasChanged) {
          const currentLastReview = reviewsWrapper.children[8].children[reviewsWrapper.children[8].children.length - 1];

          reviewsWrapper.scrollTo(0, reviewsWrapper.scrollHeight);

          await new Promise(resolve => setTimeout(resolve, 6000));

          const newLastReview = reviewsWrapper.children[8].children[reviewsWrapper.children[8].children.length - 1];

          hasChanged = currentLastReview !== newLastReview;
        }
      })

      resolveMain();
    })

    await lambda.invoke({
      FunctionName: 'scraper-api-mapper',
      InvocationType: 'Event',
      Payload: JSON.stringify({
        data: reviewsData,
        placeId
      }),
    });
  } catch (error) {
    console.info("failed", {
      placeId,
      url
    });

    console.error(error);
  }
};

