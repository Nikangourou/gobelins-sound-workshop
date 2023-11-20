import * as THREE from 'three'
import Scene from './Scene'

export default class Scene_1 extends Scene {
    constructor(scene, renderer, cameraControls, mainScene, callback) {
        super()
        this.name = "scene1"
        this.mainRenderer = renderer
        this.animations = scene.animations
        this.cameraControls = cameraControls
        this.mainScene = mainScene
        this.scene = scene.scene
        this.camera = scene.cameras[0]
        this.cameraMixer = new THREE.AnimationMixer(this.camera)
        this.cameraMouvement = scene.animations[2]
        this.doorMovement = scene.animations[0]
        let curr = this
        this.nextBtn = document.getElementById('next')
        this.cameraMixer.addEventListener( 'finished', function( e ) {
            console.log("finised")
            // transition UI in 
            curr.onSceneIsDone()
            callback()
            
        } )
        this.userStarted = false;
        this.startBtn = document.querySelector('button')
        this.startBtn.addEventListener('click', e => {
            this.userStarted = true;
            this.doorMixer.clipAction(this.doorMovement).paused = false;
            this.cameraMixer.clipAction(this.cameraMouvement).paused = false;
            e.target.style.display = 'none';
        })

        this.nextBtn.addEventListener('click', e => {
            this.nextBtn.style.display = 'none'
            this.hasBeenCompleted = true
            this.cameraMixer.clipAction(this.cameraMouvement).isPaused = false;
        })

        this.cameraEnterMovementIsDone = false
        
    } 
    
    init() {
        this.mainScene.add(this.scene)
        this.cameraControls.setDefaultCamera(this.camera)
        const helper = new THREE.CameraHelper( this.camera );
        this.scene.add(helper)

        this.isActive = true

        this.scene.traverse(e => {
            if(e.isMesh) {
                e.material = new THREE.MeshNormalMaterial()
                if(e.name === 'door') {
                    this.doorMixer = new THREE.AnimationMixer(e)
                }
            }
        })
        
        let testLight = new THREE.AmbientLight( 0xffffff );
        this.scene.add(testLight)
        
        const action = this.cameraMixer.clipAction(this.cameraMouvement);
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce
        action.play()
        action.paused = true
        

        // door
        const openingDoorAnimation = this.doorMixer.clipAction(this.doorMovement)
        openingDoorAnimation.clampWhenFinished = true;
        openingDoorAnimation.loop = THREE.LoopOnce
        openingDoorAnimation.play()
        openingDoorAnimation.paused = true


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
            if(this.cameraMixer && this.userStarted && !this.cameraMixer.clipAction(this.cameraMouvement).isPaused) {
                this.cameraMixer.update(this.time.delta*0.001)
                if(this.cameraMixer.clipAction(this.cameraMouvement).time > 8.4 && !this.cameraEnterMovementIsDone) {
                    this.cameraEnterMovementIsDone = true;
                    this.cameraMixer.clipAction(this.cameraMouvement).isPaused = true
                    this.nextBtn.style.display = 'block'
                }
            }

            if(this.doorMixer && this.userStarted  ) {
                this.doorMixer.update(this.time.delta*0.001)
                // if(this.doorMixer.clipAction(this.doorMovement).time > 
            }
        }
    }
}