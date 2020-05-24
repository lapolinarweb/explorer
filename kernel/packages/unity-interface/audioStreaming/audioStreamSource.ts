import { teleportObservable } from 'shared/world/positionThings'

export const audioStreamSource = new Audio()

teleportObservable.add(() => {
  audioStreamSource.pause()
})
