import * as THREE from 'three'
import Scene from './Scene'
import { PositionalAudioHelper } from 'three/examples/jsm/helpers/PositionalAudioHelper.js'


export default class Intro extends Scene {
    constructor(scene, renderer, cameraControls, mainScene, callback) {
        super()
        this.mainRenderer = renderer
        this.animations = scene.animations
        this.cameraControls = cameraControls
        this.mainScene = mainScene
        this.scene = scene.scene

        // object
        this.radio = this.scene.getObjectByName('radio')
        this.lampe = this.scene.getObjectByName('desk_lamp')
        this.lamp_switch = this.scene.getObjectByName('desk_lamp_switch')
        this.lampLight = new THREE.PointLight(0xffffff, 2, 100)
        this.tiroir = this.scene.getObjectByName('tiroir_desk')
        this.camera = scene.cameras[0]

        // Mixer 
        this.lampeMixer = new THREE.AnimationMixer(this.lamp_switch)
        this.tiroirMixer = new THREE.AnimationMixer(this.tiroir)
        this.cameraMixer = new THREE.AnimationMixer(this.camera)

        // Animation
        this.cameraMouvement = scene.animations[4]
        this.doorMovement = scene.animations[0]
        this.lampeMouvement = scene.animations[3]
        this.tiroirMouvement = scene.animations[2]

        let curr = this
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()
        this.audioListenner = new THREE.AudioListener();
        this.audioListenner.context.resume()
        this.radioSound = new THREE.PositionalAudio(this.audioListenner);
        this.nextBtn = document.getElementById('next')
        this.cameraMixer.addEventListener('finished', function (e) {
            console.log("finised")
            // transition UI in 
            curr.onSceneIsDone()
            callback()

        })
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

        window.addEventListener('click', (e) => {
            this.click(e)
        })

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
            this.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1
        })

        // Action
        this.actionLampe = this.lampeMixer.clipAction(this.lampeMouvement);
        this.actionLampe.loop = THREE.LoopOnce

        this.actionTiroir = this.tiroirMixer.clipAction(this.tiroirMouvement);
        this.actionTiroir.loop = THREE.LoopOnce
    }

    init() {
        this.mainScene.add(this.scene)
        this.cameraControls.setDefaultCamera(this.camera)
        const helper = new THREE.CameraHelper(this.camera);
        this.scene.add(helper)

        this.isActive = true

        this.scene.traverse(e => {
            if (e.isMesh) {
                e.material = new THREE.MeshNormalMaterial()
                if (e.name === 'door') {
                    this.doorMixer = new THREE.AnimationMixer(e)
                }
            }
        })

        let testLight = new THREE.AmbientLight(0xffffff, 0.5)
        this.scene.add(testLight)

        // lamp light
        this.lampLight.position.set(0, 0, 0)
        this.lampe.add(this.lampLight)

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

        // audio
        this.camera.add(this.audioListenner)
        const helperRadio = new PositionalAudioHelper(this.radioSound)

        const audioLoader = new THREE.AudioLoader();

        audioLoader.load('assets/RadioSound.mp3', (buffer) => {
            this.radioSound.setBuffer(buffer);
            this.radioSound.setRefDistance(1);
        });

        this.radioSound.add(helperRadio);
        this.cubeRadio = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.2, 0.2),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        )
        this.cubeRadio.position.set(1.2, 0.6, 7.8)
        this.cubeRadio.add(this.radioSound)
        this.cubeRadio.visible = false
        
        this.scene.add(this.cubeRadio)
    }

    click() {
        this.raycaster.setFromCamera(this.mouse, this.camera)
        const modelIntersects = this.raycaster.intersectObjects([this.lampe, this.radio, this.tiroir])

        if (modelIntersects.length) {
            if (modelIntersects[0].object.name === 'desk_lamp') {
                               
                this.actionLampe.stop()
                this.actionLampe.play()
                                
                this.lampLight.visible = !this.lampLight.visible
            }
            if (modelIntersects[0].object.name === 'radio') {
                this.radioSound.play()
            }
            if(modelIntersects[0].object.name === 'tiroir_desk') {
                this.actionTiroir.stop()
                this.actionTiroir.play()
            }
        }
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
        if (this.isActive) {
            if (this.cameraMixer && this.userStarted && !this.cameraMixer.clipAction(this.cameraMouvement).isPaused) {
                this.cameraMixer.update(this.time.delta * 0.001)
                if (this.cameraMixer.clipAction(this.cameraMouvement).time > 8.4 && !this.cameraEnterMovementIsDone) {
                    this.cameraEnterMovementIsDone = true;
                    this.cameraMixer.clipAction(this.cameraMouvement).isPaused = true
                    this.nextBtn.style.display = 'block'
                }
            }

            if (this.doorMixer && this.userStarted) {
                this.doorMixer.update(this.time.delta * 0.001)
                // if(this.doorMixer.clipAction(this.doorMovement).time > 
            }
            if(this.lampeMixer && this.userStarted) {
                this.lampeMixer.update(this.time.delta * 0.001)
            }
            if(this.tiroirMixer && this.userStarted) {
                this.tiroirMixer.update(this.time.delta * 0.001)
            }
        }
    }
}