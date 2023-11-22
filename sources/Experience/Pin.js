import * as THREE from 'three'

export default class Pin {

    constructor(position, mouse, raycaster, camera) {
        this.pin = new THREE.Group();
        this.clock = new THREE.Clock();
        this.position = position;
        this.mouse = mouse;
        this.raycaster = raycaster
        this.camera = camera

        this.globalUniforms = {
            time: { value: 0 },
            isHovered: { value: 0 }
        };

        this.gMarker = new THREE.PlaneGeometry(0.05, 0.05, 1, 1);
        this.mMarker = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            onBeforeCompile: (shader) => {
                shader.uniforms.time = this.globalUniforms.time;
                shader.uniforms.isHovered = this.globalUniforms.isHovered;
                shader.vertexShader = `
                  attribute float phase;
                varying float vPhase;
                varying vec2 vUv;
                ${shader.vertexShader}
              `.replace(
                    `#include <begin_vertex>`,
                    `#include <begin_vertex>
                    vPhase = phase; // de-synch of ripples
                    vUv = uv;
                `
                );
                //console.log(shader.vertexShader);
                shader.fragmentShader = `
                  uniform float time;
                uniform float isHovered;
                varying float vPhase;
                varying vec2 vUv;
                  ${shader.fragmentShader}
              `.replace(
                    `vec4 diffuseColor = vec4( diffuse, opacity );`,
                    `
                vec2 lUv = (vUv - 0.5) * 2.;
                float val = 0.;
                float lenUv = length(lUv);
                val = max(val, 1. - step(0.25, lenUv)); // central circle
                val = max(val, step(0.4, lenUv) - step(0.5, lenUv)); // outer circle
                
                float tShift = fract(time * 0.5 + vPhase);
                tShift = mix(tShift, -1. * tShift, isHovered);

                float valCurrent = max(val, step(0.4 + (tShift * 0.5), lenUv) - step(0.5 + (tShift * 0.5), lenUv)); // ripple
                float valHovered = max(val, step(0.8 + (tShift ), lenUv) - step(0.9 + (tShift ), lenUv));

                val = mix(valCurrent, valHovered, isHovered);

                if (val < 0.5) discard;
                
                vec4 diffuseColor = vec4( diffuse, opacity );`
                );
                //console.log(shader.fragmentShader)
            }
        });
        this.mesh = new THREE.Mesh(this.gMarker, this.mMarker);
        // name for raycaster
        this.mesh.name = "pin"

        this.pin.add(this.mesh);
    }

    init() {
        this.pin.position.set(this.position.x, this.position.y, this.position.z)
    }


    animate() {
        let t = this.clock.getElapsedTime();
        this.globalUniforms.time.value = t;

        this.pin.lookAt(this.camera.position);

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(this.pin.children);

        if (intersects.length > 0) {
            this.globalUniforms.isHovered.value = 1;
        } else {
            this.globalUniforms.isHovered.value = 0;
        }
    }
}