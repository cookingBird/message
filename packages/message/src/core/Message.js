import { v4 as uuidv4 } from 'uuid'
import { ChainRunner, onMessage } from '../util'
import { cloneDeep } from 'lodash-es'

/**
 * @class
 */
export class Message {
  /**
   * @description 初始化一个Channel
   * @constructor
   * @param {Window | WindowContent} targetWindow
   * @param {MessageOpts} options Channel初始化options
   */
  constructor (targetWindow, options = {}) {
    this.appCode = ''
    this.targetOrigin = options.targetOrigin || '*'
    this.timeout = options.timeout || 3 * 1000
    this.tag = options.namespace || 'gislife'
    /**@description 默认回复响应的拦截器 */
    /**@type ChainRunner<IMessage<IPostMessageSyntax<*>>> */
    this.defaultResponseInterceptor = new ChainRunner()
    /**@description 请求拦截器 */
    /**@type ChainRunner<IPostMessageSyntax<*>> */
    this.requestInterceptor = new ChainRunner()
    this._cancel = this._initResponse()
  }
  /**
   * @description 初始化消息默认回复事件
   * @returns {cancelCallback} 取消默认回复事件
   */
  _initResponse () {
    return onMessage(e => {
      if (e.data?.response === false) {
        console.log(
          'this.defaultResponseInterceptor.run(e.data)',
          this.defaultResponseInterceptor.run(e.data)
        )
        e.source.postMessage(
          { ...this.defaultResponseInterceptor.run(e.data), response: true },
          e.origin
        )
      }
    })
  }
  /**
   * todo 包裹原生消息发生函数，保证消息唯一性,局部性;
   * @description 发送消息
   * @param {IPostMessageSyntax<T>} msg
   * @param {HTMLIFrameElement.contentWindow} target
   * @returns { Promise<IMessage<IPostMessageSyntax<T>>&{response:true}> }
   */
  _postMessage (msg, target) {
    const timeout = msg.timeout || this.timeout
    let isSendOK = false
    if (target) {
      let resolvor, rejector
      const id = uuidv4()
      const cancel = onMessage(res => {
        const { data } = res
        if (data?.id === id && data.belong === this.tag) {
          isSendOK = true
          resolvor(data.data)
          cancel()
        }
      })
      return new Promise((resolve, reject) => {
        resolvor = resolve
        rejector = reject
        /** @type IPostMessageSyntax<*> */
        const res = this.requestInterceptor.run(msg)
        console.log('before send res-----------------', res)
        const data = JSON.stringify(res)
        console.log('before send-----------------', data)
        debugger
        target.postMessage(
          {
            id,
            data,
            belong: this.tag,
            response: false
          },
          '*'
        )
        setTimeout(() => {
          if (!isSendOK) {
            rejector('-----postMessage timeout,target maybe not ready')
            cancel()
          }
        }, timeout)
      })
    } else {
      return Promise.reject('missing target')
    }
  }

  /**
   * todo 发送消息
   * @description 发送消息
   * @param {Window} target
   * @param {IPostMessageSyntax<T>} msg 消息体
   * @returns { Promise<T> } 确认消息发送成功的回调
   */
  send (target, msg) {
    return this._postMessage(msg, target).then(
      res => {
        return res
      },
      err => {
        return Promise.reject(err)
      }
    )
  }
  /**
   * @description 监听消息 只监听接受消息
   * @param {IGenericFunction<IPostMessageSyntax<*>,void>} cb 接收到消息的回调函数
   * @returns {cancelCallback} 取消监听事件的函数
   */
  on (cb) {
    return onMessage(event => {
      if (
        typeof event.data !== 'string' &&
        event.data.type !== 'webpackOk' &&
        !event.data['devtoolsEnabled'] &&
        typeof event.data !== 'object'
      ) {
        console.log('before parse---------------', event.data)
        event.data.data = event.data.data ? JSON.parse(event.data.data) : {}
        if (
          event?.data?.belong === this.tag &&
          event.data?.response === false
        ) {
          console.log(
            'after response---------------------',
            event.data,
            this.appCode
          )
          cb(event.data.data)
        }
      }
    })
  }
  /**
   * 销毁连接器
   */
  destory () {
    this._cancel()
  }
}
