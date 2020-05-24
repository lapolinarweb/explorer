import { MinimapSceneInfo, ProfileForRenderer } from 'decentraland-ecs/src/decentraland/Types'
import { Wearable } from 'shared/profiles/types'
import {
  ChatMessage,
  FriendshipUpdateStatusMessage,
  FriendsInitializationMessage,
  HUDConfiguration,
  HUDElementID,
  InstancedSpawnPoint,
  LoadableParcelScene,
  Notification,
  UpdateUserStatusMessage,
} from 'shared/types'
import { TeleportController } from 'shared/world/TeleportController'
import { globalDCL } from '../globalDCL'
import { unityInterfaceType } from './unityInterfaceType'
import { UpdateUserStatus } from 'dcl-social-client'

export const CHUNK_SIZE = 100

export const unityInterface: unityInterfaceType = {
  debug: false,
  SendGenericMessage(object: string, method: string, payload: string) {
    globalDCL.gameInstance.SendMessage(object, method, payload)
  },
  SetDebug() {
    globalDCL.gameInstance.SendMessage('SceneController', 'SetDebug')
  },
  LoadProfile(profile: ProfileForRenderer) {
    globalDCL.gameInstance.SendMessage('SceneController', 'LoadProfile', JSON.stringify(profile))
  },
  CreateUIScene(data: { id: string; baseUrl: string }) {
    /**
     * UI Scenes are scenes that does not check any limit or boundary. The
     * position is fixed at 0,0 and they are universe-wide. An example of this
     * kind of scenes is the Avatar scene. All the avatars are just GLTFs in
     * a scene.
     */
    globalDCL.gameInstance.SendMessage('SceneController', 'CreateUIScene', JSON.stringify(data))
  },
  /** Sends the camera position & target to the engine */
  Teleport({ position: { x, y, z }, cameraTarget }: InstancedSpawnPoint) {
    const theY = y <= 0 ? 2 : y
    TeleportController.ensureTeleportAnimation()
    globalDCL.gameInstance.SendMessage('CharacterController', 'Teleport', JSON.stringify({ x, y: theY, z }))
    globalDCL.gameInstance.SendMessage(
      'CameraController',
      'SetRotation',
      JSON.stringify({ x, y: theY, z, cameraTarget })
    )
  },
  /** Tells the engine which scenes to load */
  LoadParcelScenes(parcelsToLoad: LoadableParcelScene[]) {
    if (parcelsToLoad.length > 1) {
      throw new Error('Only one scene at a time!')
    }
    globalDCL.gameInstance.SendMessage('SceneController', 'LoadParcelScenes', JSON.stringify(parcelsToLoad[0]))
  },
  UpdateParcelScenes(parcelsToLoad: LoadableParcelScene[]) {
    if (parcelsToLoad.length > 1) {
      throw new Error('Only one scene at a time!')
    }
    globalDCL.gameInstance.SendMessage('SceneController', 'UpdateParcelScenes', JSON.stringify(parcelsToLoad[0]))
  },
  UnloadScene(sceneId: string) {
    globalDCL.gameInstance.SendMessage('SceneController', 'UnloadScene', sceneId)
  },
  SendSceneMessage(messages: string) {
    globalDCL.gameInstance.SendMessage(`SceneController`, `SendSceneMessage`, messages)
  },
  SetSceneDebugPanel() {
    globalDCL.gameInstance.SendMessage('SceneController', 'SetSceneDebugPanel')
  },
  ShowFPSPanel() {
    globalDCL.gameInstance.SendMessage('SceneController', 'ShowFPSPanel')
  },
  HideFPSPanel() {
    globalDCL.gameInstance.SendMessage('SceneController', 'HideFPSPanel')
  },
  SetEngineDebugPanel() {
    globalDCL.gameInstance.SendMessage('SceneController', 'SetEngineDebugPanel')
  },
  // @internal
  SendBuilderMessage(method: string, payload: string = '') {
    globalDCL.gameInstance.SendMessage(`BuilderController`, method, payload)
  },
  ActivateRendering() {
    globalDCL.gameInstance.SendMessage('SceneController', 'ActivateRendering')
  },
  DeactivateRendering() {
    globalDCL.gameInstance.SendMessage('SceneController', 'DeactivateRendering')
  },
  UnlockCursor() {
    globalDCL.gameInstance.SendMessage('MouseCatcher', 'UnlockCursor')
  },
  SetBuilderReady() {
    globalDCL.gameInstance.SendMessage('SceneController', 'BuilderReady')
  },
  AddUserProfileToCatalog(peerProfile: ProfileForRenderer) {
    globalDCL.gameInstance.SendMessage('SceneController', 'AddUserProfileToCatalog', JSON.stringify(peerProfile))
  },
  AddWearablesToCatalog(wearables: Wearable[]) {
    for (let wearable of wearables) {
      globalDCL.gameInstance.SendMessage('SceneController', 'AddWearableToCatalog', JSON.stringify(wearable))
    }
  },
  RemoveWearablesFromCatalog(wearableIds: string[]) {
    globalDCL.gameInstance.SendMessage('SceneController', 'RemoveWearablesFromCatalog', JSON.stringify(wearableIds))
  },
  ClearWearableCatalog() {
    globalDCL.gameInstance.SendMessage('SceneController', 'ClearWearableCatalog')
  },
  ShowNewWearablesNotification(wearableNumber: number) {
    globalDCL.gameInstance.SendMessage('HUDController', 'ShowNewWearablesNotification', wearableNumber.toString())
  },
  ShowNotification(notification: Notification) {
    globalDCL.gameInstance.SendMessage('HUDController', 'ShowNotificationFromJson', JSON.stringify(notification))
  },
  ConfigureHUDElement(hudElementId: HUDElementID, configuration: HUDConfiguration) {
    globalDCL.gameInstance.SendMessage(
      'HUDController',
      `ConfigureHUDElement`,
      JSON.stringify({ hudElementId: hudElementId, configuration: configuration })
    )
  },
  ShowWelcomeNotification() {
    globalDCL.gameInstance.SendMessage('HUDController', 'ShowWelcomeNotification')
  },
  TriggerSelfUserExpression(expressionId: string) {
    globalDCL.gameInstance.SendMessage('HUDController', 'TriggerSelfUserExpression', expressionId)
  },
  UpdateMinimapSceneInformation(info: MinimapSceneInfo[]) {
    for (let i = 0; i < info.length; i += CHUNK_SIZE) {
      const chunk = info.slice(i, i + CHUNK_SIZE)
      globalDCL.gameInstance.SendMessage('SceneController', 'UpdateMinimapSceneInformation', JSON.stringify(chunk))
    }
  },
  AddMessageToChatWindow(message: ChatMessage) {
    globalDCL.gameInstance.SendMessage('SceneController', 'AddMessageToChatWindow', JSON.stringify(message))
  },
  InitializeFriends(initializationMessage: FriendsInitializationMessage) {
    globalDCL.gameInstance.SendMessage('SceneController', 'InitializeFriends', JSON.stringify(initializationMessage))
  },
  UpdateFriendshipStatus(updateMessage: FriendshipUpdateStatusMessage) {
    globalDCL.gameInstance.SendMessage('SceneController', 'UpdateFriendshipStatus', JSON.stringify(updateMessage))
  },
  UpdateUserStatus(status: UpdateUserStatusMessage) {
    globalDCL.gameInstance.SendMessage('SceneController', 'UpdateUserStatus', JSON.stringify(status))
  },
  FriendNotFound(queryString: string) {
    globalDCL.gameInstance.SendMessage('SceneController', 'FriendNotFound', JSON.stringify(queryString))
  },
  UpdateUserPresence(updateMessage: UpdateUserStatus) {},
}
