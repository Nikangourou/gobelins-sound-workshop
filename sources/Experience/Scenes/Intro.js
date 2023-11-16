import * as THREE from 'three'
import Scene from './Scene'

export default class Intro extends Scene {
    constructor(scene) {
        super()
        this.animations = scene.animations
        this.userStarted = false;
        this.startBtn = document.querySelector('button')
        this.startBtn.addEventListener('click', e => {
            this.userStarted = true;
        })

        this.scene = scene.scene
        this.camera = scene.cameras[0]
        this.cameraMixer = new THREE.AnimationMixer(this.camera)
        this.cameraMouvement = scene.animations[0]
    }

    init() {
    
        const helper = new THREE.CameraHelper( this.camera );
        this.scene.add(helper)
        
        let testLight = new THREE.AmbientLight( 0xffffff );
        this.scene.add(testLight)
        
        // this.camera.rotation.x = Math.PI*2;
        // console.log(this.animations[0])
        // console.log("mixer", this.cameraMixer)
        
        const action = this.cameraMixer.clipAction(this.cameraMouvement);
        action.play()
        action.paused = true
        this.isActive = true
    }
    
    update() {
        if(this.cameraMixer && this.userStarted ) {
            this.cameraMixer.update(this.time.delta*0.0005)
            console.log("action", this.cameraMixer.clipAction(this.cameraMouvement))
            // console.log(this.cameraMixer.time)
        }
    }
}