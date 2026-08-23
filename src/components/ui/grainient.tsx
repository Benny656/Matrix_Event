"use client"

import React, { useEffect, useRef } from "react"

export interface GrainientProps {
  color1?: string
  color2?: string
  color3?: string
  timeSpeed?: number
  colorBalance?: number
  warpStrength?: number
  warpFrequency?: number
  warpSpeed?: number
  warpAmplitude?: number
  blendAngle?: number
  blendSoftness?: number
  rotationAmount?: number
  noiseScale?: number
  grainAmount?: number
  grainScale?: number
  grainAnimated?: boolean
  contrast?: number
  gamma?: number
  saturation?: number
  centerX?: number
  centerY?: number
  zoom?: number
  className?: string
  style?: React.CSSProperties
}

function hexToRgb(hex: string): [number, number, number] {
  let cleaned = hex.replace("#", "").trim()
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split("")
      .map((c) => c + c)
      .join("")
  }
  const num = parseInt(cleaned, 16)
  if (isNaN(num)) return [0.5, 0.5, 0.5]
  const r = ((num >> 16) & 255) / 255
  const g = ((num >> 8) & 255) / 255
  const b = (num & 255) / 255
  return [r, g, b]
}

const VERTEX_SHADER = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform float u_warpStrength;
uniform float u_warpFrequency;
uniform float u_warpSpeed;
uniform float u_warpAmplitude;
uniform float u_blendAngle;
uniform float u_blendSoftness;
uniform float u_colorBalance;
uniform float u_noiseScale;
uniform float u_grainAmount;
uniform float u_grainScale;
uniform float u_grainAnimated;
uniform float u_contrast;
uniform float u_gamma;
uniform float u_saturation;
uniform vec2 u_center;
uniform float u_zoom;
uniform float u_rotationAmount;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec3 adjustContrast(vec3 color, float contrast) {
  return clamp((color - 0.5) * contrast + 0.5, 0.0, 1.0);
}

