import { ILandToLoadableParcelScene } from 'shared/selectors'
import { ILand, LoadableParcelScene } from 'shared/types'
import { loadParcelScene } from 'shared/world/parcelSceneManager'
import { unityInterface } from '../unityInterface/unityInterface'
import { UnityParcelSceneHandler } from '../UnityParcelSceneHandler'
import { unloadCurrentBuilderScene } from './unloadCurrentBuilderScene'
import { globalDCL } from '../globalDCL'

export function loadBuilderScene(sceneData: ILand) {
  unloadCurrentBuilderScene()
  const parcelScene = new UnityParcelSceneHandler(ILandToLoadableParcelScene(sceneData))
  globalDCL.currentLoadedScene = loadParcelScene(parcelScene)
  const target: LoadableParcelScene = { ...ILandToLoadableParcelScene(sceneData).data }
  delete target.land
  unityInterface.LoadParcelScenes([target])
  return parcelScene
}
