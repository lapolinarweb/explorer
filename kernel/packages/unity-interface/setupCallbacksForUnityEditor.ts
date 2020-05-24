import { DEBUG_MESSAGES } from 'config'
import { defaultLogger } from 'shared/logger'
import { globalDCL } from './globalDCL'
import { UnityBuildInterface } from './unityInterface/UnityBuildInterface'

/**
 * This method is used to connect the Unity Editor to a browser tab with the JavaScript client,
 * using a WebSocket to connect the two.
 */
export function setupCallbacksForUnityEditor(webSocketUrl: string, container: HTMLElement): UnityBuildInterface {
  defaultLogger.info(`Connecting WS to ${webSocketUrl}`)
  container.innerHTML = `<h3>Connecting...</h3>`
  const ws = new WebSocket(webSocketUrl)
  ws.onclose = function (e) {
    defaultLogger.error('WS closed!', e)
    container.innerHTML = `<h3 style='color:red'>Disconnected</h3>`
  }
  ws.onerror = function (e) {
    defaultLogger.error('WS error!', e)
    container.innerHTML = `<h3 style='color:red'>EERRORR</h3>`
  }
  ws.onmessage = function (ev) {
    if (DEBUG_MESSAGES) {
      defaultLogger.info('>>>', ev.data)
    }
    try {
      const m = JSON.parse(ev.data)
      if (m.type && m.payload) {
        const payload = m.type === 'PerformanceReport' ? m.payload : JSON.parse(m.payload)
        try {
          globalDCL.messageHandler(m.type, payload)
        } catch (e) {
          defaultLogger.error(e.message)
        }
      } else {
        defaultLogger.error('Unexpected message: ', m)
      }
    } catch (e) {
      defaultLogger.error(e)
    }
  }
  const gameInstance: UnityBuildInterface = {
    SendMessage(_obj, type, payload) {
      if (ws.readyState === ws.OPEN) {
        const msg = JSON.stringify({ type, payload })
        ws.send(msg)
      }
    },
    SetFullscreen() {
      // stub
    },
  }
  ws.onopen = function () {
    container.classList.remove('dcl-loading')
    defaultLogger.info('WS open!')
    gameInstance.SendMessage('', 'Reset', '')
    container.innerHTML = `<h3  style='color:green'>Connected</h3>`
    globalDCL.DCL.EngineStarted()
  }
  return gameInstance
}
