import { DEBUG, EDITOR, ENGINE_DEBUG_PANEL, SCENE_DEBUG_PANEL, SHOW_FPS_COUNTER } from '../config'
import { setLoadingScreenVisible } from './browserInterface/setLoadingScreenVisible'
import { initializeDecentralandUI } from './initializeDecentralandUI'
import { unityInterface } from './unityInterface/unityInterface'

/**
 * Common (builder, explorer, preview) initialization logic for the unity engine
 */
export async function initializeRenderer(): Promise<boolean> {
  setLoadingScreenVisible(true)
  unityInterface.DeactivateRendering()

  if (DEBUG) {
    unityInterface.SetDebug()
  }
  if (SCENE_DEBUG_PANEL) {
    unityInterface.SetSceneDebugPanel()
  }
  if (SHOW_FPS_COUNTER) {
    unityInterface.ShowFPSPanel()
  }
  if (ENGINE_DEBUG_PANEL) {
    unityInterface.SetEngineDebugPanel()
  }
  if (!EDITOR) {
    await initializeDecentralandUI()
  }
  return true
}
