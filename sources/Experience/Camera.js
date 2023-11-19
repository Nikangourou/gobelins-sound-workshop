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
        this.mouse = new THREE.Vector2(0, 0)
        this.easeMouse = new THREE.Vector2(0, 0)
        this.mouseRotationH = 0.05
        this.mouseRotationV = 0.05
        this.mouseEaseRation = 0.08
        
        // Set up
        this.mode = 'default' // defaultCamera \ debugCamera

        this.setInstance()
        this.setModes()

        // Listeners
        window.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
        })
    }

    setInstance() {
        // Set up
        this.instance = new THREE.PerspectiveCamera(25, this.config.width / this.config.height, 0.1, 150)
        this.instance.rotation.reorder('YXZ')
        this.debugCamera = new THREE.PerspectiveCamera(25, this.config.width / this.config.height, 0.1, 150)
        this.defaultCamera = new THREE.PerspectiveCamera(25, this.config.width / this.config.height, 0.1, 150)

        // Set up
        this.mode = 'default' 

        this.setInstance()
        this.setModes()
       
    }

    setDefaultCamera( camera ) {
        this.defaultCamera = camera
        //this.defaultCamera.rotation.reorder('YXZ')

    }

    setInstance()
    {
        // // Set up
        // this.instance = new THREE.PerspectiveCamera(25, this.config.width / this.config.height, 0.1, 150)
        // this.instance.rotation.reorder('YXZ')

        // this.scene.add(this.instance)
    }

    setModes() {
        this.modes = {}

        // Default
        this.modes.default = {}
        this.modes.default.instance = this.instance.clone()
        this.modes.default.instance.rotation.reorder('YXZ')
        this.modes.default.instance.position.set(0, 0, 10)

        // Debug
        this.modes.debug = {}
        this.modes.debug.instance = this.instance.clone()
        this.modes.debug.instance.rotation.reorder('YXZ')
        this.modes.debug.instance.position.set(5, 5, 5)

        this.modes.debug.orbitControls = new OrbitControls(this.modes.debug.instance, this.targetElement)

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
        // Update debug orbit controls
        this.modes.debug.orbitControls.update()

        // Apply coordinates

        this.instance.position.copy(this.modes[this.mode].instance.position)
        this.instance.quaternion.copy(this.modes[this.mode].instance.quaternion)
        this.instance.updateMatrixWorld() // To be used in projection

        // Mise à jour de la position de la caméra
        this.easeMouse = this.lerp(this.mouse, this.mouseEaseRation)

        this.instance.rotateY(this.easeMouse.x * -this.mouseRotationH)
        this.instance.rotateX(this.easeMouse.y * this.mouseRotationV)
        
        // Update projection matrix
        this.instance.updateProjectionMatrix()
        // this.instance.position.copy(this.modes[this.mode].instance.position)
        // this.instance.quaternion.copy(this.modes[this.mode].instance.quaternion)
        // this.instance.updateMatrixWorld() // To be used in projection

    }

    destroy() {
        this.modes.debug.orbitControls.destroy()
    }
}
