import puppeteer from "puppeteer";
import cleanText from "./utils/cleanText";
import { Song, RankedSong } from "./types/song";

interface SongSelector extends Song {
  table: string;
  rank: string;
}

class MelonTop100Crawler {
  private readonly CHART_URL = "https://www.melon.com/chart/index.htm";
  private browser: puppeteer.Browser | undefined;
  private page: puppeteer.Page | undefined;
  ranking: RankedSong[] = [];

  getSelectors(): SongSelector {
    return {
      table: "#frm > div > table > tbody > tr",
      rank: ".rank",
      title: ".rank01",
      artist: ".rank02 > a",
      album: ".rank03",
    };
  }

  async load() {
    this.browser = await puppeteer.launch({
      headless: false,
      args: ["--start-maximized"],
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 900 });
    await this.page.goto(this.CHART_URL);
    await this.page.waitForSelector(".rank01");
  }

  async crawl() {
    await this.page?.exposeFunction("cleanText", cleanText);
    await this.page?.exposeFunction("getSelectors", this.getSelectors);

    const ranking: RankedSong[] | undefined = await this.page?.evaluate(
      async () => {
        const selector = await (window as any).getSelectors();
        const songElements = Array.from(
          document.querySelectorAll(selector.table)
        );

        const ranking = await Promise.all(
          songElements.map(async (songs) => {
            const song: Song = {
              title: await (window as any).cleanText(
                songs.querySelector(selector.title).textContent
              ),
              artist: await (window as any).cleanText(
                songs.querySelector(selector.artist).textContent
              ),
              album: await (window as any).cleanText(
                songs.querySelector(selector.album).textContent
              ),
            };
            const rankString = await (window as any).cleanText(
              songs.querySelector(selector.rank).textContent
            );
            const rank = parseInt(rankString, 10);

            const rankedSong: RankedSong = {
              rank,
              song,
            };
            return rankedSong;
          })
        );

        return ranking;
      }
    );

    this.ranking = ranking ? ranking : [];
  }
}

/* let's extract melon top 100! */
(async () => {
  const crawler = new MelonTop100Crawler();
  await crawler.load();
  await crawler.crawl();

  console.log(crawler.ranking);
})();
