// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_lightDir;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  uniform bool u_lightOn;
  uniform vec3 u_ambientColor;
  uniform bool u_point_light;

  void main() {
    
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;         // use color 

    } else if (u_whichTexture == -1) {    // use uv debug color
      gl_FragColor = vec4(v_UV, 1.0, 1.0);

    } else if (u_whichTexture == 0) {     // use texture 0 == flower
      gl_FragColor = texture2D(u_Sampler0, v_UV);

    } else if (u_whichTexture == -3) {    // use texture 1 == sky
      gl_FragColor = texture2D(u_Sampler1, v_UV);

    } else if (u_whichTexture == -4) {    // use texture 2 == seaweed
      gl_FragColor = texture2D(u_Sampler2, v_UV);

    } else if (u_whichTexture == -5) {    // use texture 2 == fish
      gl_FragColor = texture2D(u_Sampler3, v_UV);

    } else if(u_whichTexture == -6) {     // new normal color
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);
    
    } else {                              // error, but redish
      gl_FragColor = vec4(1,.2,.2,1);
    }

    if (u_point_light) {

      vec3 lightVector = u_lightPos-vec3(v_VertPos);
      float r=length(lightVector);

      vec3 L = normalize(lightVector);
      vec3 N = normalize(v_Normal);
      float nDotL = max(dot(N,L), 0.0);

      // Reflection
      vec3 R = reflect(-L, N);

      // eye
      vec3 E = normalize(u_cameraPos-vec3(v_VertPos));

      //Specular
      float specular = pow(max(dot(E,R), 0.0), 64.0) * 0.8;

      vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
      vec3 ambient = vec3(gl_FragColor) * 0.2;

      ambient = ambient * u_ambientColor;
      
      if(u_lightOn) {
        if(u_whichTexture == -2) {
          gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
        } else {
          gl_FragColor = vec4(diffuse + ambient, 1.0);
        }
      }

    } else {
      float spotlight_limit = 0.94;
      vec3 lightVector = u_lightPos - vec3(v_VertPos);
      float r = length(lightVector);
      
      // calculate n dot l
      vec3 L = normalize(lightVector);
      vec3 N = normalize(v_Normal);
      float nDotL = max(dot(N, L), 0.0);
      
      // reflection
      vec3 R = reflect(-L, N);
      
      // eye
      vec3 E = u_cameraPos - vec3(v_VertPos);
      E = normalize(E);

      // spotlight code from maansilv
      vec3 diffuse = vec3(0.0, 0.0, 0.0);
      vec3 ambient = vec3(gl_FragColor) * 0.15;
      float specular = 0.0;
      float dotFromDirection = dot(normalize(lightVector), -normalize(u_lightDir));
      if (dotFromDirection >= (spotlight_limit - .1)){
        if (dotFromDirection >= spotlight_limit){
          diffuse = vec3(gl_FragColor) * nDotL;
          if (nDotL > 0.0){
            specular = pow(max(dot(E, R), 0.0), 15.0);
          }
        } else{
          diffuse = vec3(gl_FragColor) * nDotL * ((dotFromDirection - spotlight_limit + 0.1)/0.1);
          if (nDotL > 0.0){
            specular = pow(max(dot(E, R), 0.0), 15.0)* ((dotFromDirection - spotlight_limit + 0.1)/0.1);
          }
        }
        
      }
      
      if(u_lightOn) {
        if(u_whichTexture == -2) {
          gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
        } else {
          gl_FragColor = vec4(diffuse + ambient, 1.0);
        }
      }
    } 

  }`

// declaring global variables to see changes
let canvas;
let gl;
let a_Position;
let a_Normal;
let u_FragColor;
let u_Size;
let a_UV;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_whichTexture;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_lightPos;
let u_cameraPos;
let u_lightOn;
let u_ambientColor;
let u_point_light;


// setupWebGL() – get the canvas and gl context
function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}


function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
    }
  
    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return;
    }
  
    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
      console.log('Failed to get the storage location of u_FragColor');
      return;
    }

    // getthe storage location of a_Position
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
      console.log('Failed to get the storage location of a_UV');
      return;
    }

    // Get the storage location of u_Modelmatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
      console.log('Failed to get the storage location of u_Modelmatrix');
      return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
      console.log('Failed to get the storage location of u_GlobalRotateMatrix');
      return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
    
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
      console.log('Failed to get u_whichTexture');
      return;
    }

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0'); //flower
    if (!u_Sampler0) {
      console.log('Failed to get u_Sampler0');
      return false;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1'); //sea
    if (!u_Sampler1) {
      console.log('Failed to get u_Sampler1');
      return false;
    }

    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2'); //seaweed
    if (!u_Sampler2) {
      console.log('Failed to get u_Sampler2');
      return false;
    }

    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3'); //fish
    if (!u_Sampler3) {
      console.log('Failed to get u_Sampler3');
      return false;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
      console.log('Failed to get the storage location of u_ViewMatrix');
      return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
      console.log('Failed to get the storage location of u_ProjectionMatrix');
      return;
    }

    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
      console.log('Failed to get the storage location of a_Normal');
      return;
    }

    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_lightPos) {
      console.log('Failed to get the storage location of u_lightPos');
      return;
    }

    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos) {
      console.log('Failed to get the storage location of u_cameraPos');
      return;
    }

    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    if (!u_lightOn) {
      console.log('Failed to get the storage location of u_lightOn');
      return;
    }

    u_ambientColor = gl.getUniformLocation(gl.program, 'u_ambientColor');
    if (!u_ambientColor) {
      console.log('Failed to get the storage location of u_ambientColor');
      return;
    }

    // Get the storage location of u_point_light
    u_point_light = gl.getUniformLocation(gl.program, 'u_point_light');
    if (!u_point_light){
      console.log('Failed to get the storage location of u_point_light');
      return -1;
    }

    // Get the storage location of u_lightDir
    u_lightDir = gl.getUniformLocation(gl.program, 'u_lightDir');
    if (!u_lightDir){
      console.log('Failed to get the storage location of u_lightDir');
      return -1;
    }


}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// globals for ui
let g_globalAngle = 0;
let g_globalAngleY = 0;
let g_legAngle = 0;
let g_headAngle = 0;
let g_fill = 0;
let g_bigTail = 0;
let g_medTail = 0;
let g_smallTail = 0;
let g_animation = 0;
let shift = 0;
let time = 0;
let g_normalOn=false;
let g_lightPos = [0, 1, -2];
let g_lightDir = [0, -1, 0];
let g_lightOn = true;
let g_point_light = true;
let g_ambientColor = [1,1,1,1];

var g_camera = new Camera();

function addActionForHtmlUI() {

  // point v spot light
  document.getElementById('point_light').onclick = function(){g_point_light = true; renderAllShapes();};
	document.getElementById('spot_light').onclick = function(){g_point_light = false; renderAllShapes();};

  // normals
  document.getElementById('normalOn').onclick = function() {g_normalOn=true;};
  document.getElementById('normalOff').onclick = function() {g_normalOn=false;};

  // light on and off
  document.getElementById('lightON').onclick = function() {g_lightOn=true;};
  document.getElementById('lightOFF').onclick = function() {g_lightOn=false;};

  // button
  document.getElementById('on').addEventListener('click', function () { g_animation = true; });
  document.getElementById('off').addEventListener('click', function () { g_animation = false; });

  // color slider
  document.getElementById('lightSlideR').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_ambientColor[0] = this.value/255; renderAllShapes();}}); 
  document.getElementById('lightSlideG').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_ambientColor[1] = this.value/255; renderAllShapes();}}); 
  document.getElementById('lightSlideB').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_ambientColor[2] = this.value/255; renderAllShapes();}});  

  // light slider
  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[0] = this.value/100; renderAllShapes();}}); 
  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[1] = this.value/100; renderAllShapes();}}); 
  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) {if(ev.buttons == 1) {g_lightPos[2] = this.value/100; renderAllShapes();}});

  // angle slider
  document.getElementById('angleSlide').addEventListener('mousemove', function () { g_globalAngle = this.value; renderAllShapes(); });
  document.getElementById('leg').addEventListener('mousemove', function () { g_legAngle = this.value; renderAllShapes(); });
  document.getElementById('head').addEventListener('mousemove', function () { g_headAngle = this.value; renderAllShapes(); });
  document.getElementById('test').addEventListener('mousemove', function () { g_fill = this.value; renderAllShapes(); });
  document.getElementById('bigtail').addEventListener('mousemove', function () { g_bigTail = this.value; renderAllShapes(); });
  document.getElementById('medtail').addEventListener('mousemove', function () { g_medTail = this.value; renderAllShapes(); });
  document.getElementById('smalltail').addEventListener('mousemove', function () { g_smallTail = this.value; renderAllShapes(); });
}

function initTextures() {
  var image = new Image();
  if(!image) {
    console.log('Failed to create the image object');
    return false;
  }
  image.onload = function(){loadTexture(image); };
  image.src = 'sand.jpg';
  return true;
}

function initTextures1() {
  var image1 = new Image();
  if(!image1) {
    console.log('Failed to create the image object');
    return false;
  }
  image1.onload = function(){loadTexture1(image1); };
  image1.src = 'underwater.jpg';
  // image1.src = 'fox.png'
  return true;
}

function initTextures2() {
  var image2 = new Image();
  if(!image2) {
    console.log('Failed to create the image object');
    return false;
  }
  image2.onload = function(){loadTexture2(image2); };
  image2.src = 'seaweed.jpg';
  return true;
}

function initTextures3() {
  var image3 = new Image();
  if(!image3) {
    console.log('Failed to create the image object');
    return false;
  }
  image3.onload = function(){loadTexture3(image3); };
  image3.src = 'fish.jpg';
  return true;
}

function loadTexture(image) {
  var texture = gl.createTexture();
  if(!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler0, 0);
  console.log('finished loadTexture0');
}

function loadTexture1(image) {
  var texture = gl.createTexture();
  if(!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler1, 1);
  console.log('finished loadTexture1');
}

function loadTexture2(image) {
  var texture = gl.createTexture();
  if(!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler2, 2);
  console.log('finished loadTexture2');
}

function loadTexture3(image) {
  var texture = gl.createTexture();
  if(!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler3, 3);
  console.log('finished loadTexture3');
}

function main() {

    setupWebGL();

    connectVariablesToGLSL();

    addActionForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
    canvas.onmousemove = function(ev) {if(ev.buttons == 1) { click(ev) } }; 
    document.onkeydown = keydown;
    // initTextures1();
    initTextures();
    initTextures1();
    initTextures2();
    initTextures3();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    // renderAllShapes();
    requestAnimationFrame(tick);
    
}

var g_start_time = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_start_time;

function tick() {

  g_seconds = performance.now()/1000.0 - g_start_time;
  updateAnimationAngles();

  // shift key stuff
  if (shift) {
    g_fill = (.02 * Math.sin(g_seconds));
    time = time + 0.1;
    if (time >= 20) {
      time = 0;
      shift = false;
    }
  }

  renderAllShapes();

  requestAnimationFrame(tick);
}


function click(ev, check) {

  // shift key
  if (ev.shiftKey) {
    shift = true;
  }

  // extract the event click 
  let [x, y] = convertCoordinatesEventToGL(ev);

  // g_globalAngle = x * 360;
  g_globalAngle -= ev.movementX;
  g_globalAngleY -= ev.movementY;

  // render properly
  renderAllShapes();
}

function updateAnimationAngles() {
  if (g_animation) {
    g_bigTail = (8 * Math.sin(g_seconds));
    g_medTail = (4 * Math.sin(g_seconds));
    g_smallTail = (2 * Math.sin(g_seconds));
    g_headAngle = (6 * Math.sin(g_seconds));
    g_legAngle = (5 * Math.sin(g_seconds));
  }

  g_lightPos[0] = 2*Math.cos(.5*g_seconds);
  g_lightPos[1] = 1 + Math.cos(g_seconds)*Math.cos(g_seconds);
  g_lightPos[2] = 2*Math.sin(.5*g_seconds);
}

// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  
    return ([x, y]);
}

function keydown(ev) {
  if(ev.keyCode==	65) { // a
    g_camera.eye.elements[0] -= 0.2;

  } else if(ev.keyCode == 68) { // d
    g_camera.eye.elements[0] += 0.2;
    
  } else if(ev.keyCode == 87) { // w
    g_camera.forward();

  } else if(ev.keyCode == 83) { // s
    g_camera.back();
    
  } else if(ev.keyCode == 81) { // q
    g_camera.panLeft();

  } else if(ev.keyCode == 69) { // e
    g_camera.panRight();
  }
  renderAllShapes();
  console.log(ev.keyCode);
}



var g_map = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

function drawMap() {
  for (let x = 0; x < 13; x++) {
    for (let y = 0; y < 13; y++) {
      if (g_map[x][y] == 1) {
        var walls = new Cube();
        walls.color = [1.0,0.0,0.0,1.0];
        walls.textureNum = -4;
        walls.matrix.scale(1, 1, 1);
        walls.matrix.translate(x-4, -.9, y-4);
        walls.renderquickly();
      }
      if (g_map[x][y] == .5) {
        var walls = new Cube();
        walls.textureNum = -4;
        walls.matrix.scale(1, 1, 1);
        walls.matrix.translate(x-4, -1.4, y-4);
        walls.renderquickly();
      }
      if (g_map[x][y] == 3) {
        var walls = new Cube();
        walls.textureNum = -5;
        walls.matrix.scale(1, 1, 1);
        walls.matrix.translate(x-4, -.75, y-4);
        walls.renderquickly();
      }
      if (g_map[x][y] == 2) {
        var walls = new Cube();
        walls.textureNum = -4;
        walls.matrix.scale(1, 1, 1);
        walls.matrix.translate(x-4, -.75, y-4);
        walls.renderquickly();

        var wall2 = new Cube();
        wall2.textureNum = -4;
        wall2.matrix.scale(1, 1, 1);
        wall2.matrix.translate(x-4, -.25, y-4);
        wall2.renderquickly();
      }
      if (g_map[x][y] == 4) {
        var walls = new Cube();
        walls.textureNum = -4;
        walls.matrix.scale(1, 1, 1);
        walls.matrix.translate(x-4, -.75, y-4);
        walls.renderquickly();

        var wall2 = new Cube();
        wall2.textureNum = -4;
        wall2.matrix.scale(1, 1, 1);
        wall2.matrix.translate(x-4, -.25, y-4);
        wall2.renderquickly();

        var wall3 = new Cube();
        wall3.textureNum = -4;
        wall3.matrix.scale(1, 1, 1);
        wall3.matrix.translate(x-4, .25, y-4);
        wall3.renderquickly();
      }
    }
  }
}



var g_eye = [0, 0, 3];
var g_at = [0, 0, -100];
var g_up = [0, 1, 0];

// actually draw all the shapes.
function renderAllShapes() {

    var startTime = performance.now();  

    // pass the projection matrix
    var projMat = new Matrix4();
    projMat.setPerspective(50, canvas.width / canvas.height, .1, 1000);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    // pass the view matrix
    var viewMat=new Matrix4();
    viewMat.setLookAt(
      g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
      g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
      g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    // pass the matrix to u_ModelMatrix attribute
    var globalRotMat=new Matrix4().rotate(g_globalAngleY,1,0,0);
    globalRotMat.rotate(g_globalAngle, 0, 1, 0);

    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // ground
    var ground = new Cube();
    ground.color = [.7,.7,.7,1.0];
    ground.textureNum = 0;
    ground.matrix.translate(0, -.75, 0);
    ground.matrix.scale(17, 0, 17);
    ground.matrix.translate(-.5, 0, -.5);
    ground.render();
    
    // sky
    var sky = new Cube();
    sky.color = [0.7529,0.7529,0.7529,1.0];
    sky.textureNum = -2;
    if (g_normalOn) sky.textureNum= -6;
    sky.matrix.scale(-6, -6, -6);
    sky.matrix.translate(-.5, -.5, -0.5);
    sky.renderquickly();

    drawMap();

    // Light
    gl.uniform3f(u_ambientColor, g_ambientColor[0],g_ambientColor[1], g_ambientColor[2]);

    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    gl.uniform3f(u_lightDir, g_lightDir[0], g_lightDir[1], g_lightDir[2]);

    gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);

    gl.uniform1i(u_lightOn, g_lightOn);
    gl.uniform1i(u_point_light, g_point_light)

    var light = new Cube();
    light.color = [2,2,0,1];
    light.textureNum = -2;
    light.matrix.translate(g_lightPos[0],g_lightPos[1],g_lightPos[2]);
    light.matrix.scale(-.1,-.1,-.1);
    light.matrix.translate(-.5,-.5,-.5);
    light.renderquickly();

    // Sphere
    var sphere = new Sphere();
    sphere.color = [1, 0.412, 0.706, 1.0];
    sphere.matrix.translate(-1.8, -.08, -1);
    sphere.textureNum = -2;
    if (g_normalOn) sphere.textureNum = -6;
    sphere.matrix.scale(.6,.6,.6);
    sphere.render();

    // new cube
    var squash = new Cube();
    squash.color = [1, 0.412, 0.706, 1.0];
    squash.matrix.translate(-1.3, -.7, 1.3);
    squash.textureNum = -2;
    if(g_normalOn) squash.textureNum= -6;
    squash.matrix.scale(.6,.6,.6);
    squash.renderquickly();

    // Body shape
    var body = new Cube();
    body.color = [0.96,0.77,0.89, 1.0];
    body.textureNum = -2;
    if (g_normalOn) body.textureNum= -6;
    body.matrix.rotate(g_legAngle, 0, 1, 0);
    var bodyMat = new Matrix4(body.matrix);
    var bodyMat2 = new Matrix4(body.matrix);
    var bodyMat3 = new Matrix4(body.matrix);
    var bodyMat4 = new Matrix4(body.matrix);
    var bodyMat5 = new Matrix4(body.matrix);
    body.matrix.translate(-0.6, -0.5, 0.0);
    body.matrix.scale(1.0, 0.3, 0.5);
    body.render();

    // head shape
    var head = new Cube();
    head.color = [0.96,0.77,0.89, 1.0];
    head.textureNum = -2;
    if (g_normalOn) head.textureNum= -6;
    head.matrix.rotate(g_headAngle, 0, 1, 0);
    var headMat = new Matrix4(head.matrix);
    var headMat2 = new Matrix4(head.matrix);
    var headMat3 = new Matrix4(head.matrix);
    var headMat4 = new Matrix4(head.matrix);
    var headMat5 = new Matrix4(head.matrix);
    var headMat6 = new Matrix4(head.matrix);
    var headMat7 = new Matrix4(head.matrix);
    var headMat8 = new Matrix4(head.matrix);
    var headMat9 = new Matrix4(head.matrix);
    head.matrix.translate(-0.7, -0.55, -.06);
    head.matrix.scale(0.4, 0.4, 0.6);
    head.render();

    // front left leg 
    var frontLeft = new Cube();
    frontLeft.color = [0.51,0.21,0.36, 1.0];
    frontLeft.textureNum = -2;
    if (g_normalOn) frontLeft.textureNum= -6;
    frontLeft.matrix = bodyMat;
    frontLeft.matrix.translate(-.2, -.7, -.02);
    frontLeft.matrix.scale(0.05, 0.25, 0.01);
    frontLeft.render();

    // back left leg
    var backLeft = new Cube();
    backLeft.color = [0.51,0.21,0.36, 1.0];
    backLeft.textureNum = -2;
    if (g_normalOn) backLeft.textureNum= -6;
    backLeft.matrix = bodyMat4;
    backLeft.matrix.translate(.2, -.7, -.02);
    backLeft.matrix.scale(0.05, 0.25, 0.01);
    backLeft.render();

    // front right leg
    var frontRight = new Cube();
    frontRight.color =  [0.51,0.21,0.36, 1.0];
    frontRight.textureNum = -2;
    if (g_normalOn) frontRight.textureNum= -6;
    frontRight.matrix = bodyMat2;
    frontRight.matrix.translate(-.2, -.7, .5);
    frontRight.matrix.scale(0.05, 0.25, 0.01);
    frontRight.render();

    // back right leg
    var backRight = new Cube();
    backRight.color = [0.51,0.21,0.36, 1.0];
    backRight.textureNum = -2;
    if (g_normalOn) backRight.textureNum= -6;
    backRight.matrix = bodyMat5;
    backRight.matrix.translate(.2, -.7, .5);
    backRight.matrix.scale(0.05, 0.25, 0.01);
    backRight.render();

    // left eye
    var leftEye = new Cube();
    leftEye.color = [0.15,0.06,0.27, 1.0];
    leftEye.textureNum = -2;
    if (g_normalOn) leftEye.textureNum= -6;
    leftEye.matrix = headMat;
    leftEye.matrix.translate(-.73, -.42, -.1);
    leftEye.matrix.scale(.1, .1, .1);
    leftEye.render();

    // right eye
    var rightEye = new Cube();
    rightEye.color = [0.15,0.06,0.27, 1.0];
    rightEye.textureNum = -2;
    if (g_normalOn) rightEye.textureNum= -6;
    rightEye.matrix = headMat2;
    rightEye.matrix.translate(-.73, -.42, .45);
    rightEye.matrix.scale(.1, .1, .1);
    rightEye.render();

    // nose
    var nose = new Cube();
    nose.color = [0.47,0.24,0.39, 1.0];
    nose.textureNum = -2;
    if (g_normalOn) nose.textureNum= -6;
    nose.matrix = headMat3;
    nose.matrix.translate(-.72, -.42, .16);
    nose.matrix.scale(.1, .07, .15);
    nose.render();

    // head frill 1 (middle left)
    var frill_1 = new Cone();
    frill_1.color = [0.58,0.27,0.36, 1.0];
    frill_1.textureNum = -2;
    if (g_normalOn) frill_1.textureNum= -6;
    frill_1.matrix = headMat4;
    frill_1.matrix.translate(-.65, -.28 + g_fill, -.24 + g_fill);
    frill_1.matrix.scale(.5, .5, 2);
    frill_1.matrix.rotate(35, 1, 0, 0);
    frill_1.render();

    // head frill2 (top left)
    var frill_2 = new Cone();
    frill_2.color = [0.58,0.27,0.36, 1.0];
    frill_2.textureNum = -2;
    if (g_normalOn) frill_2.textureNum= -6;
    frill_2.matrix = headMat5
    frill_2.matrix.translate(-.65, -.12 + g_fill, -.13 + g_fill);
    frill_2.matrix.scale(.5, .5, 1);
    frill_2.matrix.rotate(45, 1, 0, 0);
    frill_2.render();

    // head frill 3 (bottom left)
    var frill_3 = new Cone();
    frill_3.color = [0.58,0.27,0.36, 1.0];
    frill_3.textureNum = -2;
    if (g_normalOn) frill_3.textureNum= -6;
    frill_3.matrix = headMat6;
    frill_3.matrix.translate(-.65, -.46 + g_fill, -.24 + g_fill);
    frill_3.matrix.scale(.5, .5, 2);
    frill_3.matrix.rotate(18, 1, 0, 0);
    frill_3.render();

    // head frill 4 (bottom right)
    var frill_4 = new Cone();
    frill_4.color = [0.58,0.27,0.36, 1.0];
    frill_4.textureNum = -2;
    if (g_normalOn) frill_4.textureNum= -6;
    frill_4.matrix = headMat7;
    frill_4.matrix.translate(-.65, -.46 + g_fill, .7 + g_fill);
    frill_4.matrix.scale(.5, .5, 2);
    frill_4.matrix.rotate(162, 1, 0, 0);
    frill_4.render();

    // head frill 5 (middle right)
    var frill_5 = new Cone(); 
    frill_5.color = [0.58,0.27,0.36, 1.0];
    frill_5.textureNum = -2;
    if (g_normalOn) frill_5.textureNum= -6;
    frill_5.matrix = headMat8;
    frill_5.matrix.translate(-.65, -.28 + g_fill, .7 + g_fill);
    frill_5.matrix.scale(.5, .5, 2);
    frill_5.matrix.rotate(145, 1, 0, 0);
    frill_5.render();

    // head frill 6 (top right)
    var frill_6 = new Cone();
    frill_6.color = [0.58,0.27,0.36, 1.0];
    frill_6.textureNum = -2;
    if (g_normalOn) frill_6.textureNum= -6;
    frill_6.matrix = headMat9;
    frill_6.matrix.translate(-.602, -.105 + g_fill, .59 + g_fill);
    frill_6.matrix.rotate(135, 1, 0, 0);
    frill_6.render();

    // big tail
    var tail_big = new Cube();
    tail_big.color = [0.58,0.25,0.38, 1.0];
    tail_big.textureNum = -2;
    if (g_normalOn) tail_big.textureNum= -6;
    tail_big.matrix = bodyMat3;
    tail_big.matrix.rotate(g_bigTail, 0, 1, 0);
    var bodyMat_tail = new Matrix4(tail_big.matrix);
    tail_big.matrix.translate(-.2, -.45 , .2);
    tail_big.matrix.scale(.9, .3, .1);
    tail_big.render();

    // medium tail
    var tail_med = new Cube();
    tail_med.color = [0.58,0.25,0.38, 1.0];
    tail_med.textureNum = -2;
    if (g_normalOn) tail_med.textureNum= -6;
    tail_med.matrix = bodyMat_tail;
    tail_med.matrix.rotate(g_medTail, 0, 1, 0);
    var bodyMat_tail_med = new Matrix4(tail_med.matrix);
    tail_med.matrix.translate(-.2, -.45 , .225);
    tail_med.matrix.scale(1, .2, .05);
    tail_med.render();

    // small tail
    var tail_small = new Cube();
    tail_small.color = [0.58,0.25,0.38, 1.0];
    tail_small.textureNum = -2;
    if (g_normalOn) tail_small.textureNum= -6;
    tail_small.matrix = bodyMat_tail_med;
    tail_small.matrix.rotate(g_smallTail, 0, 1, 0);
    tail_small.matrix.translate(-.2, -.45 , .23);
    tail_small.matrix.scale(1.1, .1, .025);
    tail_small.render();

    var duration = performance.now() - startTime;
    sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm) {
      console.log("Failed to get " + htmlID + " from HTML");
      return;
  }
  htmlElm.innerHTML = text;
}