import * as THREE from 'three'
import Scene from './Scene'

export default class Scene_2 extends Scene {
    constructor(scene, renderer, cameraControls, mainScene, callback) {
        super()
        this.name = "scene2"
        this.mainRenderer = renderer
        this.animations = scene.animations
        this.cameraControls = cameraControls
        this.mainScene = mainScene
        this.scene = scene.scene
        this.camera = scene.cameras[0]
        this.cameraMixer = new THREE.AnimationMixer(this.camera)
        this.cameraMouvement = scene.animations[3]
        this.cameraMixer.addEventListener( 'finished', function( e ) {
            console.log("finised")
            // transition UI in 
            curr.onSceneIsDone()
            callback()
            
        } )
        this.nextBtn = document.getElementById('next')
        this.nextBtn.addEventListener('click', e => {
            this.nextBtn.style.display = 'none'
            this.hasBeenCompleted = true
            this.cameraMixer.clipAction(this.cameraMouvement).paused = false;
        })

        this.userHasClickedBox = false
        
        this.userClickedBox = document.getElementById('userClickedBox')
        this.userClickedBox.addEventListener('click', e => {
            this.userClickedBox.style.display = 'none'
            this.userClickedBox = true
            this.boxMixer.clipAction(this.boxFalling).paused = false
    
            // trigger box falling anim

        })


        this.rugAnimation = scene.animations[0]
        this.boxFalling = scene.animations[1]
      
        let curr = this
        this.cameraMixer.addEventListener( 'finished', function( e ) {
            console.log("scene 2 is finised")
            curr.onSceneIsDone()
            callback()
        } )
    }
    
    init() {
        this.mainScene.add(this.scene)
        this.cameraControls.setDefaultCamera(this.camera)
        const helper = new THREE.CameraHelper( this.camera );
        this.scene.add(helper)
       
        this.userClickedBox.style.display = "block"

        this.isActive = true

        this.scene.traverse(e => {
            if(e.isMesh) {
                console.log("name", e.name)
                if(e.name === "box_drag_drop") {
                    console.log("found box drag and drop")
                    this.boxMixer = new THREE.AnimationMixer(e)
                    this.boxMixer.addEventListener( 'finished', function( e ) {
                        this.nextBtn.style.display = "block"
                        
                        
                    } )
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

        const boxAction = this.boxMixer.clipAction(this.boxFalling)
        boxAction.clampWhenFinished = true;
        boxAction.loop = THREE.LoopOnce
        boxAction.play()
        boxAction.paused = true

       
        
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
        if(this.cameraMixer ) {
            this.cameraMixer.update(this.time.delta*0.001)
        }

        if(this.boxMixer && !this.boxMixer.clipAction(this.boxFalling).paused) {
            this.boxMixer.update(this.time.delta*0.001)

        }

    }
}