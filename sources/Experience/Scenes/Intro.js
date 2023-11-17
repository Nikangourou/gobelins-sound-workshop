import * as THREE from 'three'
import Scene from './Scene'

export default class Intro extends Scene {
    constructor(scene, renderer, cameraControls, mainScene) {
        super()
        this.mainRenderer = renderer
        this.animations = scene.animations
        this.userStarted = false;
        this.startBtn = document.querySelector('button')
        this.startBtn.addEventListener('click', e => {
            this.userStarted = true;
            this.cameraMixer.clipAction(this.cameraMouvement).paused = false
        })

        this.mainScene = mainScene

        this.scene = scene.scene

        this.camera = scene.cameras[0]
        this.cameraMixer = new THREE.AnimationMixer(this.camera)
        this.cameraMouvement = scene.animations[0]

        cameraControls.setDefaultCamera(this.camera)
    }

    init() {
        const helper = new THREE.CameraHelper( this.camera );
        this.scene.add(helper)
        
        let testLight = new THREE.AmbientLight( 0xffffff );
        this.scene.add(testLight)
        
        const action = this.cameraMixer.clipAction(this.cameraMouvement);
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce
        action.play()
        action.paused = true
        this.isActive = true

        console.log()
    }
    
    update() {
        if(this.cameraMixer && this.userStarted ) {
            this.cameraMixer.update(this.time.delta*0.001)
        }
    }
}