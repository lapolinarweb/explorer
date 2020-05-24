import { Vector3 } from 'decentraland-ecs/src/decentraland/math'
import { unityInterface } from '../unityInterface/unityInterface'

export function setupBuilderInterface() {
  Object.assign(unityInterface, {
    SelectGizmoBuilder(type: string) {
      this.SendBuilderMessage('SelectGizmo', type)
    },
    ResetBuilderObject() {
      this.SendBuilderMessage('ResetObject')
    },
    SetCameraZoomDeltaBuilder(delta: number) {
      this.SendBuilderMessage('ZoomDelta', delta.toString())
    },
    GetCameraTargetBuilder(futureId: string) {
      this.SendBuilderMessage('GetCameraTargetBuilder', futureId)
    },
    SetPlayModeBuilder(on: string) {
      this.SendBuilderMessage('SetPlayMode', on)
    },
    PreloadFileBuilder(url: string) {
      this.SendBuilderMessage('PreloadFile', url)
    },
    GetMousePositionBuilder(x: string, y: string, id: string) {
      this.SendBuilderMessage('GetMousePosition', `{"x":"${x}", "y": "${y}", "id": "${id}" }`)
    },
    TakeScreenshotBuilder(id: string) {
      this.SendBuilderMessage('TakeScreenshot', id)
    },
    SetCameraPositionBuilder(position: Vector3) {
      this.SendBuilderMessage('SetBuilderCameraPosition', position.x + ',' + position.y + ',' + position.z)
    },
    SetCameraRotationBuilder(aplha: number, beta: number) {
      this.SendBuilderMessage('SetBuilderCameraRotation', aplha + ',' + beta)
    },
    ResetCameraZoomBuilder() {
      this.SendBuilderMessage('ResetBuilderCameraZoom')
    },
    SetBuilderGridResolution(position: number, rotation: number, scale: number) {
      this.SendBuilderMessage(
        'SetGridResolution',
        JSON.stringify({ position: position, rotation: rotation, scale: scale })
      )
    },
    SetBuilderSelectedEntities(entities: string[]) {
      this.SendBuilderMessage('SetSelectedEntities', JSON.stringify({ entities: entities }))
    },
    ResetBuilderScene() {
      this.SendBuilderMessage('ResetBuilderScene')
    },
    OnBuilderKeyDown(key: string) {
      this.SendBuilderMessage('OnBuilderKeyDown', key)
    },
  } as any)
}
