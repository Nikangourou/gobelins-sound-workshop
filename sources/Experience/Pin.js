import * as THREE from 'three'

export default class Pin {

    constructor(position, hover = false) {
        this.pin = new THREE.Group()
        this.position = position
        this.hover = hover
        // sprite
        this.pinGeometry = new THREE.SphereGeometry(0.1, 32, 32);
        this.pinMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        this.pinCenter = new THREE.Mesh(this.pinGeometry, this.pinMaterial);

        this.haloRadius = 1; // Rayon du halo
        this.count = 1000 // Augmenter le nombre de particules
        this.positions = new Float32Array(this.count * 3)

        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3

            // Utiliser des Math.random pour positionner les particules aléatoirement dans une sphère autour du point central
            const radius = 0.5
            const theta = 0
            const phi = i * 0.1

            this.positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
            this.positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
            this.positions[i3 + 2] = radius * Math.cos(phi)
        }

        this.halloGeometry = new THREE.BufferGeometry();
        this.halloGeometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))

        this.halloMaterial = new THREE.PointsMaterial({
            size: .05,
            sizeAttenuation: true
        })
        this.hallo = new THREE.Points(this.halloGeometry, this.halloMaterial)

        this.pin.add(this.pinCenter, this.hallo)
    }

    init() {
        this.pin.position.set(this.position.x, this.position.y, this.position.z)
    }

    animate() {

        const delta = Date.now()


        const newRadius = this.haloRadius + Math.sin(delta * 0.001) * 0.1

        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3;

            const theta = 0
            const phi = i * 0.1

            // Mise à jour du rayon
            this.halloGeometry.attributes.position.array[i3] = newRadius * Math.sin(phi) * Math.cos(theta);
        }

        this.halloGeometry.attributes.position.needsUpdate = true
    }

}