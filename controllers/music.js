const MusicService = require("../service/music");
const request = require('superagent')
require('superagent-charset')(request)
const Buffer = require('buffer').Buffer;

class MusicController {
    static async add(ctx) {
        let req = ctx.request.body;
        if (req.category && req.name && req.musicist && req.img && req.content) { 
            try {
                const ret = await MusicService.addMusic(req);
                ctx.response.status = 200;
                ctx.body = {
                    code: '0',
                    message: "成功"
                }
            } catch (err) {
                ctx.response.status = 200;
                ctx.body = {
                    code: '-1',
                    message: "失败",
                    data: err
                }
            }
        } else {
            ctx.response.status = 200;
            ctx.body = {
                code: '-2',
                message: "参数不全"
            }
        }
    }
    static async getList(ctx) {
        const params = ctx.request.query;
        const url = `https://api.oick.cn/api/qrcode?text=8900000000&size=100px&apikey=f53ada68017856597d2021b7ee6c0e42`;
        const res = await request.get(url)
        let data = ''
        console.log(res._body.toString('utf8'),'---------')
        if(res.text){
            data = JSON.parse(res.text)
        } else if(res.redirects && res.redirects.length){
            data = res.redirects
        } else if(res.buffered){
            data = "data:image/png;base64," + Buffer.from(res._body, 'binary').toString('base64')
        }
        ctx.response.status = 200;
        return ctx.body = data
    }
    static async getDetail(ctx) {
        let id = ctx.params.id;
        const query = await MusicService.getMusic(id);
        if (!query) {
            ctx.response.status = 200;
            ctx.body = {
                code: '-1',
                message: "id不存在"
            }
        } else {
            ctx.response.status = 200;
            ctx.body = {
                code: '0',
                message: "成功",
                data: query
            }
        }
    }
    static async delete(ctx) {
        let id = ctx.params.id;
        if (id) {
            try {
                const query = await MusicService.getMusic(id);
                if (!query) {
                    ctx.response.status = 200;
                    ctx.body = {
                        code: '-1',
                        message: "id不存在"
                    }
                } else {
                    const ret = await MusicService.delete(id);
                    ctx.response.status = 200;
                    ctx.body = {
                        code: '0',
                        message: "成功"
                    }
                }
            } catch (err) {
                ctx.response.status = 200;
                ctx.body = {
                    code: '-1',
                    message: "失败",
                    data: err
                }
            }
        } else {
            ctx.response.status = 200;
            ctx.body = {
                code: '-2',
                message: "参数不全"
            }
        }
    }
}
module.exports = MusicController;