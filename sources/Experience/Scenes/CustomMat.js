import * as THREE from 'three'

export default class CustomToon {
    constructor(params) {
        this.params = params
        this.lightDirection = { value: new THREE.Vector3(2, 5, 3) }
        this.mat = new THREE.MeshToonMaterial()
        this.mat.needsUpdate = true
        this.renderer = params.renderer
    }
    
    init() {
        this.mat.onBeforeCompile = (shader) => {
        
            shader.uniforms.color1 = this.params.uniforms.color1
            shader.uniforms.color2 = this.params.uniforms.color2
            shader.uniforms.color3 = this.params.uniforms.color3
            shader.uniforms.color4 = this.params.uniforms.color4
            shader.uniforms.color5 = this.params.uniforms.color5
            shader.uniforms.nbColors = this.params.uniforms.nbColors
            // shader.uniforms.tex = this.customUniforms.map
            shader.uniforms.lightDirection = this.params.uniforms.lightDirection
            shader.uniforms.lightDirection2 = this.params.uniforms.lightDirection2
            shader.uniforms.outlineColor = new THREE.Color('#000000')
            shader.uniforms.outlineWidth = 0.05
            shader.uniforms.resolution = {value : new THREE.Vector2(this.renderer.config.width*this.renderer.config.pixelRatio, this.renderer.config.height*this.renderer.config.pixelRatio)}
            shader.uniforms.noiseStep = {value : 1.0}
    
            shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                `
                #include <common>
                varying vec3 vNormal2;
                varying vec2 vUv; 
                varying vec3 vPosition;
                varying vec3 vViewDir;
                `
            )
    
            shader.vertexShader = shader.vertexShader.replace('void main() {', [
                'void main() {',
                'vNormal2 = normal;',
                'vUv = uv;',
                'vPosition = position;',
                'vec4 modelPosition = modelMatrix * vec4(position, 1.0);',
                'vec4 viewPosition = viewMatrix * modelPosition;',
                'vViewDir = normalize(-viewPosition.xyz);'
    
        
            ].join('\n'));
    
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <common>',
                `
                #include <common>
                
                uniform vec3 color1;
                uniform vec3 color2;
                uniform vec3 color3;
                uniform vec3 color4;
                uniform vec3 color5;
                uniform int nbColors;
                uniform vec3 lightDirection;
                uniform vec3 lightDirection2;
                uniform sampler2D tex;
                uniform float noiseStep;
                uniform vec2 resolution;
                varying vec3 vNormal2;
                varying vec2 vUv; 
                varying vec3 vPosition;
                varying vec3 vViewDir;
    
                float map(float value, float inMin, float inMax, float outMin, float outMax) {
                    return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
                }
    
                float noise(vec2 n) {
                    const vec2 d = vec2(0.0, 1.0);
                    vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
                    return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
                }
                `
            )
    
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <dithering_fragment>',
                `
                #include <dithering_fragment>
                vec3 norm = normalize(vNormal2);
                vec3 lightDir = normalize(lightDirection*lightDirection2);
                float intensity = max(0.0, dot(norm, lightDir));
                float stepVal = 1. / float(nbColors);
                
                vec2 uv1 = vec2( map(vUv.x, 0.0, 1.0, 0., stepVal), 0.5);
                vec2 noiseScale1 = vec2(noiseStep);
                vec2 uv2 = vec2(map(vUv.x, 0.0, 1.0, 0., stepVal*2.0), 0.5);
                vec2 noiseScale2 = vec2(noiseStep*2.0);
                vec2 uv3 = vec2(map(vUv.x, 0.0, 1.0, 0., stepVal*3.0), 0.5);
                vec2 noiseScale3 = vec2(noiseStep*3.0);
                vec2 uv4 = vec2(map(vUv.x, 0.0, 1.0, 0., stepVal*4.0), 0.5);
                vec2 noiseScale4 = vec2(noiseStep*4.0);
                vec2 uv5 = vec2(map(vUv.x, 0.0, 1.0, 0., stepVal*float(nbColors)), 0.5);
                vec2 noiseScale5 = vec2(noiseStep*5.0);
                
                vec2 noiseScale = noiseScale1 * step(0.0, intensity) * (1.0 - step(1.0 * stepVal, intensity))
                + noiseScale2 * step(1.0 * stepVal, intensity) * (1.0 - step(2.0 * stepVal, intensity))
                + noiseScale3 * step(2.0 * stepVal, intensity) * (1.0 - step(3.0 * stepVal, intensity))
                + noiseScale4 * step(3.0 * stepVal, intensity) * (1.0 - step(4.0 * stepVal, intensity))
                + noiseScale5 * step(4.0 * stepVal, intensity);

                float noise1 = noise((vNormal2.xy + gl_FragCoord.xy) * noiseScale1 );  
                float noise2 = noise((vNormal2.xy + gl_FragCoord.xy) * noiseScale2 );  

                vec3 toonColor = color1 * step(0.0, intensity) * (1.0 - step(1.0 * stepVal, intensity))*noise1
                + color2 * step(1.0 * stepVal, intensity) * (1.0 - step(2.0 * stepVal, intensity))
                + color3 * step(2.0 * stepVal, intensity) * (1.0 - step(3.0 * stepVal, intensity))
                + color4 * step(3.0 * stepVal, intensity) * (1.0 - step(4.0 * stepVal, intensity))
                + color5 * step(4.0 * stepVal, intensity);

                gl_FragColor = vec4(toonColor, 1.0);
                `
            ) 
        }

    }

    get () {
        return this.mat
    }

    
        
}