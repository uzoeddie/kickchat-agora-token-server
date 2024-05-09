const axios = require('axios');
const cheerio = require("cheerio");
const moment = require("moment");

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
                const shortDesc = $(this).find("a").eq(1).find("p").eq(1).text();
                const url =
                "https://onefootball.com" + $(this).find("a").eq(1).attr("href");
                const img = $(this).find("img").attr("src");
                const time = $(this).find('footer').find('time').text();
                const source = $(this).find("picture").children('source').last().attr("srcset");
        
                if (title !== "") {
                    news_array_onefootball.push({
                        title,
                        url,
                        img: source ? source : img,
                        time,
                        shortDesc,
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
                const shortDesc = $(this).find('p').text();
                const url = "https://www.espn.in" + $(this).attr("href");
                const img = $(this).find("img").attr("data-default-src");
                const time = $(this).find('.contentMeta__timestamp').text();
                if (url.includes("story") && title !== "") {
                    news_array_espn.push({
                        title,
                        url,
                        img,
                        time,
                        shortDesc,
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
                const shortDesc = $(this).find("p.teaser").text();
                const img = $(this).find("img").attr("src");
                const time = $(this).find('footer').find("time").attr("datetime");
                const modifiedTitle = title.replace(pattern, "");
        
                if (url.includes("lists") && title !== "") {
                    news_array_goaldotcom.push({
                        url,
                        title: modifiedTitle,
                        img,
                        time: moment(new Date(time)).format('LL'),
                        shortDesc,
                        website: 'GOAL'
                    });
                }
            });
            res.json(news_array_goaldotcom);
        } catch (error) {
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
                const shortDesc = $(element).find("p.synopsis").text()?.trim();
                const time = $(element).find("time").text();
                if (!url || !title) {
                    return;
                }
                const imgList = img && img.split('.');
                const newImgList = img && imgList[imgList.length - 2].split('-');
                const width = img && newImgList[newImgList.length - 2];
                const newImg = img && img.replace(width, '840');
                news_array_fourfourtwo.push({
                    url,
                    title,
                    img: newImg,
                    time,
                    shortDesc,
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
                const img = $(element).find("img").attr("src");
                const time = $(element).find("a").find("div.nl").text();
                if (!url || !title) {
                    return;
                }
                const imgList = img && img.split('?');
                const newImgList = img && imgList[imgList.length - 1].split('&');
                const operations = img && newImgList[newImgList.length - 3];
                const width = img && newImgList[newImgList.length - 2];
                const replacedHeight = img && img.replace(operations, 'operations=fit(840:)');
                const newImg = img && replacedHeight.replace(width, 'w=840');
                news_array_livescores.push({
                    url,
                    title,
                    img: newImg,
                    time,
                    shortDesc: '',
                    website: 'LiveScores'
                });
            });
            res.json(news_array_livescores);
        } catch (error) {
            return res.json(error);
        }
    },
}