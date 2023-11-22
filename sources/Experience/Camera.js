import * as THREE from 'three'
import Experience from './Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class Camera {
    constructor(_options) {
        // Options
        this.experience = new Experience()
        this.config = this.experience.config
        this.debug = this.experience.debug
        this.time = this.experience.time
        this.sizes = this.experience.sizes
        this.targetElement = this.experience.targetElement
        this.scene = this.experience.scene
        this.audioListener = new THREE.AudioListener();
        this.mouse = new THREE.Vector2(0, 0)
        this.mouseEaseRation = 0.008
        this.mouseRotationH = 0.02
        this.mouseRotationV = 0.02
        this.easedMouse = new THREE.Vector2(0, 0)
        this.mouseEaseRatio = 0.08
        this.raycaster = new THREE.Raycaster()
        this.groupToAnimateOnMousemove = new THREE.Group()
        // this.dummyCamera = new THREE.Mesh(new THREE.ConeGeometry( 1, 10, 32 ), new THREE.MeshBasicMaterial())
        // this.dummyCamera.visible = false
        
        // Set up
        this.mode = 'default' // defaultCamera \ debugCamera

        this.debugCamera = new THREE.PerspectiveCamera(25, this.config.width / this.config.height, 0.1, 300)
        this.defaultCamera = new THREE.PerspectiveCamera(25, this.config.width / this.config.height, 0.1, 150)
        // this.groupToAnimateOnMousemove.add(this.defaultCamera)

        // console.log( this.groupToAnimateOnMousemove )
        // this.instance = new THREE.PerspectiveCamera(25, this.config.width / this.config.height, 0.1, 150)
        // this.instance.rotation.reorder('YXZ')

        this.setModes()

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
            this.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1
        })
    }


    setDefaultCamera( camera ) {
        camera.add(this.audioListener)
        // this.groupToAnimateOnMousemove.add(camera)
        this.defaultCamera = camera
        //this.defaultCamera.rotation.reorder('YXZ')

    }

    setModes() {
        this.modes = {}

        // Default
        this.modes.default = {}
        // this.modes.default.instance = this.instance.clone()
        // this.modes.default.instance.rotation.reorder('YXZ')
        // this.modes.default.instance.position.set(0, 0, 10)

        // // Debug
        // this.modes.debug = {}
        // this.modes.debug.instance = this.instance.clone()
        // this.modes.debug.instance.rotation.reorder('YXZ')
        // this.modes.debug.instance.position.set(5, 5, 5)

        // this.modes.debug.orbitControls = new OrbitControls(this.modes.debug.instance, this.targetElement)

        this.modes.default.camera = this.defaultCamera
       
        //this.modes.default.instance.rotation.reorder('YXZ')

        // Debug
        this.modes.debug = {}

        // turn Y up
        this.debugCamera.up.set(0,0,1);
        this.debugCamera.position.set(5, 5, 5)
     
        this.modes.debug.camera = this.debugCamera

        
        this.modes.debug.orbitControls = new OrbitControls(this.modes.debug.camera, this.targetElement)
        this.modes.debug.orbitControls.enabled = this.modes.debug.active
        this.modes.debug.orbitControls.screenSpacePanning = true
        this.modes.debug.orbitControls.enableKeys = false
        this.modes.debug.orbitControls.zoomSpeed = 0.25
        this.modes.debug.orbitControls.enableDamping = true
        this.modes.debug.orbitControls.update()
    }

    resize()
    {
        this.debugCamera.aspect = this.config.width / this.config.height
        this.debugCamera.updateProjectionMatrix()

        this.defaultCamera.aspect = this.config.width / this.config.height
        this.defaultCamera.updateProjectionMatrix()
       
    }

    // RETURN VEC2 * RATIO
    lerp(v1, ratio) {
        return new THREE.Vector2(v1.x * ratio, v1.y * ratio)
    }

    update() {
        this.modes.debug.orbitControls.update()

        //DOLLY EFFECT
        //this.groupToAnimateOnMousemove.position.copy(this.dummyCamera.position)
        //this.groupToAnimateOnMousemove.rotation.copy(this.dummyCamera.position)
       
        // this.defaultCamera.rotation.x = ( this.mouse.y * .02 ) rotate cmaera inside group that is animated
        //this.defaultCamera.rotation.y = ( this.mouse.x * .02 )
        
    }

    destroy() {
        this.modes.debug.orbitControls.destroy()
    }
}
