const UserService = require("../service/user");
const crypto = require('crypto');
const request = require('superagent')
require('superagent-charset')(request)
//引入jwt做token验证
const jwt = require('jsonwebtoken')
const token = require("../public/token");
//解析token
const tools = require('../public/tool')

//统一设置token有效时间  为了方便观察，设为10s
const expireTime = 30 * 60 * 1000 + 's'  // token 30分钟过期

const otherConfigs = require('../config/index');

class userController {
    static async create(ctx) {
        let req = ctx.request.body;
        if (req.mobileNo && req.password) {
            try {
                const query = await UserService.getUserInfo(req.mobileNo);
                if (query) {
                    ctx.response.status = 200;
                    ctx.body = {
                        code: '-1',
                        message: "用户已存在"
                    }
                } else {
                    var md5 = crypto.createHash('md5');
                    req.password = md5.update(req.password).digest('hex');
                    const ret = await UserService.createUser(req);
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
    // 小程序登陆
    static async login(ctx) {
        const req = ctx.request.body;
        if(req.type === 'mini'){  // 小程序登录
            if(req.code){
                const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${otherConfigs.AppID}&secret=${otherConfigs.AppSecret}&js_code=${req.code}&grant_type=authorization_code`;
                const res = await request.get(url)
                const data = JSON.parse(res.text)
                const query = await UserService.getUserInfo('', data.openid)
                console.log(query,'--query--')
                const tk = token.signToken({
                    username: '',
                    passWord: data.openid
                });
                if(!query){
                    await UserService.createUser({
                        openId: data.openid,
                    });
                    ctx.response.status = 200;
                    return ctx.body = {
                        code: '0',
                        data: {
                            userId: data.openid,
                            userToken: tk
                        },
                        message: '登陆成功'
                    }
                }
                return ctx.body = {
                    code: '0',
                    data:  {
                        userId: query.openId,
                        userToken: tk
                    },
                    message:'成功'
                }
            }else{
                return ctx.body = {
                    code: '-1',
                    message: 'code不能为空'
                }
            }
        }
    }
    // 获取用户信息(除密码外)
    static async getUserInfo(ctx) {
        console.log(query,'--query--')
        const params = ctx.request.query;
        if (!params.mobileNo) {
            return ctx.body = {
                code: '-1',
                message: '参数错误'
            }
        } else {
            let data = await UserService.getUserInfo(params.mobileNo);
            if (params.mobileNo == data.mobileNo) {
                const info = {
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    mobileNo: data.mobileNo,
                    userId: data.userId
                };
                return ctx.body = {
                    code: '0',
                    data: info,
                    message: '获取用户信息成功'
                }
            }
        }
    }
    static async getUserList(ctx) {
        const params = ctx.request.query;
        try {
            let data = {}
            if (params && params.pageSize && params.pageIndex) {
                data = await UserService.getUserList(params);
            } else {
                data = await UserService.getUserList();
            }

            ctx.response.status = 200;
            return ctx.body = {
                code: '0',
                message: "成功",
                data: data
            }
        } catch (error) {
            ctx.response.status = 200;
            ctx.body = {
                code: '-1',
                message: "失败",
                data: error
            }
        }
    }
    static async delete(ctx) {
        let mobileNo = ctx.params.id;
        if (mobileNo) {
            try {
                const query = await UserService.getUserInfo(mobileNo);
                if (!query) {
                    ctx.response.status = 200;
                    ctx.body = {
                        code: '-1',
                        message: "用户不存在"
                    }
                } else {
                    const ret = await UserService.delete(mobileNo);
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
    static async update(ctx) {
        let req = ctx.request.body;
        if (req.mobileNo) {
            try {
                const query = await UserService.getUserInfo(req.mobileNo);
                if (!query) {
                    ctx.response.status = 200;
                    ctx.body = {
                        code: '-1',
                        message: "信息不存在"
                    }
                } else {
                    const ret = await UserService.update(req);
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
module.exports = userController;