======

微信公众平台消息接口服务中间件与API SDK

## 功能列表
- 自动回复（文本、图片、语音、视频、音乐、图文）

## Installation

```sh
$ npm install koa2-wechat
```

## Project reference

使用例子代码在这里
https://github.com/ityao/koa2-antd-sequelizejs-wechat-boilerplate

## Use with koa2

```js
import wechat from 'koa2-wechat';
let config =  {
    token: 'xxxx',
    appid: 'wx662592676e879xxx',
    encodingAESKey: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
}

app.use(wechat(config).middleware(async(ctx)=>{
  // 微信输入信息都在ctx.state.weixin上
  let message = ctx.state.weixin;
  if (message.FromUserName === 'diaosi') {
    // 回复屌丝(普通回复)
    ctx.body = 'hehe';
  } else if (message.FromUserName === 'text') {
    //你也可以这样回复text类型的信息
    ctx.body = {
      content: 'text object',
      type: 'text'
    };
  } else if (message.FromUserName === 'hehe') {
    // 回复一段音乐
    ctx.body = {
      type: "music",
      content: {
        title: "来段音乐吧",
        description: "一无所有",
        musicUrl: "http://mp3.com/xx.mp3",
        hqMusicUrl: "http://mp3.com/xx.mp3"
      }
    };
  } else if (message.FromUserName === 'kf') {
    // 转发到客服接口
    ctx.body = {
      type: "customerService",
      kfAccount: "test1@test"
    };
  } else {
    // 回复高富帅(图文回复)
    ctx.body = [
      {
        title: '你来我家接我吧',
        description: '这是女神与高富帅之间的对话',
        picurl: 'http://nodeapi.cloudfoundry.com/qrcode.jpg',
        url: 'http://nodeapi.cloudfoundry.com/'
      }
    ];
  }
}));
```
备注：token在微信平台的开发者中心申请

### 回复消息
当用户发送消息到微信公众账号，自动回复一条消息。这条消息可以是文本、图片、语音、视频、音乐、图文。详见：[官方文档](http://mp.weixin.qq.com/wiki/index.php?title=发送被动响应消息)

#### 回复文本
```js
ctx.body = 'Hello world!';
// 或者
ctx.body = {type: "text", content: 'Hello world!'};
```
#### 回复图片
```js
ctx.body = {
  type: "image",
  content: {
    mediaId: 'mediaId'
  }
};
```
#### 回复语音
```js
ctx.body = {
  type: "voice",
  content: {
    mediaId: 'mediaId'
  }
};
```
#### 回复视频
```js
ctx.body = {
  type: "video",
  content: {
    mediaId: 'mediaId',
    thumbMediaId: 'thumbMediaId'
  }
};
```
#### 回复音乐
```js
ctx.body = {
  title: "来段音乐吧",
  description: "一无所有",
  musicUrl: "http://mp3.com/xx.mp3",
  hqMusicUrl: "http://mp3.com/xx.mp3"
};
```
#### 回复图文
```js
ctx.body = [
  {
    title: '你来我家接我吧',
    description: '这是女神与高富帅之间的对话',
    picurl: 'http://nodeapi.cloudfoundry.com/qrcode.jpg',
    url: 'http://nodeapi.cloudfoundry.com/'
  }
];
```

#### 回复空串
```js
ctx.body = '';
```

#### 转发到客服接口
```js
ctx.body = {
  type: "customerService",
  kfAccount: "test1@test" //可选
};
```
## Show cases
### Node.js API自动回复

![Node.js API自动回复机器人](http://nodeapi.diveintonode.org/assets/qrcode.jpg)

欢迎关注。

代码：<https://github.com/JacksonTian/api-doc-service>

你可以在[CloudFoundry](http://www.cloudfoundry.com/)、[appfog](https://www.appfog.com/)、[BAE](http://developer.baidu.com/wiki/index.php?title=docs/cplat/rt/node.js)等搭建自己的机器人。

## 详细API
原始API文档请参见：[消息接口指南](http://mp.weixin.qq.com/wiki/index.php?title=消息接口指南)。

## 交流群
QQ群：157964097，使用疑问，开发，贡献代码请加群。进群申请暗号: "Silver好靓仔"
email: 50833@qq.com

## 捐赠
如果您觉得Wechat对您有帮助，欢迎请作者一杯咖啡

![捐赠wechat](https://cloud.githubusercontent.com/assets/327019/2941591/2b9e5e58-d9a7-11e3-9e80-c25aba0a48a1.png)

或者[![](http://img.shields.io/gratipay/JacksonTian.svg)](https://www.gittip.com/JacksonTian/)

## License
The MIT license.