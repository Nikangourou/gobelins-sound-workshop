import * as THREE from 'three'

export default class Pin {

    constructor(position, hover = false) {
        this.pin = new THREE.Group();
        this.clock = new THREE.Clock();
        this.hover = hover;
        this.position = position;

        this.globalUniforms = {
            time: { value: 0 }
        };

        this.markerCount = 1;
        this.markerInfo = [];
        this.gMarker = new THREE.PlaneGeometry();
        this.mMarker = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            onBeforeCompile: (shader) => {
                shader.uniforms.time = this.globalUniforms.time;
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
                val = max(val, step(0.4 + (tShift * 0.6), lenUv) - step(0.5 + (tShift * 0.5), lenUv)); // ripple
                
                if (val < 0.5) discard;
                
                vec4 diffuseColor = vec4( diffuse, opacity );`
                );
                //console.log(shader.fragmentShader)
            }
        });
        this.markers = new THREE.InstancedMesh(this.gMarker, this.mMarker, this.markerCount);

        var dummy = new THREE.Object3D();
        let phase = [];
        for (var i = 0; i < this.markerCount; i++) {
            dummy.lookAt(dummy.position.clone().setLength(this.hover ? 1.1 : 0.2));
            dummy.updateMatrix();

            this.markers.setMatrixAt(i, dummy.matrix);
            phase.push(Math.random());

            this.markerInfo.push({ id: i + 1, mag: THREE.MathUtils.randInt(1, 10), crd: position });
        }
        this.gMarker.setAttribute("phase", new THREE.InstancedBufferAttribute(new Float32Array(phase), 1));

        this.pin.add(this.markers);
    }

    init() {
        this.pin.position.set(this.position.x, this.position.y, this.position.z)
    }

    //get elapsedTime

    animate() {
        let t = this.clock.getElapsedTime();
        this.globalUniforms.time.value = t;
    }
}