import Player     from './player/index'
import Enemy      from './npc/enemy'
import Bird       from './npc/bird'
import BackGround from './runtime/background'
import GameInfo   from './runtime/gameinfo'
import Music      from './runtime/music'
import DataBus    from './databus'

let ctx   = canvas.getContext('2d')
let databus = new DataBus()

/**
 * 游戏主函数
 */
export default class Main {
  constructor() {
    // 维护当前requestAnimationFrame的id
    this.aniId    = 0
    this.rate = 1
    this.restart()
  }

  restart() {
    databus.reset()
    this.rate = 1
    canvas.removeEventListener(
      'touchstart',
      this.touchHandler
    )

    this.bg       = new BackGround(ctx)
    this.player   = new Player(ctx)
    this.gameinfo = new GameInfo()
    this.music    = new Music()

    this.bindLoop     = this.loop.bind(this)
    this.hasEventBind = false

    // 清除上一局的动画
    window.cancelAnimationFrame(this.aniId);

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }

  /**
   * 随着帧数变化的敌机生成逻辑
   * 帧数取模定义成生成的频率
   */
  enemyGenerate() {
    if ( databus.frame % 30 === 0 ) {
      let enemy = databus.pool.getItemByClass('enemy', Enemy)
      enemy.init(6)
      databus.enemys.push(enemy)
    }

    if (databus.frame % 300 === 0) {
        let bird = databus.pool.getItemByClass('bird', Bird)
        bird.init(3)
        databus.birds.push(bird)
      }

  }

  // 全局碰撞检测
  collisionDetection() {

    

    let that = this

    for ( let i = 0, il = databus.enemys.length; i < il;i++ ) {
      let enemy = databus.enemys[i]
      if ( this.player.isCollideWith(enemy) ) {
          enemy.playAnimation()
          that.music.playExplosion()
          databus.score += 1 * that.rate
          this.player.jump()
          break
      }
    }

    for (let i = 0, il = databus.birds.length; i < il; i++) {
        let bird = databus.birds[i]
        if (this.player.isCollideWith(bird)) {
            bird.playAnimation()
            that.music.playExplosion()
            databus.score *= 2
            that.rate *= 2
            this.player.jump()
            break
          }
      }

  }

  // 游戏结束后的触摸事件处理逻辑
  touchEventHandler(e) {
     e.preventDefault()

    let x = e.touches[0].clientX
    let y = e.touches[0].clientY

    let area = this.gameinfo.btnArea

    if (   x >= area.startX
        && x <= area.endX
        && y >= area.startY
        && y <= area.endY  )
      this.restart()
  }

  /**
   * canvas重绘函数
   * 每一帧重新绘制所有的需要展示的元素
   */
  render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    this.bg.render(ctx)

    databus.enemys
          .forEach((item) => {
              item.drawToCanvas(ctx)
            })
    
    databus.birds.forEach((item)=>{
        item.drawToCanvas(ctx)
    })

    this.player.drawToCanvas(ctx)

    databus.animations.forEach((ani) => {
      if ( ani.isPlaying ) {
        ani.aniRender(ctx)
      }
    })

    this.gameinfo.renderGameScore(ctx, databus.score)

    // 游戏结束停止帧循环
    if ( databus.gameOver ) {
      this.gameinfo.renderGameOver(ctx, databus.score)

      if ( !this.hasEventBind ) {
        this.hasEventBind = true
        this.touchHandler = this.touchEventHandler.bind(this)
        canvas.addEventListener('touchstart', this.touchHandler)
      }
    }
  }

  // 游戏逻辑更新主函数
  update() {
    if ( databus.gameOver )
      return;

    this.bg.update()

    databus.enemys
           .forEach((item) => {
              item.update()
            })
    databus.birds.forEach((item)=>{
        item.update()
    })
    this.player.update()

    this.enemyGenerate()

    this.collisionDetection()
  }

  // 实现游戏帧循环
  loop() {
    databus.frame++

    this.update()
    this.render()

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }
}