vec3 adjustSaturation(vec3 color, float sat) {
  float gray = dot(color, vec3(0.299, 0.587, 0.114));
  return clamp(mix(vec3(gray), color, sat), 0.0, 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float aspect = u_resolution.x / u_resolution.y;
  
  vec2 p = uv - 0.5 + u_center;
  p.x *= aspect;
  p /= max(u_zoom, 0.01);
  
  float rotRad = radians(u_rotationAmount) + u_time * 0.05;
  mat2 rot = mat2(cos(rotRad), -sin(rotRad), sin(rotRad), cos(rotRad));
  p = rot * p;
  
  float t = u_time * u_warpSpeed;
  float n1 = snoise(p * u_warpFrequency * 0.5 + vec2(t * 0.2, t * 0.3));
  float n2 = snoise(p * u_warpFrequency + vec2(-t * 0.3, t * 0.1) + n1);
  
  vec2 warped = p + vec2(n1, n2) * (u_warpStrength * (u_warpAmplitude / 50.0));
  
  float angleRad = radians(u_blendAngle);
  vec2 dir = vec2(cos(angleRad), sin(angleRad));
  float gradPos = dot(warped, dir) + u_colorBalance;
  
  float softness = max(u_blendSoftness, 0.001);
  float t1 = smoothstep(-softness, softness, gradPos + 0.5);
  float t2 = smoothstep(-softness, softness, gradPos - 0.2);
  
  vec3 col = mix(u_color1, u_color2, t1);
  col = mix(col, u_color3, t2);
  
  col = adjustSaturation(col, u_saturation);
  col = adjustContrast(col, u_contrast);
  col = pow(max(col, 0.0), vec3(1.0 / max(u_gamma, 0.01)));
  
  if (u_grainAmount > 0.0) {
    vec2 grainCoord = gl_FragCoord.xy * (u_grainScale * 0.5);
    if (u_grainAnimated > 0.5) {
      grainCoord += vec2(sin(u_time * 100.0), cos(u_time * 100.0)) * 50.0;
    }
    float grain = (random(grainCoord) - 0.5) * u_grainAmount;
    col += grain;
  }
  
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`

export default function Grainient({
  color1 = "#003339",
  color2 = "#00666B",
  color3 = "#051B1D",
  timeSpeed = 0.2,
  colorBalance = 0,
  warpStrength = 0.8,
  warpFrequency = 4,
  warpSpeed = 1.5,
  warpAmplitude = 40,
  blendAngle = 0,
  blendSoftness = 0.06,
  rotationAmount = 400,
  noiseScale = 2,
  grainAmount = 0.12,
  grainScale = 2,
  grainAnimated = false,
  contrast = 1.4,
  gamma = 1,
  saturation = 0.9,
  centerX = 0,
  centerY = 0,
  zoom = 0.9,
  className = "",
  style,
}: GrainientProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl", {
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    })
    if (!gl) return

    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
    if (!vs || !fs) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program))
      return
    }

    gl.useProgram(program)

    // Full screen quad
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    )

    const posLoc = gl.getAttribLocation(program, "position")
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    // Uniform locations
    const uResLoc = gl.getUniformLocation(program, "u_resolution")
    const uTimeLoc = gl.getUniformLocation(program, "u_time")
    const uC1Loc = gl.getUniformLocation(program, "u_color1")
    const uC2Loc = gl.getUniformLocation(program, "u_color2")
    const uC3Loc = gl.getUniformLocation(program, "u_color3")
    const uWarpStrLoc = gl.getUniformLocation(program, "u_warpStrength")
    const uWarpFreqLoc = gl.getUniformLocation(program, "u_warpFrequency")
    const uWarpSpdLoc = gl.getUniformLocation(program, "u_warpSpeed")
    const uWarpAmpLoc = gl.getUniformLocation(program, "u_warpAmplitude")
    const uBlendAngLoc = gl.getUniformLocation(program, "u_blendAngle")
    const uBlendSoftLoc = gl.getUniformLocation(program, "u_blendSoftness")
    const uColorBalLoc = gl.getUniformLocation(program, "u_colorBalance")
    const uNoiseScaleLoc = gl.getUniformLocation(program, "u_noiseScale")
    const uGrainAmtLoc = gl.getUniformLocation(program, "u_grainAmount")
    const uGrainScaleLoc = gl.getUniformLocation(program, "u_grainScale")
    const uGrainAnimLoc = gl.getUniformLocation(program, "u_grainAnimated")
    const uContrastLoc = gl.getUniformLocation(program, "u_contrast")
    const uGammaLoc = gl.getUniformLocation(program, "u_gamma")
    const uSatLoc = gl.getUniformLocation(program, "u_saturation")
    const uCenterLoc = gl.getUniformLocation(program, "u_center")
    const uZoomLoc = gl.getUniformLocation(program, "u_zoom")
    const uRotLoc = gl.getUniformLocation(program, "u_rotationAmount")

    let animationFrameId: number
    let startTime = performance.now()

    const updateUniforms = () => {
      const c1 = hexToRgb(color1)
      const c2 = hexToRgb(color2)
      const c3 = hexToRgb(color3)

      gl.uniform3f(uC1Loc, c1[0], c1[1], c1[2])
      gl.uniform3f(uC2Loc, c2[0], c2[1], c2[2])
      gl.uniform3f(uC3Loc, c3[0], c3[1], c3[2])
      gl.uniform1f(uWarpStrLoc, warpStrength)
      gl.uniform1f(uWarpFreqLoc, warpFrequency)
      gl.uniform1f(uWarpSpdLoc, warpSpeed)
      gl.uniform1f(uWarpAmpLoc, warpAmplitude)
      gl.uniform1f(uBlendAngLoc, blendAngle)
      gl.uniform1f(uBlendSoftLoc, blendSoftness)
      gl.uniform1f(uColorBalLoc, colorBalance)
      gl.uniform1f(uNoiseScaleLoc, noiseScale)
      gl.uniform1f(uGrainAmtLoc, grainAmount)
      gl.uniform1f(uGrainScaleLoc, grainScale)
      gl.uniform1f(uGrainAnimLoc, grainAnimated ? 1.0 : 0.0)
      gl.uniform1f(uContrastLoc, contrast)
      gl.uniform1f(uGammaLoc, gamma)
      gl.uniform1f(uSatLoc, saturation)
      gl.uniform2f(uCenterLoc, centerX, centerY)
      gl.uniform1f(uZoomLoc, zoom)
      gl.uniform1f(uRotLoc, rotationAmount)
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.floor(rect.width * dpr) || window.innerWidth
      const height = Math.floor(rect.height * dpr) || window.innerHeight

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
        gl.uniform2f(uResLoc, width, height)
      }
    }

    window.addEventListener("resize", resize)
    resize()
    updateUniforms()

    const render = () => {
      const elapsed = (performance.now() - startTime) * 0.001 * timeSpeed
      gl.uniform1f(uTimeLoc, elapsed)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", resize)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(positionBuffer)
    }
  }, [
    color1,
    color2,
    color3,
    timeSpeed,
    colorBalance,
    warpStrength,
    warpFrequency,
    warpSpeed,
    warpAmplitude,
    blendAngle,
    blendSoftness,
    rotationAmount,
    noiseScale,
    grainAmount,
    grainScale,
    grainAnimated,
    contrast,
    gamma,
    saturation,
    centerX,
    centerY,
    zoom,
  ])

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full block ${className}`}
      style={{ ...style }}
    />
  )
}
