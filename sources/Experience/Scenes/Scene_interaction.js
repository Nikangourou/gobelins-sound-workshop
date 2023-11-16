import * as THREE from 'three'
import Scene from './Scene'
import GUI from 'lil-gui'
import { DragControls } from 'three/examples/jsm/controls/DragControls.js'

export default class Scene_interaction extends Scene {
    constructor(camera, renderer) {
        super()
        this.renderer = renderer
        this.scene = new THREE.Group()
        this.gui = new GUI()
        this.customUniforms = {

        }
        this.cube = null
        this.sphere = null
        this.knot = null

        this.mouse = new THREE.Vector2()
        this.raycaster = new THREE.Raycaster()
        this.camera = camera
        this.guiSetup()

        // window.addEventListener('mousemove', (e) => {
        //     this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
        //     this.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1
        // })

        // window.addEventListener('click', (e) => {
        //     this.click(e)
        // })
    }

    init() {

        // init a cube a sphere and a  knot
        const cubeGeo = new THREE.BoxGeometry(1, 1, 1)
        const cubeMat = new THREE.MeshNormalMaterial()
        this.cube = new THREE.Mesh(cubeGeo, cubeMat)

        const sphereGeo = new THREE.SphereGeometry(1, 32, 32)
        const sphereMat = new THREE.MeshNormalMaterial()
        this.sphere = new THREE.Mesh(sphereGeo, sphereMat)
        this.sphere.position.x = 2

        const knotGeo = new THREE.TorusKnotGeometry(0.5, 0.1, 100, 16)
        const knotMat = new THREE.MeshNormalMaterial()
        this.knot = new THREE.Mesh(knotGeo, knotMat)
        this.knot.position.x = - 2

        this.scene.add(this.cube, this.sphere, this.knot)
        this.dragSetup()


    }

    guiSetup() {


    }

    dragSetup() {

        let container = document.createElement('div');
        document.body.appendChild(container);
        container.appendChild( this.renderer.instance.domElement );


        this.controls = new DragControls([this.cube, this.sphere, this.knot], this.camera, this.renderer.instance.domElement);
    }

    click() {
        this.raycaster.setFromCamera(this.mouse, this.camera)
        const modelIntersects = this.raycaster.intersectObjects([this.cube, this.sphere, this.knot])

        if (modelIntersects.length) {
            modelIntersects[0].object.rotation.x += 0.5
        }
    }

    update() {
        // if (this.cube) {
        //     this.raycaster.setFromCamera(this.mouse, this.camera)
        //     const modelIntersects = this.raycaster.intersectObject(this.cube)

        //     if (modelIntersects.length) {
        //         this.cube.scale.set(1.2, 1.2, 1.2)
        //     }
        //     else {
        //         this.cube.scale.set(1, 1, 1)
        //     }
        // }
        // if (this.sphere) {
        //     this.raycaster.setFromCamera(this.mouse, this.camera)
        //     const modelIntersects = this.raycaster.intersectObject(this.sphere)

        //     if (modelIntersects.length) {
        //         this.sphere.scale.y += 0.01
        //     }
        //     else {
        //         this.sphere.scale.y = 1
        //     }
        // }
        // if (this.knot) {
        //     this.raycaster.setFromCamera(this.mouse, this.camera)
        //     const modelIntersects = this.raycaster.intersectObject(this.knot)

        //     if (modelIntersects.length) {
        //         this.knot.rotation.x += 0.01
        //     }
        //     else {
        //         this.knot.rotation.x = 0
        //     }
        // }
    }

}