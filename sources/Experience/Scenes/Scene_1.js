import * as THREE from 'three'
import Scene from './Scene'
import CustomMat from './CustomMat'
import { PositionalAudioHelper } from 'three/examples/jsm/helpers/PositionalAudioHelper.js'
import { DragControls } from 'three/examples/jsm/controls/DragControls.js'
import Pin from '../Pin'

export default class Scene_1 extends Scene {
    constructor(scene, renderer, cameraControls, mainScene, callback) {
        super()
        this.name = "scene1"
        this.mainRenderer = renderer
        this.animations = scene.animations
        this.cameraControls = cameraControls
        this.mainScene = mainScene
        this.scene = scene.scene

        // object
        this.radio = this.scene.getObjectByName('radio')
        this.lampe = this.scene.getObjectByName('desk_lamp')
        this.lamp_switch = this.scene.getObjectByName('desk_lamp_switch')
        this.tiroir = this.scene.getObjectByName('tiroir_desk')
        this.card = this.scene.getObjectByName('card')
        this.timbre = this.scene.getObjectByName('timbre1')
        this.timbre2 = this.scene.getObjectByName('timbre2')
        this.camera = scene.cameras[0]
        this.tiroir.add(this.timbre, this.timbre2)

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
        this.renderer = renderer
        this.gui = this.renderer.debug
        this.raycaster = this.cameraControls.raycaster
        this.mouse = this.cameraControls.mouse
        this.audioListenner = this.cameraControls.audioListener
        this.cameraMixer.addEventListener('finished', function (e) {
            console.log("finished")
            // transition UI in 
            curr.onSceneIsDone()
            callback()

        })

        this.shouldPlayTransition = false
        this.delayAnimationTransition = 1500

        this.namesToBeOutlines = [ "radio",  "desk_lamp" ]
        this.lightPos = new THREE.Vector3(2, 5, 3)
        this.userStarted = false;
        this.startBtn = document.querySelector('button')

        this.startBtn.addEventListener('click', e => {
            this.userStarted = true;
            this.doorSound.play()
            this.doorMixer.clipAction(this.doorMovement).paused = false;
            this.cameraMixer.clipAction(this.cameraMouvement).paused = false;
            e.target.style.display = 'none';
        })

        this.cameraEnterMovementIsDone = false
        
        // Toggling the openining of the drawer
        this.actionTiroir = this.tiroirMixer.clipAction(this.tiroirMouvement);
        this.actionTiroir.loop = THREE.LoopOnce
        this.tiroirOpen = false
        
        // lights 
        this.light = new THREE.PointLight(0xff0000, 10, 100);
        this.lampLight = new THREE.PointLight(0xffffff, 2, 100)
        this.deskLight = false
        
        // Action
        this.actionLampe = this.lampeMixer.clipAction(this.lampeMouvement);
        this.actionLampe.loop = THREE.LoopOnce
        this.lampeMixer.addEventListener('finished', (e) => {
            this.deskLight = !this.deskLight
            this.lampSound.play()
            curr.setLights()
        })

        //sounds 
        this.doorSound = new THREE.Audio( this.cameraControls.audioListener );
        this.lampSound = new THREE.Audio( this.cameraControls.audioListener );
        this.tiroirSound = new THREE.Audio( this.cameraControls.audioListener );
        this.ambientSound = new THREE.Audio( this.cameraControls.audioListener);
        this.radioSounds = {
            0 : new THREE.Audio( this.cameraControls.audioListener),
            1 : new THREE.Audio( this.cameraControls.audioListener),
            2 : new THREE.Audio( this.cameraControls.audioListener),
            3 : new THREE.Audio( this.cameraControls.audioListener),
        }

        this.radioChannel = 0

        this.staticMatDarkColor = '#111722'
        this.staticMatLightColor = '#E69262'
        this.staticMat = new CustomMat({
            renderer: this.renderer, uniforms: {
                color1: { value: new THREE.Color(this.staticMatDarkColor) },// darker
                color2: { value:  new THREE.Color(this.staticMatLightColor) }, 
                color3: { value: new THREE.Color('#c2410c') },
                color4: { value: new THREE.Color('#bae6fd') },
                color5: { value: new THREE.Color('#E8A85E') },// lighter
                noiseStep: { value: 1.0 },
                nbColors: { value: 2},
                lightDirection: { value: this.light.position },
                lightDirection2: { value: this.lampLight.position },
            }
        })
    }

