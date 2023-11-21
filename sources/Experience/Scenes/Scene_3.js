import * as THREE from 'three'
import Scene from './Scene'
import GUI from 'lil-gui'

export default class Scene_3 extends Scene {
    constructor(scene, renderer, cameraControls, mainScene, callback) {
        super()
        this.name = "scene3"
        this.gui = new GUI()
        this.renderer = renderer
        this.cameraControls = cameraControls
        this.mainScene = mainScene
        this.animations = scene.animations
        this.scene = scene.scene
        this.camera = scene.cameras[0]
        this.cameraMixer = new THREE.AnimationMixer(this.camera)
        this.cameraMouvement = scene.animations[0]
        let curr = this
        this.cameraMixer.addEventListener('finished', function (e) {
            console.log("scene 3 finished")
            // transition UI in 
            curr.onSceneIsDone()
            callback()

        })
        this.nextBtn = document.getElementById('next')
        this.nextBtn.addEventListener('click', e => {
            this.nextBtn.style.display = 'none'
            this.hasBeenCompleted = true
            this.cameraMixer.clipAction(this.cameraMouvement).paused = false;
            
        })

    }
    
    init() {
        this.mainScene.add(this.scene)
        this.cameraControls.setDefaultCamera(this.camera)
        this.isActive = true
        this.nextBtn.style.display = "block"

        const action = this.cameraMixer.clipAction(this.cameraMouvement);
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce
        action.play()
        action.paused = true
        const light = new THREE.PointLight(0xff0000, 10, 100);
        light.position.set(10, 0.76, 2.6);
        const helper1 = new THREE.PointLightHelper(light, 0.1);
        this.scene.add(light, helper1)

        const light2 = new THREE.PointLight(0xff0000, 10, 100);
        light2.position.set(1.04, 8.32, 2);
        const helper2 = new THREE.PointLightHelper(light2, 0.1);
        this.scene.add(light2, helper2)

    }

    onSceneIsDone() {
        this.isActive = false
        this.hasBeenCompleted = true

        // remove scene from main scene
        let toBeRemoved = null
        this.mainScene.traverse(e => {
            if (e.name === "Scene") {
                toBeRemoved = e
            }
        })
        this.mainScene.remove(toBeRemoved)
    }

    update() {
        if (this.cameraMixer) {
            this.cameraMixer.update(this.time.delta * 0.001)
        }


    }

}