import { stopParcelSceneWorker } from 'shared/world/parcelSceneManager'
import { unityInterface } from '../unityInterface/unityInterface'
import { UnityParcelSceneHandler } from '../UnityParcelSceneHandler'
import { globalDCL } from '../globalDCL'

export function unloadCurrentBuilderScene() {
  if (globalDCL.currentLoadedScene) {
    const parcelScene = globalDCL.currentLoadedScene.parcelScene as UnityParcelSceneHandler
    parcelScene.emit('builderSceneUnloaded', {})
    stopParcelSceneWorker(globalDCL.currentLoadedScene)
    unityInterface.SendBuilderMessage('UnloadBuilderScene', parcelScene.data.sceneId)
    globalDCL.currentLoadedScene = null
  }
}
