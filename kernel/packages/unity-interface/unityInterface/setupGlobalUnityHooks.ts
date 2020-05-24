import { teleportTriggered } from 'shared/loading/types'
import { teleportObservable } from 'shared/world/positionThings'
import { worldRunningObservable } from 'shared/world/worldState'
import { setLoadingScreenVisible } from 'unity-interface/browserInterface/setLoadingScreenVisible'
import { globalDCL } from '../globalDCL'
import { unityInterface } from './unityInterface'

export function setupGlobalUnityHooks() {
  teleportObservable.add((position: { x: number; y: number; text?: string }) => {
    // before setting the new position, show loading screen to avoid showing an empty world
    setLoadingScreenVisible(true)
    const { globalStore } = globalDCL
    globalStore.dispatch(teleportTriggered(position.text || `Teleporting to ${position.x}, ${position.y}`))
  })

  worldRunningObservable.add((isRunning: boolean) => {
    if (isRunning) {
      setLoadingScreenVisible(false)
    }
  })

  document.addEventListener('pointerlockchange', (e) => {
    if (!document.pointerLockElement) {
      unityInterface.UnlockCursor()
    }
  })
}
