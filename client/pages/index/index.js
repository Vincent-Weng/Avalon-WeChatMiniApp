const lab = require('../../lib/lab');

Page({
    data: {
        labs: [
            { id: 'config', title: '域名检查' },
            { id: 'https', title: 'HTTPS测试' },
            { id: 'session', title: '会话测试' },
            { id: 'websocket', title: 'WebSocket测试' },
            { id: 'avalon', title: '阿瓦隆身份牌'},
            { id: 'vote', title: '阿瓦隆投票'}
        ],
        // done: lab.getFinishLabs()
    },

    // onShow() {
    //     this.setData({ done: lab.getFinishLabs() });
    // },

    // clear() {
    //     lab.clear();
    //     this.setData({ done: lab.getFinishLabs() });
    // }
});