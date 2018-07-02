module.exports = { 
    serverPort: '8765', 

    // 小程序 appId 和 appSecret 
    // 请到 https://mp.weixin.qq.com 获取 AppID 和 AppSecret
    appId: 'wxc75774e4b767b71b', 
    appSecret: '6e36dce2c79546449a256ab6d91dc139', 

    // mongodb 连接配置，生产环境请使用更复杂的用户名密码
    mongoHost: '127.0.0.1', 
    mongoPort: '27017', 
    mongoUser: 'webapp', 
    mongoPass: 'webapp-dev', 
    mongoDb: 'webapp'
};
