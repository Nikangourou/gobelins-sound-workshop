export default class Transition {
    constructor(delay) {
        this.container = document.getElementById("transition")
        this.img = this.container.children[0]
        this.frameIndex = 0
        this.frameCount = 71
        this.frameRate = 24
        this.animLength = this.frameCount/this.frameRate
        this.speed = 1.0
        this.isDone = false
        this.delay = delay
        //24 images / seconds
    }

    init() {
        this.container.style.display = "block"
        this.img.src = `/assets/paper_animation${this.frameIndex}.png`
        console.log("init is called")
    }

    remove() {
        this.frameIndex = 0;
        this.isDone = false;
        this.container.style.display = "none"
    }

    play() {
        
        if(this.frameIndex < this.frameCount && !this.isDone ) {
            this.frameIndex += 1
            this.img.src = `/assets/paper_animation${this.frameIndex}.png`
        }

        if(!this.isDone && this.frameIndex > this.frameCount) {
            this.isDone = true
        }


    }
}