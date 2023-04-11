// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform float u_Size;
    void main() {
        gl_Position = a_Position;
        gl_PointSize = u_Size;
    }`

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' +  // uniform変数
    'void main() {\n' +
    '  gl_FragColor = u_FragColor;\n' +
    '}\n';


// declaring global variables to see changes
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

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

    // Get the storage location of u_Size
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// globals for ui
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 10;
let g_selectedType = POINT;
let g_selectedSegment = 10;
document.getElementById("sizeSlide").value = "10"; 

function addActionForHtmlUI() {
    // Button 
    document.getElementById('clearplease').onclick = function() {g_shapesList = []; clearing(); };
    document.getElementById('undo').onclick = function() { undo(); };
    document.getElementById('eraser').onclick = function() { eraser(); };

    document.getElementById('point').onclick = function() { g_selectedType = POINT };
    document.getElementById('triangle').onclick = function() { g_selectedType = TRIANGLE };
    document.getElementById('circle').onclick = function() { g_selectedType = CIRCLE };
    document.getElementById('paint').onclick = function() { drawCat(vec); };
  
    // Slider (color)
    document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value / 100; });
    document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value / 100; });
    document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value / 100; });

    // document.getElementById("orange").style.backgroundColor = '[1.0, 1.0, 1.0, 1.0];';
  
    // Size 
    document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
    document.getElementById('segSlide').addEventListener('mouseup', function() { g_selectedSegment = this.value; });
  
    //color
    document.getElementById('red').onclick = function() { red(); };
    document.getElementById('orange').onclick = function() { orange(); };
    document.getElementById('yellow').onclick = function() { yellow(); };
    document.getElementById('green').onclick = function() { green(); };
    document.getElementById('blue').onclick = function() { blue(); };
    document.getElementById('indigo').onclick = function() { indigo(); };
    document.getElementById('violet').onclick = function() { violet(); };
}



function clearing() {
    gl.clear(gl.COLOR_BUFFER_BIT); 
}

let vec = [0.0, 0.3, 0.3, -0.6, -0.26, -0.6,
    0.0, 0.3, 0.13, 0.3, 0.3, -0.6,
    -0.26, -0.6, -0.26, -0.73, 0.3, -0.6,
    -0.26, -0.73, -0.13, -0.8, 0.3, -0.6,
    -0.13, -0.8, 0.06, -0.8, 0.3, -0.6,
    0.06, -0.8, 0.26, -0.73, 0.3, -0.6,
    0.26, 0.0, 0.26, -0.26, 0.3, -0.6,
    0.26, 0.0, 0.3, -0.06, 0.3, -0.6,
    0.26, 0.0, 0.6, 0.3, 0.3, -0.06,
    0.0, 0.3, 0.13, 0.3, 0.13, 0.46,
    0.0, 0.3, 0.03, 0.46, 0.13, 0.46,
    0.03, 0.46, 0.06, 0.6, 0.13, 0.46,
    0.06, 0.6, 0.13, 0.46, 0.13, 0.6,
    0.06, 0.6, 0.13, 0.6, 0.06, 0.73,
    0.13, 0.6, 0.06, 0.73, 0.13, 0.73,
    0.13, 0.73, 0.3, 0.73, 0.26, 0.86,
    0.06, 0.73, -0.1, 0.73, -0.06, 0.86,
    0.13, 0.53, 0.33, 0.6, 0.2, 0.63,
    0.13, 0.53, 0.13, 0.63, 0.2, 0.63,
    0.33, 0.6, 0.2, 0.63, 0.31, 0.66,
    0.2, 0.63, 0.31, 0.66, 0.3, 0.73,
    0.2, 0.63, 0.3, 0.73, 0.2, 0.73,
    0.06, 0.53, 0.06, 0.63, 0, 0.63,
    0.06, 0.53, -0.13, 0.6, 0, 0.63,
    -0.13, 0.6, -0.1, 0.73, 0, 0.63,
    -0.1, 0.73, 0, 0.73, 0, 0.63,
    0.2, 0.7, 0.2, 0.73, 0.13, 0.73,
    0, 0.7, 0, 0.73, 0.06, 0.73
];
  
function drawCat(vertices) {
  
    //function initVertexBuffers(gl) {
    var n = 84; // The number of vertices
  
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
//   Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);
  
  gl.drawArrays(gl.TRIANGLES, 0, n);
  
  //return n;
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
    gl.clear(gl.COLOR_BUFFER_BIT);
    
}


var g_shapesList = [];

function click(ev) {

    // extract the event click 
    let [x, y] = convertCoordinatesEventToGL(ev);

    // store new point 
    let point;
    if (g_selectedType == POINT) {
      point = new Point();
    } 
    else if (g_selectedType == TRIANGLE) {
      point = new Triangle();
    } 
    else {
      point = new Circle();
      point.segments = g_selectedSegment;
    }

    point.position = [x, y];

    point.color = g_selectedColor.slice();

    point.size = g_selectedSize;
    g_shapesList.push(point);

    // render properly
    renderAllShapes();
}

// actually draw all the shapes.
function renderAllShapes() {

    // clear <canvas>
    // gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapesList.length;
    for (var i = 0; i < len; i++) {
        g_shapesList[i].render();
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

let v = [0.0, 0.3, 0.3, -0.6, -0.26, -0.6];

// awesomeness point - color library
function red() {
    g_selectedColor = [1.0, 0.0, 0.0, 1.0];    
    document.getElementById("redSlide").value = "100";
    document.getElementById("greenSlide").value = "0";
    document.getElementById("blueSlide").value = "0";
}

function orange() {
    g_selectedColor = [1.0, 0.647, 0.0, 1.0];
    document.getElementById("redSlide").value = "100";
    document.getElementById("greenSlide").value = "64.7";
    document.getElementById("blueSlide").value = "0";
}

function yellow() {
    g_selectedColor = [1.0, 1.0, 0.0, 1.0];
    document.getElementById("redSlide").value = "100";
    document.getElementById("greenSlide").value = "100";
    document.getElementById("blueSlide").value = "0"; 
}

function green() {
    g_selectedColor = [0.0, .55, .27, 1.0];
    document.getElementById("redSlide").value = "0";
    document.getElementById("greenSlide").value = "55";
    document.getElementById("blueSlide").value = "27"; 
}

function blue() {
    g_selectedColor = [0.0, .25, .53, 1.0];
    document.getElementById("redSlide").value = "0";
    document.getElementById("greenSlide").value = "25";
    document.getElementById("blueSlide").value = "53"; 
}

function indigo() {
    g_selectedColor = [.294, 0.0, .51, 1.0];
    document.getElementById("redSlide").value = "29.4";
    document.getElementById("greenSlide").value = "0";
    document.getElementById("blueSlide").value = "51"; 
}

function violet() {
    g_selectedColor = [0.878, 0.69, 1.0, 1.0];
    document.getElementById("redSlide").value = "87.8";
    document.getElementById("greenSlide").value = "69";
    document.getElementById("blueSlide").value = "100"; 
}


function undo() {
    g_shapesList.pop();
    RenderAllShapes();
}


// actually draw all the shapes.
function RenderAllShapes() {

    // clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapesList.length;
    for (var i = 0; i < len; i++) {
        g_shapesList[i].render();
    }
}


function eraser() {
    g_selectedColor = [0.0, 0.0, 0.0, 1.0];    
    document.getElementById("redSlide").value = "0";
    document.getElementById("greenSlide").value = "0";
    document.getElementById("blueSlide").value = "0"; 
}

