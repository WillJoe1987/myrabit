import Animation from '../base/animation'
import DataBus from '../databus'

const ENEMY_IMG_SRC = 'images/enemy.png'
const ENEMY_WIDTH = 60
const ENEMY_HEIGHT = 60

const __ = {
    speed: Symbol('speed')
}

let databus = new DataBus()

function rnd(start, end) {
    return Math.floor(Math.random() * (end - start) + start)
}

export default class Bird extends Animation {
    constructor() {
        super(ENEMY_IMG_SRC, ENEMY_WIDTH, ENEMY_HEIGHT)

        this.initExplosionAnimation()
    }

    init(speed) {
        this.x = -this.width
        this.y = (window.innerHeight)/2

        this[__.speed] = speed

        this.visible = true
    }

    // 预定义爆炸的帧动画
    initExplosionAnimation() {
        let frames = []

        const EXPLO_IMG_PREFIX = 'images/explosion'
        const EXPLO_FRAME_COUNT = 19

        for (let i = 0; i < EXPLO_FRAME_COUNT; i++) {
            frames.push(EXPLO_IMG_PREFIX + (i + 1) + '.png')
        }

        this.initFrames(frames)
    }

    // 每一帧更新子弹位置
    update() {
        this.x += this[__.speed]
        // 对象回收
        if (this.x > window.innerWidth + this.width)
            databus.removeBird(this)
    }
}
