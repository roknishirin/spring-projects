// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    // gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
    gl_FragColor = vec4(v_UV, 1.0, 1.0);
  }`

// declaring global variables to see changes
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let a_UV;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;

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

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
      console.log('Failed to get the storage location of u_ViewMatrix');
      return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
      console.log('Failed to get the storage location of u_ProjectionMatrix');
      return;
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

function addActionForHtmlUI() {

  // button
  document.getElementById('on').addEventListener('click', function () { g_animation = true; });
  document.getElementById('off').addEventListener('click', function () { g_animation = false; });

  // angle slider
  document.getElementById('angleSlide').addEventListener('mousemove', function () { g_globalAngle = this.value; renderAllShapes(); });
  document.getElementById('leg').addEventListener('mousemove', function () { g_legAngle = this.value; renderAllShapes(); });
  document.getElementById('head').addEventListener('mousemove', function () { g_headAngle = this.value; renderAllShapes(); });
  document.getElementById('test').addEventListener('mousemove', function () { g_fill = this.value; renderAllShapes(); });
  document.getElementById('bigtail').addEventListener('mousemove', function () { g_bigTail = this.value; renderAllShapes(); });
  document.getElementById('medtail').addEventListener('mousemove', function () { g_medTail = this.value; renderAllShapes(); });
  document.getElementById('smalltail').addEventListener('mousemove', function () { g_smallTail = this.value; renderAllShapes(); });
}


function main() {

    setupWebGL();

    connectVariablesToGLSL();

    addActionForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
    canvas.onmousemove = function(ev) {if(ev.buttons == 1) { click(ev) } }; 

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

// actually draw all the shapes.
function renderAllShapes() {

    var startTime = performance.now();  

    // pass the matrix to u_ModelMatrix attribute
    var globalRotMat=new Matrix4().rotate(g_globalAngleY,1,0,0);
    globalRotMat.rotate(g_globalAngle, 0, 1, 0);

    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Body shape
    var body = new Cube();
    body.color = [0.96,0.77,0.89, 1.0];
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
    frontLeft.matrix = bodyMat;
    frontLeft.matrix.translate(-.2, -.7, -.02);
    frontLeft.matrix.scale(0.05, 0.25, 0.01);
    frontLeft.render();

    // back left leg
    var backLeft = new Cube();
    backLeft.color = [0.51,0.21,0.36, 1.0];
    backLeft.matrix = bodyMat4;
    backLeft.matrix.translate(.2, -.7, -.02);
    backLeft.matrix.scale(0.05, 0.25, 0.01);
    backLeft.render();

    // front right leg
    var frontRight = new Cube();
    frontRight.color =  [0.51,0.21,0.36, 1.0];
    frontRight.matrix = bodyMat2;
    frontRight.matrix.translate(-.2, -.7, .5);
    frontRight.matrix.scale(0.05, 0.25, 0.01);
    frontRight.render();

    // back right leg
    var backRight = new Cube();
    backRight.color = [0.51,0.21,0.36, 1.0];
    backRight.matrix = bodyMat5;
    backRight.matrix.translate(.2, -.7, .5);
    backRight.matrix.scale(0.05, 0.25, 0.01);
    backRight.render();

    // left eye
    var leftEye = new Cube();
    leftEye.color = [0.15,0.06,0.27, 1.0];
    leftEye.matrix = headMat;
    leftEye.matrix.translate(-.73, -.42, -.1);
    leftEye.matrix.scale(.1, .1, .1);
    leftEye.render();

    // right eye
    var rightEye = new Cube();
    rightEye.color = [0.15,0.06,0.27, 1.0];
    rightEye.matrix = headMat2;
    rightEye.matrix.translate(-.73, -.42, .45);
    rightEye.matrix.scale(.1, .1, .1);
    rightEye.render();

    // nose
    var nose = new Cube();
    nose.color = [0.47,0.24,0.39, 1.0];
    nose.matrix = headMat3;
    nose.matrix.translate(-.72, -.42, .16);
    nose.matrix.scale(.1, .07, .15);
    nose.render();

    // head frill 1 (middle left)
    var frill_1 = new Cone();
    frill_1.color = [0.58,0.27,0.36, 1.0];
    frill_1.matrix = headMat4;
    frill_1.matrix.translate(-.65, -.28 + g_fill, -.24 + g_fill);
    frill_1.matrix.scale(.5, .5, 2);
    frill_1.matrix.rotate(35, 1, 0, 0);
    frill_1.render();

    // head frill2 (top left)
    var frill_2 = new Cone();
    frill_2.color = [0.58,0.27,0.36, 1.0];
    frill_2.matrix = headMat5
    frill_2.matrix.translate(-.65, -.12 + g_fill, -.13 + g_fill);
    frill_2.matrix.scale(.5, .5, 1);
    frill_2.matrix.rotate(45, 1, 0, 0);
    frill_2.render();

    // head frill 3 (bottom left)
    var frill_3 = new Cone();
    frill_3.color = [0.58,0.27,0.36, 1.0];
    frill_3.matrix = headMat6;
    frill_3.matrix.translate(-.65, -.46 + g_fill, -.24 + g_fill);
    frill_3.matrix.scale(.5, .5, 2);
    frill_3.matrix.rotate(18, 1, 0, 0);
    frill_3.render();

    // head frill 4 (bottom right)
    var frill_4 = new Cone();
    frill_4.color = [0.58,0.27,0.36, 1.0];
    frill_4.matrix = headMat7;
    frill_4.matrix.translate(-.65, -.46 + g_fill, .7 + g_fill);
    frill_4.matrix.scale(.5, .5, 2);
    frill_4.matrix.rotate(162, 1, 0, 0);
    frill_4.render();

    // head frill 5 (middle right)
    var frill_5 = new Cone(); 
    frill_5.color = [0.58,0.27,0.36, 1.0];
    frill_5.matrix = headMat8;
    frill_5.matrix.translate(-.65, -.28 + g_fill, .7 + g_fill);
    frill_5.matrix.scale(.5, .5, 2);
    frill_5.matrix.rotate(145, 1, 0, 0);
    frill_5.render();

    // head frill 6 (top right)
    var frill_6 = new Cone();
    frill_6.color = [0.58,0.27,0.36, 1.0];
    frill_6.matrix = headMat9;
    frill_6.matrix.translate(-.602, -.105 + g_fill, .59 + g_fill);
    frill_6.matrix.rotate(135, 1, 0, 0);
    frill_6.render();

    // big tail
    var tail_big = new Cube();
    tail_big.color = [0.58,0.25,0.38, 1.0];
    tail_big.matrix = bodyMat3;
    tail_big.matrix.rotate(g_bigTail, 0, 1, 0);
    var bodyMat_tail = new Matrix4(tail_big.matrix);
    tail_big.matrix.translate(-.2, -.45 , .2);
    tail_big.matrix.scale(.9, .3, .1);
    tail_big.render();

    // medium tail
    var tail_med = new Cube();
    tail_med.color = [0.58,0.25,0.38, 1.0];
    tail_med.matrix = bodyMat_tail;
    tail_med.matrix.rotate(g_medTail, 0, 1, 0);
    var bodyMat_tail_med = new Matrix4(tail_med.matrix);
    tail_med.matrix.translate(-.2, -.45 , .225);
    tail_med.matrix.scale(1, .2, .05);
    tail_med.render();

    // small tail
    var tail_small = new Cube();
    tail_small.color = [0.58,0.25,0.38, 1.0];
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