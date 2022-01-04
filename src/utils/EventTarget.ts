import type { ContactEquation } from '../equations/ContactEquation'
import type { Body } from '../objects/Body'
import type { Shape } from '../shapes/Shape'

type AnyObject = Record<PropertyKey, unknown>

export type TypedEvent<T extends EventType, U = AnyObject> = {
  target?: EventTarget
  type: T
} & U

// export type AddBodyEvent = TypedEvent<'addBody'>
// export type BeginContactEvent = TypedEvent<'beginContact'>
// export type BeginShapeContactEvent = TypedEvent<'beginShapeContact'>
// export type CollideEvent = TypedEvent<'collide'>
// export type EndContactEvent = TypedEvent<'endContact'>
// export type EndShapeContactEvent = TypedEvent<'endShapeContact'>
// export type PostStepEvent = TypedEvent<'postStep'>
// export type PreStepEvent = TypedEvent<'preStep'>
// export type RemoveBodyEvent = TypedEvent<'removeBody'>
// export type SleepEvent = TypedEvent<'sleep'>
// export type SleepyEvent = TypedEvent<'sleepy'>
// export type WakeupEvent = TypedEvent<'wakeup'>

// export type CannonEvent = AddBodyEvent | BeginContactEvent | BeginShapeContactEvent | CollideEvent | EndContactEvent | EndShapeContactEvent | PostStepEvent | PreStepEvent | RemoveBodyEvent | SleepEvent | SleepyEvent | WakeupEvent

type Events = {
  addBody: TypedCallback<'addBody', { body: Body | null }>
  beginContact: TypedCallback<'beginContact', {
    bodyA: Body | null
    bodyB: Body | null
  }>
  beginShapeContact: TypedCallback<'beginShapeContact', {
    bodyA: Body | null
    bodyB: Body | null
    shapeA: Shape | null
    shapeB: Shape | null
  }>
  collide: TypedCallback<'collide', {
    body: Body | null
    contact: ContactEquation | null
  }>
  endContact: TypedCallback<'endContact', {
    bodyA: Body | null
    bodyB: Body | null
  }>
  endShapeContact: TypedCallback<'endShapeContact', {
    bodyA: Body | null
    bodyB: Body | null
    shapeA: Shape | null
    shapeB: Shape | null
  }>
  postStep: TypedCallback<'postStep'>
  preStep: TypedCallback<'preStep'>
  removeBody: TypedCallback<'removeBody', { body: Body | null }>
  sleep: TypedCallback<'sleep'>
  sleepy: TypedCallback<'sleepy'>
  wakeup: TypedCallback<'wakeup'>
}
type TypedCallback<T extends EventType, U = AnyObject> = (event: { event: T, target?: EventTarget } & U) => void

export type EventType = keyof Events

type EventHandler<T extends EventType> = (event: TypedEvent<T>) => void

type CallbackByType<T extends CannonEvent> = {
  [K in T['type']]: T extends { type: K } ? EventHandler<T>[] : never
}

/**
 * Base class for objects that dispatches events.
 */
export class EventTarget {
  private _listeners: { [T in EventType]: Events[T][] } = {
    addBody: [],
    beginContact: [],
    beginShapeContact: [],
    collide: [],
    endContact: [],
    endShapeContact: [],
    removeBody: [],
    postStep: [],
    preStep: [],
    sleep: [],
    sleepy: [],
    wakeup: [],
  }

  /**
   * Add an event listener
   * @return The self object, for chainability.
   */
  addEventListener<T extends EventType>(type: T, listener: Events[T]): EventTarget {
    if (!this._listeners[type].includes(listener)) {
      this._listeners[type].push(listener)
    }
    return this
  }

  /**
   * Check if an event listener is added
   */
  hasEventListener<T extends CannonEvent>(type: T['type'], listener: (event: T) => void): boolean {
    return this._listeners[type].includes(listener)
  }

  /**
   * Check if any event listener of the given type is added
   */
  hasAnyEventListener(type: EventType): boolean {
    return !!this._listeners[type].length
  }

  /**
   * Remove an event listener
   * @return The self object, for chainability.
   */
  removeEventListener(type: EventType, listener: EventHandler): EventTarget {
    const index = this._listeners[type].indexOf(listener)
    if (index !== -1) {
      this._listeners[type].splice(index, 1)
    }
    return this
  }

  /**
   * Emit an event.
   * @return The self object, for chainability.
   */
  dispatchEvent(event: CannonEvent): EventTarget {
    event.target = this
    for (let i = 0; i < this._listeners[event.type].length; i += 1) {
      this._listeners[event.type][i].call(this, event)
    }
    return this
  }
}
