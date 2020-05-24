import { defaultLogger } from 'shared/logger'
import { browserInterfaceType } from './browserInterface/browserInterfaceType'
import { globalDCL } from './globalDCL'

export function setupCallbacksForUnityBuild() {
  globalDCL.DCL = {
    /**
     * This function gets called by the unity framework when it has finished loading
     */
    EngineStarted: () => {
      if (!globalDCL.gameInstance) {
        throw new Error('There is no UnityBuildInterface')
      }
      globalDCL.engineInitialized.resolve(true)
    },
    /**
     * Entrypoint for all the messages coming from the decentraland-renderer
     */
    MessageFromEngine: (type: keyof browserInterfaceType, jsonEncodedMessage: string) => {
      if (!globalDCL.messageHandler) {
        defaultLogger.error('Message received without initializing engine', type, jsonEncodedMessage)
      }
      if (type === 'PerformanceReport') {
        try {
          globalDCL.messageHandler(type, jsonEncodedMessage)
        } catch (e) {
          defaultLogger.error(e.message)
        }
      } else if (!globalDCL.browserInterface[type]) {
        defaultLogger.info(
          `Unknown message (did you forget to add ${type} to unity-interface/browserInterface.ts?)`,
          type
        )
      } else {
        try {
          ;(globalDCL.browserInterface[type] as any)(JSON.parse(jsonEncodedMessage))
        } catch (e) {
          defaultLogger.error(e.message)
        }
      }
    },
  }
  globalDCL.messageHandler = globalDCL.DCL.MessageFromEngine
}
