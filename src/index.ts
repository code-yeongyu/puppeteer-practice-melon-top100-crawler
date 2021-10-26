import puppeteer from "puppeteer";

interface Song {
  title: string;
  artist: string;
  album: string;
}

interface RankedSong {
  index: number;
  song: Song;
}

/* let's extract melon top 100! */
(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  // browser setup

  await page.goto("https://www.melon.com/chart/index.htm");
  await page.waitForSelector(".rank01");
  // load page

  const textCleaner = (text: string | null) => {
    if (!text) {
      return "";
    }
    text = text.trim();
    text = text.replaceAll("\n", "");
    text = text.replaceAll("\t", "");
    return text;
  };

  await page.exposeFunction("cleanText", (text: string | null) => {
    return textCleaner(text);
  });

  const melonTop100 = await page.evaluate(async () => {
    const songs: RankedSong[] = Array.from(Array(100), () => {
      return { index: -1, song: { title: "", artist: "", album: "" } };
    });

    const songTitleElements = Array.from(
      document.getElementsByClassName("rank01")
    );
    const artistNameElements = Array.from(
      document.querySelectorAll(
        "td:nth-child(6) > div > div > div.ellipsis.rank02 > a"
      )
    );
    const albumNameElements = Array.from(
      document.querySelectorAll("td:nth-child(7) > div > div > div > a")
    );

    return Promise.all(
      songs.map(async (song, index) => {
        const [title, artist, album] = await Promise.all([
          (window as any).cleanText(songTitleElements[index].textContent),
          (window as any).cleanText(artistNameElements[index].textContent),
          (window as any).cleanText(albumNameElements[index].textContent),
        ]);
        return {
          index: index + 1,
          song: {
            title,
            artist,
            album,
          },
        };
      })
    );
  });

  console.log(melonTop100);
})();
