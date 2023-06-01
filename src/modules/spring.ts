function lerp(a: number, b: number, t: number){
  return (b-a)*t+a
}

class spring{
  _position: number
  _target: number
  _speed: number
  _damping: number
  _velocity: number
  _velocityTarget: number

  constructor(position: number, speed: number, damping: number, target?: number) {
    this._position = position
    this._speed = Math.max(speed, 1)
    this._damping = damping
    if (target)
      this._target = target
    else
      this._target = 0
    this._velocity = 0
    this._velocityTarget = 0
  }

  public set target(newTarget: number){
    this._target = newTarget
  }
  public get target(): number {
    return this._target
  }
  
  public set position(newPosition: number) {
    this._position = newPosition
  }
  
  public get position(): number {
    return this._position
  }

  public set speed(newSpeed: number) {
    this._speed = newSpeed
  }
  
  public set damping(newdamping: number) {
    this._damping = newdamping
  }
  
  public update(dt: number) : number {
    const eps = 0.01;

    this._velocityTarget = (this.position - this._target) / -(100/this._speed)
    this._velocity = lerp(this._velocity, this._velocityTarget, 1 - Math.pow(1 / this._damping,dt))
    this._position += this._velocity

    if (Math.abs(this._velocity) <= .05 && Math.abs(this._position) <= .05){
      this._position = this._target
      this._velocity = 0
    }

    return this._position
  }
  
}

export const Spring = spring