    init() {
        this.mainScene.add(this.scene)
        this.startBtn.style.display = "block"
        this.cameraControls.setDefaultCamera(this.camera)
        this.isActive = true
        
        this.setLights(this.deskLight)
        this.setupGui()
        const helper1 = new THREE.PointLightHelper(this.light, 0.1);
        this.scene.add(this.light, helper1)

        const helper2 = new THREE.PointLightHelper(this.lampLight, 0.1);
        this.scene.add(this.lampLight, helper2)

        document.querySelector('.experience').addEventListener('click', (e) => {this.click(e)})
        this.setSceneMaterial()

        let testLight = new THREE.AmbientLight(0xffffff);
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

        // audio
        // this.camera.add(this.audioListenner)
        // const helperRadio = new PositionalAudioHelper(this.radioSound)

        // const audioLoader = new THREE.AudioLoader();

        // audioLoader.load('assets/sounds/RadioSound.mp3', (buffer) => {
        //     this.radioSound.setBuffer(buffer);
        //     this.radioSound.setRefDistance(1);
        // });

        // this.radioSound.add(helperRadio);
       // this.radio.add(this.radioSound);

        // Pin
        this.pinTiroir = new Pin({x: 0.1, y: 0.67, z: 7.25}, this.mouse, this.raycaster, this.camera)
        this.pinTiroir.init()
        this.tiroir.add(this.pinTiroir.pin)

        this.pinLampe = new Pin({x: 0.02, y: -0.2, z: -0.1}, this.mouse, this.raycaster, this.camera)
        this.pinLampe.init()
        this.lampe.add(this.pinLampe.pin)

        this.pinRadio = new Pin({x: -0.1, y: 0, z: -0.1}, this.mouse, this.raycaster, this.camera)
        this.pinRadio.init()
        this.radio.add(this.pinRadio.pin)

        this.dragSetup()
        this.setSounds()
    }

    setupGui() {
        const sceneFolder = this.gui.addFolder("scene 1")
        const matFolder = sceneFolder.addFolder("toon settings")
        const lightFolder = matFolder.addFolder('light')
        const light1 = lightFolder.addFolder("light1")
        light1.add(this.light.position, 'x').min(-10).max(10).name('light x')
        light1.add(this.light.position, 'y').min(-10).max(10).name('light y')
        light1.add(this.light.position, 'z').min(-10).max(10).name('light z')

        const light2Folder = lightFolder.addFolder("light2")
        light2Folder.add(this.lampLight.position, 'x').min(-10).max(10).name('light x')
        light2Folder.add(this.lampLight.position, 'y').min(-10).max(10).name('light y')
        light2Folder.add(this.lampLight.position, 'z').min(-10).max(10).name('light z')

        const colors = matFolder.addFolder('colors')
        colors.addColor(this, 'staticMatDarkColor').name('colorDark').onChange(e => {
            this.staticMat.updateColor('color1', e )
        })
        colors.addColor(this, 'staticMatLightColor').name('colorLight')

    }

    switchRadioChannel(){
        this.radioSounds[this.radioChannel].pause()
        if(this.radioChannel === 3) {
            this.radioChannel = 0
        } else {
            this.radioChannel += 1
        }
        this.radioSounds[this.radioChannel].play()

    }

