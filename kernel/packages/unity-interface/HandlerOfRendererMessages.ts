import { browserInterfaceType } from './browserInterface/browserInterfaceType'
export type HandlerOfRendererMessages = (type: keyof browserInterfaceType, message: any) => void
