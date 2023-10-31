import { v4 as uuidv4 } from 'uuid'
import { onMessage, isObject } from '../util'

export type BaseMsg = {
  id: string;
  belong: string;
  timeout: number;
  [index: string]: any;
};
export type MessageOps = {
  targetOrigin: string;
  timeout: number;
  namespace: string;
  rejectMissing: boolean;
}
/**
 * @description Message类只提供发送消息和接受消息的方法，只确保发送的消息属于当前命名空间
 */
export class Message {
  protected appCode: string;
  protected targetOrigin: string;
  protected timeout: number;
  protected belong: string;
  protected rejectMissing: boolean;
  constructor(options: Partial<MessageOps> = {}) {
    this.appCode = ''
    this.targetOrigin = options.targetOrigin ?? '*'
    this.timeout = options.timeout ?? 3 * 1000
    this.belong = options.namespace ?? 'gislife'
    this.rejectMissing = options.rejectMissing ?? true
  }
  /**
   * @description 发送消息
   */
  private _postMessage<R = any>(msg: Partial<BaseMsg>, target: Window): Promise<R> {
    const timeout = msg.timeout ?? this.timeout
    let isSendOK = false

    if (!target) {
      throw Error(`_postmessage target not exist, named ${msg.target
        || msg.data.target}, message type is ${msg.type}, source is ${this.appCode}`
      )
    };
    if (!msg) {
      throw Error(`_postmessage msg not exist;`)
    };

    if (msg?.id) {
      try {
        target.postMessage(msg, '*');
        return
      } catch (error) {
        console.error(`response message error`);
      }
    } else {
      const id = uuidv4();
      const sendRes = { id, belong: this.belong, ...msg }
      return new Promise((resolve, reject) => {
        try {
          target.postMessage(sendRes, '*');
        } catch (error) {
          console.error(
            `postMessage error, 
              msg type is ${msg.type},
              target is ${msg.target},
              sourceCode is ${msg.sourceCode}\n`,
            msg.data,
            error
          )
        }
        const cancel = this.__on(data => {
          if (isObject(data) && data.id === id && data.belong === this.belong) {
            isSendOK = true
            cancel()
            resolve(data.data)
          }
        })
        setTimeout(() => {
          if (!isSendOK) {
            cancel()
            if (this.rejectMissing) {
              reject()
            }
          }
        }, timeout)
      })
    };
  }

  /**
   * @description 发送消息
   */
  protected __send<T = any>(target: Window, msg: Partial<BaseMsg>) {
    return this._postMessage<T>(msg, target)
  }
  /**
   * @description 监听消息 只监听当前命名空间的消息,且非回复消息
   */
  protected __on(cb: (msg: BaseMsg) => void) {
    return onMessage(event => {
      if (isObject(event.data) && event.data.belong === this.belong) {
        cb(event.data)
      }
    })
  }
}