    setSounds() {
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('/assets/sounds/scene1/door1.mp3', (buffer) => {
            this.doorSound.setBuffer( buffer );
            this.doorSound.setLoop( false );
            this.doorSound.setVolume( 3 );
        })

        audioLoader.load('/assets/sounds/scene1/lampe.mp3', (buffer) => {
            this.lampSound.setBuffer( buffer );
            this.lampSound.setLoop( false );
            this.lampSound.setVolume( 2 );
        })
        
        audioLoader.load('/assets/sounds/scene1/tiroir.mp3', (buffer) => {

            this.tiroirSound.setBuffer( buffer );
            this.tiroirSound.setLoop( false );
            this.tiroirSound.setVolume( 3 );
        })   

        audioLoader.load('/assets/sounds/scene1/extérieur.mp3', (buffer) => {
            this.ambientSound.setBuffer( buffer );
            this.ambientSound.setLoop( true );
            this.ambientSound.setVolume( 1 );
            this.ambientSound.play()
        })

        audioLoader.load('/assets/sounds/scene1/radio1.mp3', (buffer) => {
            this.radioSounds[0].setBuffer( buffer );
            this.radioSounds[0].setLoop( true );
            this.radioSounds[0].setVolume( 1 );
            this.radioSounds[0].play()
        }) 
        
        audioLoader.load('/assets/sounds/scene1/radio2.mp3', (buffer) => {
            this.radioSounds[1].setBuffer( buffer );
            this.radioSounds[1].setLoop( true );
            this.radioSounds[1].setVolume( 1 );
        }) 

        audioLoader.load('/assets/sounds/scene1/radio3.mp3', (buffer) => {
            this.radioSounds[2].setBuffer( buffer );
            this.radioSounds[2].setLoop( true );
            this.radioSounds[2].setVolume( 1 );
        })

        audioLoader.load('/assets/sounds/scene1/radio4.mp3', (buffer) => {
            this.radioSounds[3].setBuffer( buffer );
            this.radioSounds[3].setLoop( true );
            this.radioSounds[3].setVolume( 1 );
        }) 

    }

    setSceneMaterial() {
        let toBeAdded = []
        this.scene.traverse(e => {
            if (e.isMesh) {
                if (e.name === 'door') {
                    this.doorMixer = new THREE.AnimationMixer(e)
                    let mat = new CustomMat({
                        renderer: this.renderer, uniforms: {
                            color1: { value: e.material.color },
                            color2: { value: new THREE.Color('#991b1b') },
                            color3: { value: new THREE.Color('#18181b') },
                            color4: { value: new THREE.Color('#ffff00') },
                            color5: { value: new THREE.Color('#00ffff') },
                            noiseStep: { value: 1.0 },
                            nbColors: { value: 3 },
                            lightDirection: { value: this.light.position },
                            lightDirection2: { value: this.lampLight.position },
                           
                        }
                    })
                    mat.init()
                    e.material = mat.get()

                } else if (e.name.includes('timbre')) {
                    e.material = new THREE.MeshBasicMaterial({ color: '#699DF7' })
                } else if (this.namesToBeOutlines.includes(e.name)) {
                    let mat = new CustomMat({
                        renderer: this.renderer, uniforms: {
                            color1: { value: new THREE.Color('#699DF7') }, // darker
                            color2: { value: new THREE.Color('#5E9EE8') },
                            color3: { value: new THREE.Color('#50A5D7') },
                            color4: { value: new THREE.Color('#45A6C9') },
                            color5: { value: new THREE.Color('#3CA4B9') },// lighter
                            noiseStep: { value: 1.0 },
                            nbColors: { value: 3 },
                            lightDirection: { value: this.light.position },
                            lightDirection2: { value: this.lampLight.position },
                        }
                    })
                    mat.init()
                    e.material = mat.get()
                    let mesh = e.clone()
                    mesh.material = this.outlineMat
                    toBeAdded.push(mesh)

                } else if (e.name.includes("contain")) {
                    e.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
                } else if(e.name === "radio") {
                    let mat = new CustomMat({
                        renderer: this.renderer, uniforms: {
                            color1: { value: new THREE.Color('#1e293b') }, // darker
                            color2: { value: new THREE.Color('E69262') },
                            color3: { value: new THREE.Color('#9f1239') },
                            color4: { value: new THREE.Color('#e11d48') },
                            color5: { value: new THREE.Color('#1d4ed8') },// lighter
                            noiseStep: { value: 1.0 },
                            nbColors: { value: 5 },
                            lightDirection: { value: this.light.position },
                            lightDirection2: { value: this.lampLight.position },
                        }
                    })


                } else {
                    this.staticMat.init()
                    e.material = this.staticMat.get()

                }
            }
        })

        toBeAdded.forEach(e => this.scene.add(e))

    }

