const router = require('koa-router')(),
  cheerio = require('cheerio')
const request = require('superagent')
require('superagent-charset')(request)

const users = require('./users')
const banner = require('./banner')
const music = require('./music')

router.prefix('/api')

router.use('/user', users.routes(), users.allowedMethods())
router.use('/banner', banner.routes(), banner.allowedMethods())
router.use('/music', music.routes(), music.allowedMethods())

// 模拟爬虫

let arr1, arr2, ban;

router.get('/', async (ctx, next) => {
  let url = 'https://www.xxsy.net/';
  request.get(url)
    .charset('utf-8') //当前页面编码格式
    .buffer(true)
    .end((err, data) => { //页面获取到的数据
      let html = data.text;

      let $ = cheerio.load(html, {
        decodeEntities: false,
        ignoreWhitespace: false,
        xmlMode: false,
        lowerCaseTags: false
      }) //用cheerio解析页面数据

      arr1 = [], arr2 = [], ban = [];

      $(".sidebar .text-list li").each((index, element) => {
        arr1.push({
          type: $(element).find('.classify').text().replace('[', '').replace(']', ''),
          name: $(element).find('a').text(),
        });
      });

      $(".extrabar .text-list li").each((index, element) => {
        arr2.push({
          type: $(element).find('.classify').text().replace('[', '').replace(']', ''),
          name: $(element).find('a').text(),
        });
      });

      $(".roasting .roastingslider li").each((index, element) => {
        ban.push({
          src: $(element).find('a img').attr("src"),
        });
      });

    });
  await ctx.render('index', {
    title: '加载成功',
    data: {
      arr1,
      arr2,
      ban
    },
  })

})


router.get('/x', async (ctx, next) => {
  let url = 'https://api.saasexch.com/bapi/fe/usd/sa.gif?project=binance';
  request.get(url)
    .charset('utf-8') //当前页面编码格式
    .buffer(true)
    .end((err, data) => { //页面获取到的数据
      let html = data.text;

      let $ = cheerio.load(html, {
        decodeEntities: false,
        ignoreWhitespace: false,
        xmlMode: false,
        lowerCaseTags: false
      }) //用cheerio解析页面数据

      $(".bn-tab-pane-list .bn-tab-pane").each((index, element) => {
        console.log('element',element)
      });

    });
  await ctx.render('index', {
    title: '加载成功',
    data: {
      
    },
  })

})





module.exports = router
