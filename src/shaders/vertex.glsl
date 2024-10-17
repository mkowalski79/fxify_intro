#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUV;

void main() {
    vUV = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}