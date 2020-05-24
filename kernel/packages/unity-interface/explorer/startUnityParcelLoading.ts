import { aborted } from 'shared/loading/ReportFatalError'
import { loadingScenes } from 'shared/loading/types'
import { ILandToLoadableParcelScene } from 'shared/selectors'
import { enableParcelSceneLoading } from 'shared/world/parcelSceneManager'
import { unityInterface } from '../unityInterface/unityInterface'
import { UnityParcelSceneHandler } from '../UnityParcelSceneHandler'
import { globalDCL } from '../globalDCL'

export async function startUnityParcelLoading() {
  globalDCL.globalStore.dispatch(loadingScenes())
  await enableParcelSceneLoading({
    parcelSceneClass: UnityParcelSceneHandler,
    preloadScene: async (_land) => {
      // TODO:
      // 1) implement preload call
      // 2) await for preload message or timeout
      // 3) return
    },
    onLoadParcelScenes: (lands) => {
      unityInterface.LoadParcelScenes(
        lands.map(($) => {
          const x = Object.assign({}, ILandToLoadableParcelScene($).data)
          delete x.land
          return x
        })
      )
    },
    onUnloadParcelScenes: (lands) => {
      lands.forEach(($) => {
        unityInterface.UnloadScene($.sceneId)
      })
    },
    onPositionSettled: (spawnPoint) => {
      if (!aborted) {
        unityInterface.Teleport(spawnPoint)
        unityInterface.ActivateRendering()
      }
    },
    onPositionUnsettled: () => {
      unityInterface.DeactivateRendering()
    },
  })
}
