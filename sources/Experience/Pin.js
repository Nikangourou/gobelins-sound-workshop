import * as THREE from 'three'

export default class Pin {

    constructor(position, hover = false){
        this.position = position
        this.hover = hover
        // sprite
        this.pin = new THREE.Sprite(new THREE.SpriteMaterial({
            map: new THREE.TextureLoader().load("/assets/lenna.png"),
            transparent: true,
            opacity: 0.5,
            depthTest: false
        })
        )
    }

    init() {
        this.pin.position.set(this.position.x, this.position.y, this.position.z)   
    }

}