import { EventDispatcher } from 'decentraland-rpc/lib/common/core/EventDispatcher'
import { Empty } from 'google-protobuf/google/protobuf/empty_pb'
import { createLogger, defaultLogger, ILogger } from 'shared/logger'
import {
  AttachEntityComponentPayload,
  ComponentCreatedPayload,
  ComponentDisposedPayload,
  ComponentRemovedPayload,
  ComponentUpdatedPayload,
  CreateEntityPayload,
  EntityAction,
  EnvironmentData,
  QueryPayload,
  RemoveEntityPayload,
  SetEntityParentPayload,
  UpdateEntityComponentPayload,
} from 'shared/types'
import { ParcelSceneAPI } from 'shared/world/ParcelSceneAPI'
import { getParcelSceneID } from 'shared/world/parcelSceneManager'
import { SceneWorker } from 'shared/world/SceneWorker'
import { IEventNames, IEvents } from '../decentraland-ecs/src/decentraland/Types'
import {
  PB_AttachEntityComponent,
  PB_ComponentCreated,
  PB_ComponentRemoved,
  PB_ComponentUpdated,
  PB_CreateEntity,
  PB_OpenExternalUrl,
  PB_Query,
  PB_RemoveEntity,
  PB_SendSceneMessage,
  PB_SetEntityParent,
  PB_UpdateEntityComponent,
} from '../shared/proto/engineinterface_pb'
import {
  createEntity,
  removeEntity,
  updateEntityComponent,
  attachEntity,
  removeEntityComponent,
  setEntityParent,
  origin,
  direction,
  ray,
  rayQuery,
  query,
  componentCreated,
  componentDisposed,
  componentUpdated,
  openExternalUrl,
} from './cachedProtobufInstances'
import { unityInterface } from './unityInterface/unityInterface'

/**
 * UnityScene is the class in charge of encoding and decoding messages sent from the worker for the UnityBuild,
 * and the callbacks from the UnityBuild to the Worker. There's one of these instances for each active scene
 */
