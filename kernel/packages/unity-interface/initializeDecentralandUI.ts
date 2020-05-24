import { getParcelSceneID, loadParcelScene } from 'shared/world/parcelSceneManager'
import { hudWorkerUrl } from 'shared/world/SceneWorker'
import { ensureUiApis } from 'shared/world/uiSceneInitializer'
import { unityInterface } from './unityInterface/unityInterface'
import { UnityScene } from './UnityScene'

/**
 * Set up of a "UI Scene", a global scene formerly used for the chat, now used to display avatars
 */
export async function initializeDecentralandUI() {
  const sceneId = 'dcl-ui-scene'
  const scene = new UnityScene({
    sceneId,
    name: 'ui',
    baseUrl: location.origin,
    main: hudWorkerUrl,
    useFPSThrottling: false,
    data: {},
    mappings: [],
  })
  const worker = loadParcelScene(scene)
  worker.persistent = true
  await ensureUiApis(worker)
  unityInterface.CreateUIScene({ id: getParcelSceneID(scene), baseUrl: scene.data.baseUrl })
}
