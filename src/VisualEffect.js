import React, { useEffect, useRef } from "react";
import { Vec2 } from "curtainsjs";
import { Plane, Curtains } from "react-curtains";

const basicVs = `
precision mediump float;

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform mat4 uTextureMatrix0;

varying vec3 vVertexPosition;
varying vec2 vTextureCoord;

void main() {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    
    // varyings
    vVertexPosition = aVertexPosition;
    vTextureCoord = (uTextureMatrix0 * vec4(aTextureCoord, 0.0, 1.0)).xy;
}
`;

const basicFs = `
precision mediump float;
varying vec3 vVertexPosition;
varying vec2 vTextureCoord;

uniform sampler2D uSampler0;

uniform float uTime;
uniform vec2 uMouse;

void main() {
    vec2 textureCoord = vTextureCoord;

    // mosue pos from top left
    vec2 mousePos = ((uMouse + 1.0)/2.0);

    float pixels = mousePos.y * 2048.0;
    float dx = 15.0 * (1.0 / pixels);
    float dy = 10.0 * (1.0 / pixels);

    vec2 coord = vec2(dx * floor(textureCoord.x / dx), 
                      dy * floor(textureCoord.y / dy));

    vec4 color = texture2D(uSampler0, coord);
    
    if(color[0] + color[1] + color[2] < mousePos.x *3.0) {
      // gl_FragColor = vec4(1.0,1.0,1.0,1.0);
      gl_FragColor = color;
    } else {
      // gl_FragColor = vec4(0.0,0.0,0.0,1.0);
      float val = (color[0] + color[1] + color[2]) / 3.0;
      gl_FragColor = vec4(val/4.0,val/4.0,val/4.0,1.0);
    }
    
    // gl_FragColor = texture2D(uSampler0, coord);
}
`;

export function VisualEffect() {
  const mousePos = useRef(new Vec2(0, 0));

  const basicUniforms = {
    time: {
      name: "uTime",
      type: "1f",
      value: 0,
    },
    mouse: {
      name: "uMouse",
      type: "2f",
      value: mousePos.current,
    },
  };

  const onRender = (plane) => {
    plane.uniforms.time.value++;
    plane.uniforms.mouse.value = plane.mouseToPlaneCoords(mousePos.current);
  };

  useEffect(() => {
    function handleMouseMove(e) {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
    }

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <Plane
      className="BasicPlane"
      // plane init parameters
      vertexShader={basicVs}
      fragmentShader={basicFs}
      uniforms={basicUniforms}
      // plane events
      onRender={onRender}
      style={{
        width: "100%",
        height: "100vh",
        margin: "auto auto",
      }}
    >
      <img
        style={{ display: "none" }}
        src="https://unsplash.it/1920/1080?random=1"
        alt=""
      />
    </Plane>
  );
}
