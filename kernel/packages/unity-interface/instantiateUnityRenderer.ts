import { CONNECT_TO_UNITY_EDITOR, WEBSOCKET_UNITY_EDITOR_URL } from 'config'
import { initShared } from 'shared'
import { unityClientLoaded, waitingForRenderer } from 'shared/loading/types'
import { StoreContainer } from 'shared/store/rootTypes'
import { browserInterface } from './browserInterface/browserInterface'
import { browserInterfaceType } from './browserInterface/browserInterfaceType'
import { globalDCL } from './globalDCL'
import { HandlerOfRendererMessages } from './HandlerOfRendererMessages'
import { setupCallbacksForUnityBuild } from './setupCallbacksForUnityBuild'
import { setupCallbacksForUnityEditor } from './setupCallbacksForUnityEditor'
import { setupGlobalUnityHooks } from './unityInterface/setupGlobalUnityHooks'
import { UnityBuildInterface } from './unityInterface/UnityBuildInterface'
import { unityInterface } from './unityInterface/unityInterface'
import { unityInterfaceType } from './unityInterface/unityInterfaceType'
import { UnityLoaderType } from './unityInterface/UnityLoaderType'
import { initializeRenderer } from './initializeRenderer'
const rendererVersion = require('decentraland-renderer')

const globalThis: StoreContainer & {
  unityInterface: unityInterfaceType
  browserInterface2: browserInterfaceType
  analytics: any
} = new Function('return this')()

/**
 * A global function defined in the file `static/unity/Build/DCLUnityLoader.js`, part
 * of the Unity Framework. It has some minor modifications to Unity's `UnityLoader.js`,
 * mostly related to how the loading progress bar behaves.
 */
declare var UnityLoader: UnityLoaderType

export type InstantiateUnityResult = {
  lowLevelInterface: UnityBuildInterface
  messageHandler: HandlerOfRendererMessages
}

/**
 * Initialize the UnityBuild and the Kernel in a container
 */
export async function instantiateUnityRenderer(
  container: HTMLElement,
  buildConfigPath: string = 'unity/Build/unity.json'
): Promise<InstantiateUnityResult> {
  /**
   * Step zero: initialize globals
   */
  globalDCL.browserInterface = browserInterface
  globalDCL.unityInterface = unityInterface

  /**
   * First: Setup kernel & user identity
   */
  const session = await initShared()
  if (!session) {
    throw new Error()
  }
  globalDCL.globalStore = globalThis.globalStore

  /**
   * Second: Initialize & connect with the renderer
   */
  setupCallbacksForUnityBuild()
  if (CONNECT_TO_UNITY_EDITOR) {
    globalDCL.gameInstance = setupCallbacksForUnityEditor(WEBSOCKET_UNITY_EDITOR_URL, container)
  } else {
    globalDCL.gameInstance = UnityLoader.instantiate(container, buildConfigPath)
  }

  /**
   * Third: Wait for the renderer to be initialized & set up global values
   */
  globalDCL.globalStore.dispatch(waitingForRenderer())
  await globalDCL.engineInitialized

  window['console'].log('Loaded decentraland-renderer. Version: ' + rendererVersion)

  await initializeRenderer()

  globalDCL.browserInterface = browserInterface
  globalDCL.unityInterface = unityInterface

  /**
   * Fourth: setup some global listeners related to the position & rendering
   */
  setupGlobalUnityHooks()

  /**
   * Fifth: let the store know that the renderer has been loaded
   */
  globalThis.globalStore.dispatch(unityClientLoaded())

  /**
   * Fifth: return required instances to the caller
   */
  return {
    lowLevelInterface: globalDCL.gameInstance,
    messageHandler: globalDCL.messageHandler,
  }
}
