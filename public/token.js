const { sign, verify } = require('jsonwebtoken');
const secretKey = "xiaoxiamilovehuluobo";

module.exports = {
  // 获取token
  getToken(ctx) {
    return ctx.request.headers.Authorization || '';
  },

  // 加密
  signToken(userInfo){
    // 定义 secret 密钥
    const token = sign(
      { username: userInfo.username, password: userInfo.password },
      secretKey,
      { expiresIn: '1h' }
    );
    return token;
  },

  // 验签
  verifyToken(token){
    return verify(token, secretKey);
  },
  // 将secretKey返回
  secretKey
}
