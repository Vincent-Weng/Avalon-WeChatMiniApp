"use strict";

require('../../lib/regenerator-runtime');

const regeneratorRuntime = global.regeneratorRuntime;

// 引入 co 和 promisify 帮助我们进行异步处理
const co = require('../../lib/co');
const promisify = require('../../lib/promisify');

// 引入 Wafer 客户端 SDK 支持会话
const wafer = require('../../vendors/wafer-client-sdk/index');

// 简单的小程序 WebSocket 信道封装
const Tunnel = require('../../lib/tunnel');

// 登录接口转成返回 Promise 形式
const login = promisify(wafer.login);

// 获得小程序实例
const app = getApp();

// 设置会话登录地址
wafer.setLoginUrl(`https://${app.config.host}/login`);


// 定义页面
Page({
    data: {
        // 是否已经和服务器连接
        connected: false,

        // 游戏是否进行中
        playing: false,

        // 当前需要展示的游戏信息
        gameInfo: "",
        hintLine1: "",

        // 开始游戏按钮文本
        startButtonText: "开始",

        //「我」的信息，包括昵称、头像和角色
        myName: "",
        myAvatar: null,
        myCharacterInfo: "",

        // 视野中的玩家
        playersInSight: []
    },

    // 页面显示后，开始连接
    onShow: function () {
        this.begin();
    },

    // 进行登录和链接，完成后开始启动游戏服务
    begin: co.wrap(function* () {
        try {
            this.setData({gameInfo: "正在登陆"});
            yield login();

            this.setData({gameInfo: "正在连接"});
            yield this.connect();
        } catch (error) {
            console.error('error on login or connect: ', error);
        }
        this.serve();
    }),

    // 链接到服务器后进行身份识别
    connect: co.wrap(function* () {

        const tunnel = this.tunnel = new Tunnel();
        try {
            yield tunnel.connect(`wss://${app.config.host}/game`, wafer.buildSessionHeader());
        } catch (connectError) {
            console.error({connectError});
            this.setData({gameInfo: "连接错误"});
            throw connectError;
        }
        tunnel.on('close', () => {
            this.setData({
                connected: false,
                gameInfo: "连接已中断"
            });
        });
        this.setData({
            gameInfo: "准备",
            connected: true,
            gameState: 'connected'
        });
        return new Promise((resolve, reject) => {
            // 3 秒后超时
            const timeout = setTimeout(() => reject, 3000);
            tunnel.on('id', ({uname, uid, uavatar}) => {
                this.uid = uid;
                this.setData({
                    myName: uname,
                    myAvatar: uavatar,
                });
                resolve(tunnel);
                clearTimeout(timeout);
            });
        });
    }),

    // 开始进行游戏服务
    serve: co.wrap(function* () {
        const tunnel = this.tunnel;

        // 游戏开始，初始化对方信息，启动计时器
        tunnel.on('start', packet => {
            const otherPlayers = packet.players.filter(user => user.uid !== this.uid);
            const me = packet.players.filter(user => user.uid === this.uid).pop();

            let newArray = [];
            switch (me.character) {
                case "派西维尔" : {
                    for (let ele of otherPlayers) {
                        if ((ele.character === "莫甘娜") || (ele.character === "梅林")) {
                            newArray.push([ele.uname, ele.uavatar]);
                        }
                    }
                    break;
                }
                case "梅林" : {
                    for (let ele of otherPlayers) {
                        if ((ele.character === "莫甘娜") || (ele.character === "刺客") || (ele.character === "莫德雷德的爪牙") || (ele.character === "奥伯伦")) {
                            newArray.push([ele.uname, ele.uavatar]);
                        }
                    }
                    break;
                }
                case "莫甘娜" : {
                    for (let ele of otherPlayers) {
                        if ((ele.character === "刺客") || (ele.character === "莫德雷德的爪牙") || (ele.character === "莫德雷德")) {
                            newArray.push([ele.uname, ele.uavatar]);
                        }
                    }
                    break;
                }
                case "刺客" : {
                    for (let ele of otherPlayers) {
                        if ((ele.character === "莫甘娜") || (ele.character === "莫德雷德的爪牙") || (ele.character === "莫德雷德")) {
                            newArray.push([ele.uname, ele.uavatar]);
                        }
                    }
                    break;
                }
                case "莫德雷德的爪牙" : {
                    for (let ele of otherPlayers) {
                        if ((ele.character === "莫甘娜") || (ele.character === "刺客")) {
                            newArray.push([ele.uname, ele.uavatar]);
                        }
                    }
                    break;
                }
                case "莫德雷德" : {
                    for (let ele of otherPlayers) {
                        if ((ele.character === "莫甘娜") || (ele.character === "刺客")) {
                            newArray.push([ele.uname, ele.uavatar]);
                        }
                    }
                }
            }

            this.data.playersInSight = this.data.playersInSight.concat(newArray);

            // 随机洗牌
            let array = this.data.playersInSight.slice();
            array.sort(function () {
                return 0.5 - Math.random();
            });

            this.setData({
                playing: false,
                done: false,
                finding: true,
                hintLine1: "您视野中的人:",
                gameInfo: "请确认身份",
                myCharacterInfo: me.character,
                playersInSight: array
            });
        });
    }),


    // 点击开始游戏按钮，发送加入游戏请求
    startGame: co.wrap(function* () {
        if (this.data.playing) return;
        if (!this.data.connected) return;

        this.setData({
            playing: false,
            done: false,
            finding: true,
            gameInfo: '正在等待其他玩家...'
        });
        this.tunnel.emit('join');
    })
});
