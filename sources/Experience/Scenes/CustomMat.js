import { MeshToonMaterial} from "three";

class CustomToon extends MeshToonMaterial {
    constructor(params) {
        super({
            ...params, 
            transparent :true
        })
    }

    addUtils (shader) {
        const snoise4 = glsl`#pragma glslify: snoise4 = require(glsl-noise/simplex/4d)`;

        shader.vertexShader = shader.vertexShader.replace('void main() {', [
            'uniform float uTime;',
            'varying vec3 vPosition;',
            'float clampedSine(float t) {',
            'return sin((t)+1.0)*0.5;',
            '}',
            'float random(vec2 st){',
            'return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);',
            '}',
            snoise4,
            'void main() {',
            'vPosition = position;',
        ].join('\n'));

        shader.fragmentShader = shader.fragmentShader.replace('void main() {', [
            'varying vec3 vPosition;', 
           
            snoise4,
            'void main() {',
        ].join('\n'));
    }

    patchVertex () {

    }

    patchFragment () {

    }

    onBeforeCompile(shader, renderer) {
        super.onBeforeCompile();
        this.addUtils(shader)
    }
}