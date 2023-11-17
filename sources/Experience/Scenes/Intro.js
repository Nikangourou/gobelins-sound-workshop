import * as THREE from 'three'
import Scene from './Scene'

export default class Intro extends Scene {
    constructor(scene, renderer, cameraControls, mainScene, callback) {
        super()
        this.mainRenderer = renderer
        this.animations = scene.animations
        this.cameraControls = cameraControls
        this.mainScene = mainScene
        this.scene = scene.scene
        this.camera = scene.cameras[0]
        this.cameraMixer = new THREE.AnimationMixer(this.camera)
        this.cameraMouvement = scene.animations[0]
        this.cameraMixer = new THREE.AnimationMixer(this.camera)
        let curr = this
        this.cameraMixer.addEventListener( 'finished', function( e ) {
            console.log("finised")
            curr.onSceneIsDone()
            callback()
            
        } )
        this.userStarted = false;
        this.startBtn = document.querySelector('button')
        this.startBtn.addEventListener('click', e => {
            this.userStarted = true;
            this.cameraMixer.clipAction(this.cameraMouvement).paused = false;
            e.target.style.display = 'none';
        })
        
    }
    
    init() {
        this.mainScene.add(this.scene)
        this.cameraControls.setDefaultCamera(this.camera)
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

    }

    onSceneIsDone() {
        this.isActive = false
        this.hasBeenCompleted = true
        
        // remove scene from main scene
        let toBeRemoved = null
        this.mainScene.traverse(e => {
            if(e.name === "Scene") {
                toBeRemoved = e
            }
        })
        this.mainScene.remove(toBeRemoved)
       
    }
    
    update() {
        if(this.isActive) {
            if(this.cameraMixer && this.userStarted ) {
                this.cameraMixer.update(this.time.delta*0.001)
            }
        }
    }
}