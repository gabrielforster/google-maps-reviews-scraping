import { Lambda } from "@aws-sdk/client-lambda";
import puppeteer, { HTTPRequest } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

const REVIEWS_URL = "https://www.google.com/maps/rpc/listugcposts";

  type Input = {
  url: string
  placeId: string
}

export async function handler (input: Input) {
  const { url, placeId } = input;
  const filetree = {};

  const walkDirectory = function (path, obj) {
    const dir = fs.readdirSync(path);
    for (let i = 0; i < dir.length; i++) {
      const name = dir[i];
      const target = path + '/' + name;

      const stats = fs.statSync(target);
      if (stats.isFile()) {
        if (name.slice(-3) === '.js') {
          obj[name.slice(0, -3)] = require(target);
        }
      } else if (stats.isDirectory()) {
        obj[name] = {};
        walkDirectory(target, obj[name]);
      }
    }

    walkDirectory('/var/task/', filetree);
    console.log("filetree var tasks", JSON.stringify(filetree, null, 2));

    const fileopt = {}
    walkDirectory('/opt/', fileopt);
    console.log("filetree opt", JSON.stringify(fileopt, null, 2));

  try {
    // const browser = await puppeteer.launch({
    //   headless: "new",
    //   args: ['--lang=en-US,en'],
    //   env: { LANGUAGE: "en_US" },
    // })
   const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

      const page = await browser.newPage();

      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, "language", {
          get: function() {
            return "en-US";
          }
        });
        Object.defineProperty(navigator, "languages", {
          get: function() {
            return ["en-US", "en"];
          }
        });
      });

      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US'
      });

      await page.goto(url);

      await page.waitForSelector("div[role='tablist']");

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
          if (request.url().startsWith(REVIEWS_URL)) {
            reviewsData.push({
              url: request.url(),
              headers: request.headers(),
            })
          }

          request.continue();
        })

        // await page.waitForSelector("button[aria-label='Sort reviews'");
        await page.waitForSelector("button[aria-label='Classificar avaliações'");

          await page.evaluate(async () => {
            // const sortButton = document.querySelector("button[aria-label='Sort reviews'") as HTMLButtonElement | null
            const sortButton = document.querySelector("button[aria-label='Classificar avaliações'") as HTMLButtonElement | null
              if (!sortButton) {
                throw new Error("Sort button not found");
              }

              sortButton.click();

              await new Promise(resolve => setTimeout(resolve, 300));

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

                await new Promise(resolve => setTimeout(resolve, 1000));

                const reviewsWrapper = sortButton.parentElement?.parentElement?.parentElement
                if (!reviewsWrapper) {
                  throw new Error("Reviews wrapper not found");
                }

                let hasChanged = true;

                while (hasChanged) {
                  const currentLastReview = reviewsWrapper.children[8].children[reviewsWrapper.children[8].children.length - 1];

                  reviewsWrapper.scrollTo(0, reviewsWrapper.scrollHeight);

                  await new Promise(resolve => setTimeout(resolve, 2000));

                  const newLastReview = reviewsWrapper.children[8].children[reviewsWrapper.children[8].children.length - 1];

                  hasChanged = currentLastReview !== newLastReview;
                }
          })

          resolveMain();
      })

      const lambda = new Lambda({
        ...(
          process.env.IS_OFFLINE
            ? { region: 'localhost', endpoint: `http://localhost:${process.env.scraperPort}` }
            : {}
        ),
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

