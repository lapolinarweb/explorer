import { ILandToLoadableParcelSceneUpdate } from 'shared/selectors'
import { ILand, LoadableParcelScene } from 'shared/types'
import { globalDCL } from '../globalDCL'
import { unityInterface } from '../unityInterface/unityInterface'

export function updateBuilderScene(sceneData: ILand) {
  if (globalDCL.currentLoadedScene) {
    const target: LoadableParcelScene = { ...ILandToLoadableParcelSceneUpdate(sceneData).data }
    delete target.land
    unityInterface.UpdateParcelScenes([target])
  }
}
