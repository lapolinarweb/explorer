declare const globalThis: { UnityLoader: any } & StoreContainer
declare const global: any

// IMPORTANT! This should be execd before loading 'config' module to ensure that init values are successfully loaded
global.enableWeb3 = true

import { worldToGrid } from 'atomicHelpers/parcelScenePositions'
import { OPEN_AVATAR_EDITOR, SHOW_MESSAGE_OF_THE_DAY, tutorialEnabled, USE_NEW_CHAT } from 'config/index'
import { identity } from 'shared'
import { ReportFatalError } from 'shared/loading/ReportFatalError'
import { AUTH_ERROR_LOGGED_OUT, experienceStarted, FAILED_FETCHING_UNITY, NOT_INVITED } from 'shared/loading/types'
import { signalParcelLoadingStarted, signalRendererInitialized } from 'shared/renderer/actions'
import { StoreContainer } from 'shared/store/rootTypes'
import { HUDElementID } from 'shared/types'
import { lastPlayerPosition, teleportObservable } from 'shared/world/positionThings'
import { startUnityParcelLoading } from 'unity-interface/explorer/startUnityParcelLoading'
import { globalDCL } from 'unity-interface/globalDCL'
import { instantiateUnityRenderer } from 'unity-interface/instantiateUnityRenderer'

const container = document.getElementById('gameContainer')

if (!container) throw new Error('cannot find element #gameContainer')

instantiateUnityRenderer(container)
  .then(async (_) => {
    const i = globalDCL.unityInterface
    i.ConfigureHUDElement(HUDElementID.MINIMAP, { active: true, visible: true })
    i.ConfigureHUDElement(HUDElementID.AVATAR, { active: true, visible: true })
    i.ConfigureHUDElement(HUDElementID.NOTIFICATION, { active: true, visible: true })
    i.ConfigureHUDElement(HUDElementID.AVATAR_EDITOR, { active: true, visible: OPEN_AVATAR_EDITOR })
    i.ConfigureHUDElement(HUDElementID.SETTINGS, { active: true, visible: false })
    i.ConfigureHUDElement(HUDElementID.EXPRESSIONS, { active: true, visible: true })
    i.ConfigureHUDElement(HUDElementID.PLAYER_INFO_CARD, { active: true, visible: true })
    i.ConfigureHUDElement(HUDElementID.AIRDROPPING, { active: true, visible: true })
    i.ConfigureHUDElement(HUDElementID.TERMS_OF_SERVICE, { active: true, visible: true })
    i.ConfigureHUDElement(HUDElementID.TASKBAR, { active: USE_NEW_CHAT, visible: USE_NEW_CHAT })
    i.ConfigureHUDElement(HUDElementID.WORLD_CHAT_WINDOW, { active: USE_NEW_CHAT, visible: true })
    i.ConfigureHUDElement(HUDElementID.FRIENDS, { active: USE_NEW_CHAT && identity.hasConnectedWeb3, visible: false })
    i.ConfigureHUDElement(HUDElementID.OPEN_EXTERNAL_URL_PROMPT, { active: true, visible: true })

    globalThis.globalStore.dispatch(signalRendererInitialized())

    await startUnityParcelLoading()

    globalThis.globalStore.dispatch(signalParcelLoadingStarted())

    if (SHOW_MESSAGE_OF_THE_DAY) {
      i.ConfigureHUDElement(HUDElementID.MESSAGE_OF_THE_DAY, { active: false, visible: !tutorialEnabled() })
    }
    teleportObservable.notifyObservers(worldToGrid(lastPlayerPosition))
    globalThis.globalStore.dispatch(experienceStarted())

    document.body.classList.remove('dcl-loading')
    globalThis.UnityLoader.Error.handler = (error: any) => {
      console['error'](error)
      ReportFatalError(error.message)
    }
  })
  .catch((err) => {
    document.body.classList.remove('dcl-loading')
    if (err.message === AUTH_ERROR_LOGGED_OUT || err.message === NOT_INVITED) {
      ReportFatalError(NOT_INVITED)
    } else {
      console['error']('Error loading Unity', err)
      ReportFatalError(FAILED_FETCHING_UNITY)
    }
  })
