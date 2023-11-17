import * as THREE from 'three'
import Scene from './Scene'


export default class Scene_1 extends Scene {
    constructor(scene, renderer, cameraControls, mainScene, callback) {
        super()
        this.mainRenderer = renderer
        this.animations = scene.animations
        this.cameraControls = cameraControls
        this.mainScene = mainScene
        this.scene = scene.scene
        this.camera = scene.cameras[0]
        this.cameraMixer = new THREE.AnimationMixer(this.camera)
        this.cameraMouvement = scene.animations[1]
        this.cubeAnim1 = scene.animations[0]
        this.cubeAnim2 = scene.animations[2]
        this.cubeAnim3 = scene.animations[3]
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

        this.scene.traverse(e => {
            if(e.isMesh) {
                console.log(e.name)
                if(e.name === 'Cube') {
                    this.cubeMixer1 = new THREE.AnimationMixer(e)
                }

                if(e.name === 'Cube001') {
                    this.cubeMixer2 = new THREE.AnimationMixer(e)
                }

                if(e.name === 'Cube004') {
                    this.cubeMixer3 = new THREE.AnimationMixer(e)
                }
            } 
           
        })
        
        let testLight = new THREE.AmbientLight( 0xffffff );
        this.scene.add(testLight)
        const cubeAction1 = this.cubeMixer1.clipAction(this.cubeAnim1); 
        cubeAction1.play()

        const cubeAction2 = this.cubeMixer2.clipAction(this.cubeAnim2); 
        cubeAction2.play()

        const cubeAction3 = this.cubeMixer3.clipAction(this.cubeAnim3); 
        cubeAction3.play()
        
        const action = this.cameraMixer.clipAction(this.cameraMouvement);
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce
        action.play()
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
        if(this.cameraMixer ) {
            this.cameraMixer.update(this.time.delta*0.001)
            //console.log(this.camera.rotation)
        }

        if(this.cubeMixer1) {
            this.cubeMixer1.update(this.time.delta*0.001)
        }

        if(this.cubeMixer2) {
            this.cubeMixer2.update(this.time.delta*0.001)
        }

        if(this.cubeMixer3) {
            this.cubeMixer3.update(this.time.delta*0.001)
        }
    }
}