'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _rawBody = require('raw-body');

var _rawBody2 = _interopRequireDefault(_rawBody);

var _xml2js = require('xml2js');

var _xml2js2 = _interopRequireDefault(_xml2js);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _ejs = require('ejs');

var _ejs2 = _interopRequireDefault(_ejs);

var _wechatCrypto = require('wechat-crypto');

var _wechatCrypto2 = _interopRequireDefault(_wechatCrypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

var wechat = function wechat(config) {
  if (!(this instanceof wechat)) {
    return new wechat(config);
  }
  this.setToken(config);
};

wechat.prototype.setToken = function (config) {
  if (typeof config === 'string') {
    this.token = config;
  } else if ((typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object' && config.token) {
    this.token = config.token;
    this.appid = config.appid || '';
    this.encodingAESKey = config.encodingAESKey || '';
  } else {
    throw new Error('please check your config');
  }
};

var getSignature = function getSignature(timestamp, nonce, token) {
  var shasum = _crypto2.default.createHash('sha1');
  var arr = [token, timestamp, nonce].sort();
  shasum.update(arr.join(''));
  return shasum.digest('hex');
};

var parseXML = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(xml) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt('return', new Promise(function (resolve, reject) {
              _xml2js2.default.parseString(xml, { trim: true }, function (err, json) {
                if (err) reject(err);else resolve(json);
              });
            }));

          case 1:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function parseXML(_x) {
    return _ref.apply(this, arguments);
  };
}();

/*!
 * 将xml2js解析出来的对象转换成直接可访问的对象
 */
var formatMessage = function formatMessage(result) {
  var message = {};
  if ((typeof result === 'undefined' ? 'undefined' : _typeof(result)) === 'object') {
    for (var key in result) {
      if (!(result[key] instanceof Array) || result[key].length === 0) {
        continue;
      }
      if (result[key].length === 1) {
        var val = result[key][0];
        if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') {
          message[key] = formatMessage(val);
        } else {
          message[key] = (val || '').trim();
        }
      } else {
        message[key] = [];
        result[key].forEach(function (item) {
          message[key].push(formatMessage(item));
        });
      }
    }
  }
  return message;
};

/*!
 * 响应模版
 */
var tpl = ['<xml>', '<ToUserName><![CDATA[<%-toUsername%>]]></ToUserName>', '<FromUserName><![CDATA[<%-fromUsername%>]]></FromUserName>', '<CreateTime><%=createTime%></CreateTime>', '<MsgType><![CDATA[<%=msgType%>]]></MsgType>', '<% if (msgType === "news") { %>', '<ArticleCount><%=content.length%></ArticleCount>', '<Articles>', '<% content.forEach(function(item){ %>', '<item>', '<Title><![CDATA[<%-item.title%>]]></Title>', '<Description><![CDATA[<%-item.description%>]]></Description>', '<PicUrl><![CDATA[<%-item.picUrl || item.picurl || item.pic %>]]></PicUrl>', '<Url><![CDATA[<%-item.url%>]]></Url>', '</item>', '<% }); %>', '</Articles>', '<% } else if (msgType === "music") { %>', '<Music>', '<Title><![CDATA[<%-content.title%>]]></Title>', '<Description><![CDATA[<%-content.description%>]]></Description>', '<MusicUrl><![CDATA[<%-content.musicUrl || content.url %>]]></MusicUrl>', '<HQMusicUrl><![CDATA[<%-content.hqMusicUrl || content.hqUrl %>]]></HQMusicUrl>', '</Music>', '<% } else if (msgType === "voice") { %>', '<Voice>', '<MediaId><![CDATA[<%-content.mediaId%>]]></MediaId>', '</Voice>', '<% } else if (msgType === "image") { %>', '<Image>', '<MediaId><![CDATA[<%-content.mediaId%>]]></MediaId>', '</Image>', '<% } else if (msgType === "video") { %>', '<Video>', '<MediaId><![CDATA[<%-content.mediaId%>]]></MediaId>', '<Title><![CDATA[<%-content.title%>]]></Title>', '<Description><![CDATA[<%-content.description%>]]></Description>', '</Video>', '<% } else if (msgType === "transfer_customer_service") { %>', '<% if (content && content.kfAccount) { %>', '<TransInfo>', '<KfAccount><![CDATA[<%-content.kfAccount%>]]></KfAccount>', '</TransInfo>', '<% } %>', '<% } else { %>', '<Content><![CDATA[<%-content%>]]></Content>', '<% } %>', '</xml>'].join('');

/*!
 * 编译过后的模版
 */
var compiled = _ejs2.default.compile(tpl);

var wrapTpl = '<xml>' + '<Encrypt><![CDATA[<%-encrypt%>]]></Encrypt>' + '<MsgSignature><![CDATA[<%-signature%>]]></MsgSignature>' + '<TimeStamp><%-timestamp%></TimeStamp>' + '<Nonce><![CDATA[<%-nonce%>]]></Nonce>' + '</xml>';

var encryptWrap = _ejs2.default.compile(wrapTpl);

/*!
 * 将内容回复给微信的封装方法
 */
var reply = function reply(content, fromUsername, toUsername) {
  var info = {};
  var type = 'text';
  info.content = content || '';
  if (Array.isArray(content)) {
    type = 'news';
  } else if ((typeof content === 'undefined' ? 'undefined' : _typeof(content)) === 'object') {
    if (content.hasOwnProperty('type')) {
      if (content.type === 'customerService') {
        return reply2CustomerService(fromUsername, toUsername, content.kfAccount);
      }
      type = content.type;
      info.content = content.content;
    } else {
      type = 'music';
    }
  }
  info.msgType = type;
  info.createTime = new Date().getTime();
  info.toUsername = toUsername;
  info.fromUsername = fromUsername;
  return compiled(info);
};