export class UnityScene<T> implements ParcelSceneAPI {
  eventDispatcher = new EventDispatcher()
  worker!: SceneWorker
  logger: ILogger
  constructor(public data: EnvironmentData<T>) {
    this.logger = createLogger(getParcelSceneID(this) + ': ')
  }
  /**
   * When a batch of actions is received from a webworker, immediately send them to Unity
   */
  sendBatch(actions: EntityAction[]): void {
    const sceneId = getParcelSceneID(this)
    let messages = ''
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i]
      messages += this.encodeSceneMessage(sceneId, action.type, action.payload, action.tag)
      messages += '\n'
    }
    unityInterface.SendSceneMessage(messages)
  }
  registerWorker(worker: SceneWorker): void {
    this.worker = worker
  }
  dispose(): void {
    // TODO: do we need to release some resource after releasing a scene worker?
  }
  on<T extends IEventNames>(event: T, cb: (event: IEvents[T]) => void): void {
    this.eventDispatcher.on(event, cb)
  }
  emit<T extends IEventNames>(event: T, data: IEvents[T]): void {
    this.eventDispatcher.emit(event, data)
  }
  /**
   * Encoding scene messages before sending them to unity
   *
   * TODO (@eordano, @moliva): Move this to workersk
   */
  encodeSceneMessage(parcelSceneId: string, method: string, payload: any, tag: string = ''): string {
    if (unityInterface.debug) {
      defaultLogger.info(parcelSceneId, method, payload, tag)
    }
    let message: PB_SendSceneMessage = new PB_SendSceneMessage()
    message.setSceneid(parcelSceneId)
    message.setTag(tag)
    switch (method) {
      case 'CreateEntity':
        message.setCreateentity(this.encodeCreateEntity(payload))
        break
      case 'RemoveEntity':
        message.setRemoveentity(this.encodeRemoveEntity(payload))
        break
      case 'UpdateEntityComponent':
        message.setUpdateentitycomponent(this.encodeUpdateEntityComponent(payload))
        break
      case 'AttachEntityComponent':
        message.setAttachentitycomponent(this.encodeAttachEntityComponent(payload))
        break
      case 'ComponentRemoved':
        message.setComponentremoved(this.encodeComponentRemoved(payload))
        break
      case 'SetEntityParent':
        message.setSetentityparent(this.encodeSetEntityParent(payload))
        break
      case 'Query':
        message.setQuery(this.encodeQuery(payload))
        break
      case 'ComponentCreated':
        message.setComponentcreated(this.encodeComponentCreated(payload))
        break
      case 'ComponentDisposed':
        message.setComponentdisposed(this.encodeComponentDisposed(payload))
        break
      case 'ComponentUpdated':
        message.setComponentupdated(this.encodeComponentUpdated(payload))
        break
      case 'InitMessagesFinished':
        message.setScenestarted(new Empty()) // don't know if this is necessary
        break
      case 'OpenExternalUrl':
        message.setOpenexternalurl(this.encodeOpenExternalUrl(payload))
        break
    }
    let arrayBuffer: Uint8Array = message.serializeBinary()
    return btoa(String.fromCharCode(...arrayBuffer))
  }
  encodeCreateEntity(createEntityPayload: CreateEntityPayload): PB_CreateEntity {
    createEntity.setId(createEntityPayload.id)
    return createEntity
  }
  encodeRemoveEntity(removeEntityPayload: RemoveEntityPayload): PB_RemoveEntity {
    removeEntity.setId(removeEntityPayload.id)
    return removeEntity
  }
  encodeUpdateEntityComponent(updateEntityComponentPayload: UpdateEntityComponentPayload): PB_UpdateEntityComponent {
    updateEntityComponent.setClassid(updateEntityComponentPayload.classId)
    updateEntityComponent.setEntityid(updateEntityComponentPayload.entityId)
    updateEntityComponent.setData(updateEntityComponentPayload.json)
    return updateEntityComponent
  }
  encodeAttachEntityComponent(attachEntityPayload: AttachEntityComponentPayload): PB_AttachEntityComponent {
    attachEntity.setEntityid(attachEntityPayload.entityId)
    attachEntity.setName(attachEntityPayload.name)
    attachEntity.setId(attachEntityPayload.id)
    return attachEntity
  }
  encodeComponentRemoved(removeEntityComponentPayload: ComponentRemovedPayload): PB_ComponentRemoved {
    removeEntityComponent.setEntityid(removeEntityComponentPayload.entityId)
    removeEntityComponent.setName(removeEntityComponentPayload.name)
    return removeEntityComponent
  }
  encodeSetEntityParent(setEntityParentPayload: SetEntityParentPayload): PB_SetEntityParent {
    setEntityParent.setEntityid(setEntityParentPayload.entityId)
    setEntityParent.setParentid(setEntityParentPayload.parentId)
    return setEntityParent
  }
  encodeQuery(queryPayload: QueryPayload): PB_Query {
    origin.setX(queryPayload.payload.ray.origin.x)
    origin.setY(queryPayload.payload.ray.origin.y)
    origin.setZ(queryPayload.payload.ray.origin.z)
    direction.setX(queryPayload.payload.ray.direction.x)
    direction.setY(queryPayload.payload.ray.direction.y)
    direction.setZ(queryPayload.payload.ray.direction.z)
    ray.setOrigin(origin)
    ray.setDirection(direction)
    ray.setDistance(queryPayload.payload.ray.distance)
    rayQuery.setRay(ray)
    rayQuery.setQueryid(queryPayload.payload.queryId)
    rayQuery.setQuerytype(queryPayload.payload.queryType)
    query.setQueryid(queryPayload.queryId)
    let arrayBuffer: Uint8Array = rayQuery.serializeBinary()
    let base64: string = btoa(String.fromCharCode(...arrayBuffer))
    query.setPayload(base64)
    return query
  }
  encodeComponentCreated(componentCreatedPayload: ComponentCreatedPayload): PB_ComponentCreated {
    componentCreated.setId(componentCreatedPayload.id)
    componentCreated.setClassid(componentCreatedPayload.classId)
    componentCreated.setName(componentCreatedPayload.name)
    return componentCreated
  }
  encodeComponentDisposed(componentDisposedPayload: ComponentDisposedPayload) {
    componentDisposed.setId(componentDisposedPayload.id)
    return componentDisposed
  }
  encodeComponentUpdated(componentUpdatedPayload: ComponentUpdatedPayload): PB_ComponentUpdated {
    componentUpdated.setId(componentUpdatedPayload.id)
    componentUpdated.setJson(componentUpdatedPayload.json)
    return componentUpdated
  }
  encodeOpenExternalUrl(url: any): PB_OpenExternalUrl {
    openExternalUrl.setUrl(url)
    return openExternalUrl
  }
}
