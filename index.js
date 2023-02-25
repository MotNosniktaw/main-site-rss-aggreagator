const express = require("express");
const dotenv = require("dotenv");
const RSSParser = require("rss-parser");
const { DateTime } = require("luxon");

dotenv.config();

const parser = new RSSParser();
const urls = [
  "https://martinfowler.com/bliki/bliki.atom",
  "http://feeds.feedburner.com/ScottHanselman",
  "https://devops.com/feed/",
];

const app = express();
const port = process.env.port ?? 80;

app.get("/", async (req, res) => {
  const result = await checkRss();

  const output = [];

  result.forEach((feed) => {
    feed.items.forEach((item) => {
      output.push({
        feedTitle: feed.title,
        feedLink: feed.link,
        author: item.author ?? item.creator,
        date: item.isoDate ?? item.pubDate,
        link: item.link,
        content: item.content,
        contentSnippet: item.contentSnippet,
      });
    });
  });

  const sortedArray = output.sort((a, b) => {
    const dateA = DateTime.fromISO(a.date);
    const dateB = DateTime.fromISO(b.date);

    return dateA.toMillis() > dateB.toMillis() ? -1 : 1;
  });

  res.send(sortedArray);
  return;
});

const checkRss = async () => {
  return await Promise.all(
    urls.map(async (url) => {
      try {
        return await parser.parseURL(url);
      } catch (e) {
        console.log({ e });
        return null;
      }
    })
  );
};

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