    dragSetup() {
        this.controls = new DragControls([this.card, this.timbre2], this.camera, this.mainRenderer.instance.domElement);
        this.controls.addEventListener('dragstart', () => {
            this.cameraControls.modes.debug.orbitControls.enabled = false
        });
        this.controls.addEventListener('dragend', () => {
            this.cameraControls.modes.debug.orbitControls.enabled = true

            if (this.card && this.timbre2) {
                const distance = this.card.position.distanceTo(this.timbre2.position)
                if (distance < .15) {
                    this.card.material.color.set(0xff0000)
                    this.tiroir.remove(this.timbre2)
                    this.hasBeenCompleted = true
                    this.cameraMixer.clipAction(this.cameraMouvement).isPaused = false;
                    this.transition.init()
                    setTimeout(() => { this.shouldPlayTransition = true }, this.delayAnimationTransition);
                }
                else {
                    this.card.material.color.set(0x00ff00)
                }
            }
        });
    }

    setLights() {
        // simulate lighting on/off by moving position

        if(this.deskLight) {
            this.light.position.set(-5.94, -2.64, -3.84)
            this.lampLight.position.set(-7.94, 7, 10)
        } else {
            this.light.position.set(10, 0.76, 2.6)
            this.lampLight.position.set(1.04, 8.32, 2)
        }
    }

    click() {
        this.raycaster.setFromCamera(this.mouse, this.camera)
        const modelIntersects = this.raycaster.intersectObjects([this.lampe, this.radio, this.tiroir])
       
        if (modelIntersects.length) {

            if(modelIntersects[0].object.name === 'pin') {
                modelIntersects.shift()
            }

            if (modelIntersects[0].object.name === 'desk_lamp') {
                this.actionLampe.stop()
                this.actionLampe.play()           
                this.pinLampe.remove()    
            }
            if (modelIntersects[0].object.name === 'radio') {
                this.switchRadioChannel()
                this.pinRadio.remove()
            }
            if (modelIntersects[0].object.name === 'tiroir_desk') {

                this.tiroirSound.play()
                if (this.tiroirOpen) {
                    this.actionTiroir.paused = false;
                    this.actionTiroir.timeScale = -1; // Reverse the animation
                    this.actionTiroir.play();
                    this.tiroirOpen = false;
                } else {
                    this.actionTiroir.reset()
                    this.actionTiroir.timeScale = 1; // Play the animation as is
                    this.actionTiroir.clampWhenFinished = true
                    this.actionTiroir.play();
                    this.tiroirOpen = true;
                }
                this.pinTiroir.remove()

                this.actionTiroir.play()
            }
        }
    }

    onSceneIsDone() {
        this.isActive = false
        this.hasBeenCompleted = true
        document.querySelector('.experience').removeEventListener('click', (e) => { this.click(e) })
        document.querySelector('.experience').removeEventListener('click', (e) => { this.click(e) })


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
                }
            }

            if (this.doorMixer && this.userStarted) {
                this.doorMixer.update(this.time.delta * 0.001)
            }
            if (this.lampeMixer && this.userStarted ) {
                this.lampeMixer.update(this.time.delta * 0.001)
            }
            if (this.tiroirMixer && this.userStarted) {
                this.tiroirMixer.update(this.time.delta * 0.001)
            }
            if(this.pinTiroir) {
                this.pinTiroir.animate()
            }
            if(this.pinLampe) {
                this.pinLampe.animate()
            }
            if(this.pinRadio){
                this.pinRadio.animate()
            }
            
        }

        if (this.shouldPlayTransition) this.transition.play()
    }
}