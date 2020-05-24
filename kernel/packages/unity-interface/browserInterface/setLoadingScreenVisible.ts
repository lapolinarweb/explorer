import { TeleportController } from 'shared/world/TeleportController'
import { EDITOR } from 'config'

let isThisTheFirstTimeLoading = true

export function setLoadingScreenVisible(shouldShow: boolean) {
  document.getElementById('overlay')!.style.display = shouldShow ? 'block' : 'none'
  document.getElementById('load-messages-wrapper')!.style.display = shouldShow ? 'block' : 'none'
  document.getElementById('progress-bar')!.style.display = shouldShow ? 'block' : 'none'
  if (!shouldShow && !EDITOR && !isThisTheFirstTimeLoading) {
    isThisTheFirstTimeLoading = false
    TeleportController.stopTeleportAnimation()
  }
}