var reply2CustomerService = function reply2CustomerService(fromUsername, toUsername, kfAccount) {
  var info = {};
  info.msgType = 'transfer_customer_service';
  info.createTime = new Date().getTime();
  info.toUsername = toUsername;
  info.fromUsername = fromUsername;
  info.content = {};
  if (typeof kfAccount === 'string') {
    info.content.kfAccount = kfAccount;
  }
  return compiled(info);
};

wechat.prototype.middleware = function (handle) {
  var _this = this;

  var that = this;
  if (this.encodingAESKey) {
    that.cryptor = new _wechatCrypto2.default(this.token, this.encodingAESKey, this.appid);
  }

  return function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(ctx, next) {
      var query, encrypted, timestamp, nonce, echostr, method, valid, signature, decrypted, xml, result, formated, encryptMessage, decryptedXML, messageWrapXml, decodedXML, replyMessageXml, wrap;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              query = ctx.query;

              // 加密模式

              encrypted = !!(query.encrypt_type && query.encrypt_type === 'aes' && query.msg_signature);
              timestamp = query.timestamp;
              nonce = query.nonce;
              echostr = query.echostr;
              method = ctx.method;

              if (!(method === 'GET')) {
                _context2.next = 12;
                break;
              }

              valid = false;

              if (encrypted) {
                signature = query.msg_signature;

                valid = signature === that.cryptor.getSignature(timestamp, nonce, echostr);
              } else {
                // 校验
                valid = query.signature === getSignature(timestamp, nonce, that.token);
              }

              if (!valid) {
                ctx.status = 401;
                ctx.body = 'Invalid signature';
              } else {
                if (encrypted) {
                  decrypted = that.cryptor.decrypt(echostr);
                  // TODO 检查appId的正确性

                  ctx.body = decrypted.message;
                } else {
                  ctx.body = echostr;
                }
              }
              _context2.next = 54;
              break;

            case 12:
              if (!(method === 'POST')) {
                _context2.next = 52;
                break;
              }

              if (encrypted) {
                _context2.next = 18;
                break;
              }

              if (!(query.signature !== getSignature(timestamp, nonce, that.token))) {
                _context2.next = 18;
                break;
              }

              ctx.status = 401;
              ctx.body = 'Invalid signature';
              return _context2.abrupt('return');

            case 18:
              _context2.next = 20;
              return (0, _rawBody2.default)(ctx.req, {
                length: ctx.request.length,
                limit: '1mb',
                encoding: ctx.request.charset
              });

            case 20:
              xml = _context2.sent;


              ctx.state.weixin_xml = xml;
              // 解析xml
              _context2.next = 24;
              return parseXML(xml);

            case 24:
              result = _context2.sent;
              formated = formatMessage(result.xml);

              if (!encrypted) {
                _context2.next = 42;
                break;
              }

              encryptMessage = formated.Encrypt;

              if (!(query.msg_signature !== that.cryptor.getSignature(timestamp, nonce, encryptMessage))) {
                _context2.next = 32;
                break;
              }

              ctx.status = 401;
              ctx.body = 'Invalid signature';
              return _context2.abrupt('return');

            case 32:
              decryptedXML = that.cryptor.decrypt(encryptMessage);
              messageWrapXml = decryptedXML.message;

              if (!(messageWrapXml === '')) {
                _context2.next = 38;
                break;
              }

              ctx.status = 401;
              ctx.body = 'Invalid signature';
              return _context2.abrupt('return');

            case 38:
              _context2.next = 40;
              return parseXML(messageWrapXml);

            case 40:
              decodedXML = _context2.sent;

              formated = formatMessage(decodedXML.xml);

            case 42:

              // 挂载处理后的微信消息
              ctx.state.weixin = formated;

              // 取session数据
              /*
               if (this.sessionStore) {
               this.wxSessionId = formated.FromUserName;
               this.wxsession = await this.sessionStore.get(this.wxSessionId);
               if (!this.wxsession) {
               this.wxsession = {};
               this.wxsession.cookie = this.session.cookie;
               }
               }*/

              // 业务逻辑处理
              _context2.next = 45;
              return handle(ctx);

            case 45:
              if (!(ctx.body === '')) {
                _context2.next = 47;
                break;
              }

              return _context2.abrupt('return');

            case 47:
              replyMessageXml = reply(ctx.body, formated.ToUserName, formated.FromUserName);


              if (!query.encrypt_type || query.encrypt_type === 'raw') {
                ctx.body = replyMessageXml;
              } else {
                wrap = {};

                wrap.encrypt = that.cryptor.encrypt(replyMessageXml);
                wrap.nonce = parseInt(Math.random() * 100000000000, 10);
                wrap.timestamp = new Date().getTime();
                wrap.signature = that.cryptor.getSignature(wrap.timestamp, wrap.nonce, wrap.encrypt);
                ctx.body = encryptWrap(wrap);
              }

              ctx.type = 'application/xml';

              _context2.next = 54;
              break;

            case 52:
              ctx.status = 501;
              ctx.body = 'Not Implemented';

            case 54:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    }));

    return function (_x2, _x3) {
      return _ref2.apply(this, arguments);
    };
  }();
};

module.exports = wechat;