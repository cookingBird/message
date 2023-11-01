import { Channel, stateMap } from './core';
import { getParams, isObject } from './util';
import type { PassiveMsg } from './core/Channel';


export type DataMsg<T = any> = {
  type: string;
  data?: T;
} & Pick<PassiveMsg, 'target'> & Partial<Pick<PassiveMsg, 'sourceCode'>>


export class ApplicationChannel extends Channel {

  constructor(options = {}) {
    super(options)
    this._statePersistence()
  }
  /**
   * @description 发送消息
   */
  public $send(msg: DataMsg) {
    let target
    if (!msg.target || !msg.type) throw Error('message syntax error')
    //todo main parent发送
    if (msg.target === 'main' || msg.target === 'parent') {
      if (window.parent === window && msg.target === 'main') {
        console.warn('can not send message to myself')
        return
      }
      return super.send(window.parent, msg)
    } else {
      if (msg.type === 'setState') {
        //* cache state
        stateMap.set(msg.target, msg.data);
      }
      const targetEl = this.getApp(msg.target)
      if (!targetEl) {
        console.warn(
          `current layer target not exist target named ${msg.target}`
        )
      } else {
        target = targetEl.contentWindow
      }
      return super.send(target, msg)
    }
  }



  /**
   * @description 监听消息
   */
  public $on<T = any>(
    type: string | ((res: { msg: DataMsg<T>, responser: (msg: DataMsg) => void }) => void),
    cb?: (res: { msg: DataMsg<T>, data: T, responser: (msg: DataMsg) => void }) => void) {

    let onCancel
    if (cb && typeof cb !== 'function') {
      throw Error(`$on callback param error,current type is ${typeof cb}`)
    }
    if (typeof type !== 'string' && typeof type !== 'function') {
      throw Error('type parma type error')
    }
    if (typeof type === 'function') {
      onCancel = super.on(msg => {
        const responser = this._getResponse(msg)
        type({ responser, msg: msg as unknown as DataMsg<T> })
      })
      return onCancel
    } else {
      onCancel = super.on(msg => {
        if (msg.type === type) {
          const responser = this._getResponse(msg)
          cb({ data: msg.data, responser, msg: msg as unknown as DataMsg<T> })
        }
      })
    }
    return onCancel
  }

  /**
   * @description send message to parent
   */
  public $emit(emitAndTar: string, data: any) {
    if (!emitAndTar) {
      throw Error('emit is empty')
    }
    const target = emitAndTar.split(":")[1] || 'parent';
    const emitType = emitAndTar.split(":")[0];
    return this.$send({
      target,
      type: emitType,
      data: data
    })
  }
  /**
   * @description send global message
   */
  public $emitAll(event: string, data: any) {
    this.$send({
      target: 'global',
      type: event,
      data: data
    })
  }


  /**
   * @description 接收消息 T为消息的具体格式
   * @template T
   * @param {IGenericFunction<T,any>} cb 接收消息的回调函数
   * @returns {cancelCallback} 取消回调的函数
   */
  public onState(cb) {
    if (typeof cb !== 'function') {
      throw Error(`onState callback param error,current type is ${typeof cb}`)
    }
    this.$send({
      target: 'parent',
      type: 'getState'
    })?.then(cb)
    return this.$on(({ msg }) => {
      if (msg.type === 'setState') {
        cb(msg.data)
      }
    })
  }

  /**
   * @description main
   * @param {Channel} instance
   */
  public applicationBootstrap() {
    if (window.parent !== window) {
      // TODO 获取子应用AppCode
      /**@type ParamsType */
      const params = getParams(window.location)
      // ! 子应用
      this.setAppCode(params.microAppCode)
    } else {
      // ! 主应用
      this.setAppCode('main')
    }
  }
  /**
   * @description AppCode
   * @returns {string} microAppCode
   */
  public getMicroAppCode() {
    return this.appCode
  }

  /**
   * @description 是否是主应用
   * @returns {boolean}
   */
  public isMain() {
    return this.appCode === 'main'
  }

  /**
   * @description maintain state map
   */
  private _statePersistence() {
    this.$on('getState', ({ responser, msg }) => {
      const state = stateMap.get(msg.sourceCode)
      if (state) responser(state)
    })
  }
  /**
  * @description build response msg
  */
  private _getResponse(msg) {
    return data => {
      const responseMsg = {
        target: msg.sourceCode,
        sourceCode: this.appCode,
        popSource: this.appCode,
        type: msg.type,
      };
      let type
      if (isObject(data) && data._type) {
        type = data._type
        delete data._type
      } else {
        type = msg.type
        console.warn(
          `responser miss _type filed, maybe cause infinite loop,current type is ${type}`
        )
      }

      return this.$send({ ...responseMsg, data: data, type: type })
    }
  }
}