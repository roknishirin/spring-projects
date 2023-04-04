// DrawRectangle.js

// declaring global variables to see changes
var canvas;
var ctx;

function main() {
    // Retrieve <canvas> element
    canvas = document.getElementById('cnv1');

    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    // Get the rendering context for 2DCG 
    ctx = canvas.getContext('2d');

    // Draw a blue rectangle
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';                    // Set a black color
    ctx.fillRect(0, 0, canvas.width, canvas.height);         // Fill a rectangle with the color

    //instantiate a vector v1
    // var v1 = new Vector3([2.25, 2.25, 0.0]);
    // drawVector(v1, "red");

}

function drawVector(v, color) {
    ctx.strokeStyle = color;

    // have center
    let cx = canvas.width / 2;
    let cy = canvas.height / 2;
    
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + v.elements[0] * 20, cy - v.elements[1] * 20, v.elements[2] * 20);
    ctx.stroke();
}

function handleDrawEvent() {
    // console.log("hello world"); // debugging
    
    // Read the values of the text boxes to create v1
    let x = document.getElementById("name_1").value;
    let y = document.getElementById("name_2").value;

    // Read the values of the text boxes to create v2
    let xx = document.getElementById("name_a").value;
    let yy = document.getElementById("name_b").value;

    // clearing canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';                    // Set a black color
    ctx.fillRect(0, 0, canvas.width, canvas.height);         // Fill a rectangle with the color

    // call drawVector(v1, "red")
    var v1 = new Vector3([x, y, 0.0]);
    drawVector(v1, "red");

    var v2 = new Vector3([xx, yy, 0.0]);
    drawVector(v2, "blue");

}

function handleDrawOperationEvent() {

    // clearing the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';                    // Set a black color
    ctx.fillRect(0, 0, canvas.width, canvas.height);         // Fill a rectangle with the color

    // Read the values of the text boxes to create v1 and 
    var x = document.getElementById("name_1").value;
    var y = document.getElementById("name_2").value;
    
    // call drawVector(v1, "red")
    var v1 = new Vector3([x, y, 0.0]);
    drawVector(v1, "red");

    // Read the values of the text boxes to create v2 and 
    var xx = document.getElementById("name_a").value;
    var yy = document.getElementById("name_b").value;
    
    // call drawVector(v2, "blue")
    var v2 = new Vector3([xx, yy, 0.0]);
    drawVector(v2, "blue");

    // Read the value of the selector and scalar
    var selector = document.getElementById("operation").value;
    var scalar = document.getElementById("name_scale").value;

    // read the value of the selector and do the following
    if (selector == "Add") {
        let v = v1.add(v2);
        drawVector(v, "green");
    }
    else if (selector == "Subtract") {
        let v = v1.sub(v2);
        drawVector(v, "green");
    }
    else if (selector == "Multiply") {
        let v = v1.mul(scalar);
        let vv = v2.mul(scalar);
        drawVector(v, "green");
        drawVector(vv, "green");
    }
    else if (selector == "Divide") {
        let v = v1.div(scalar);
        let vv = v2.div(scalar);
        drawVector(v, "green");
        drawVector(vv, "green");
    }
    else if (selector == "Magnitude") {
        let v = v1.magnitude();
        let vv = v2.magnitude();
        console.log("Magnitude v1: ", v);
        console.log("Magnitude v2: ", vv);
    }
    else if (selector == "Normalize") {
        let v = v1.normalize();
        let vv = v2.normalize();
        drawVector(v, "green");
        drawVector(vv, "green");
    }
    else if (selector == "Angle between") {
        let v = angleBetween(v1, v2);
        console.log("Angle of the triangle: ", v);
    }
    else if (selector == "Area") {
        let v = areaTriangle(v1, v2);
        console.log("Area of the triangle: ", v);
    }
}

function angleBetween(v1, v2) {
    // dot(v1, v2) = ||v1|| * ||v2|| * cos(alpha).

    // dot = ||v1|| * ||v2||
    let dot = Vector3.dot(v1, v2);
    let m1 = v1.magnitude();
    let m2 = v2.magnitude();

    // angle = cos-1 (dot / ||v1|| * ||v2||)
    let angle = Math.acos(dot / (m1 * m2));
    angle *= 180 / Math.PI; // rad -> degree

    return angle;
}
  

function areaTriangle(v1, v2) {
    //  ||v1 x v2]]  equals to the area of the parallelogram that the vectors span.
    
    let a = Vector3.cross(v1, v2);
    let v = new Vector3([a[0], a[1], a[2]]);

    let magnitude = v.magnitude();
    magnitude /= 2;

    return magnitude;
}