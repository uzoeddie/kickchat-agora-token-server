const axios = require('axios');
const cheerio = require("cheerio");

const news_array_onefootball = [];
const news_array_espn = [];
const news_array_goaldotcom = [];
const news_array_fourfourtwo = [];
const news_array_livescores = [];

const news_websites = [
    "Onefootball",
    "ESPN",
    "GOAL",
    "LiveScores",
    "FourFourtwo"
];

module.exports = {
    async news(req, res) {
        try {
            return res.json(news_websites);
        } catch (error) {
            return res.json(error);
        }
    },

    async onefootballNews(req, res) {
        try {
            const response = await axios.get('https://onefootball.com/en/home');
            const html1 = response.data;
            const $ = cheerio.load(html1);
            $("li", html1).each(function () {
                const title = $(this).find("a").eq(1).find("p").eq(0).text();
                const url =
                "https://onefootball.com" + $(this).find("a").eq(1).attr("href");
                const img = $(this).find("img").attr("src");
        
                if (title !== "") {
                    news_array_onefootball.push({
                        title,
                        url,
                        img,
                        website: 'Onefootball'
                    });
                }
            });
            res.json(news_array_onefootball);
        } catch (error) {
            return res.json(error);
        }
    },

    async espnNews(req, res) {
        try {
            const response = await axios.get('https://www.espn.in/football/');
            const html = response.data;
            const $ = cheerio.load(html);
      
            $("a", html).each(function () {
                const title = $(this).find("h2").text();
                const url = "https://www.espn.in" + $(this).attr("href");
                const img = $(this).find("img").attr("data-default-src");
                if (url.includes("story") && title !== "") {
                    news_array_espn.push({
                        title,
                        url,
                        img,
                        website: 'ESPN'
                    });
                }
            });
            res.json(news_array_espn);
        } catch (error) {
            return res.json(error);
        }
    },

    async goalNews(req, res) {
        try {
            const response = await axios.get('https://www.goal.com/en/news');
            const html = response.data;
            const $ = cheerio.load(html);
            $("li", html).each(function () {
                const wordsToRemove = ["Getty", "Images", "/Goal"];
                const pattern = new RegExp(
                    `^\\s+|(${wordsToRemove.join("|")}|[^a-zA-Z0-9\\s\\-.])`,
                    "gi"
                );
                const url = "https://goal.com" + $(this).find("a").attr("href");
                const title = $(this).find("h3").text();
                const img = $(this).find("img").attr("src");
                const modifiedTitle = title.replace(pattern, "");
        
                if (url.includes("lists") && title !== "") {
                    news_array_goaldotcom.push({
                        url,
                        title: modifiedTitle,
                        img,
                        website: 'GOAL'
                    });
                }
            });
            res.json(news_array_goaldotcom);
        } catch (error) {
            console.log(error);
            return res.json(error);
        }
    },

    async fourfourTwoNews(req, res) {
        try {
            const response = await axios.get('https://www.fourfourtwo.com');
            const html = response.data;
            const $ = cheerio.load(html);
            $(".small", html).each(function (index, element) {
                const url = $(element).find("a").attr("href");
                const title = $(element).find("h3.article-name").text();
                const imgSplitted = $(element).find("img").attr("srcset");
                const news_img = imgSplitted ? imgSplitted.split(" ") : null;
                const img = news_img ? news_img[0] : null;
                const short_desc = $(element).find("p.synopsis").text()?.trim();
                if (!url || !title) {
                    return;
                }
                news_array_fourfourtwo.push({
                    url,
                    title,
                    img,
                    short_desc,
                    website: 'FourFourtwo'
                });
            });
            res.json(news_array_fourfourtwo);
        } catch (error) {
            return res.json(error);
        }
    },

    async livescoresNews(req, res) {
        try {
            const response = await axios.get('https://www.livescore.com/en/news/football/');
            const html = response.data;
            const $ = cheerio.load(html);
            $(".Mi", html).each(function (index, element) {
                const url = `https://www.livescore.com${$(element).find("a").attr("href")}`;
                const title = $(element).find("h2.gl").text();
                const img = $(element).find("img").attr("src");;
                if (!url || !title) {
                    return;
                }
                news_array_livescores.push({
                    url,
                    title,
                    img,
                    website: 'LiveScores'
                });
            });
            res.json(news_array_livescores);
        } catch (error) {
            return res.json(error);
        }
    },
}