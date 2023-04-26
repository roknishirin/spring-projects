class Cube {
    constructor(){
        this.type='cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }


    render() {
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;

        // Pass the position of a point to a_Position variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the color of a point to u_FragColor variable
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        //front of cube 
        drawTriangle3DUV([0, 0, 0, 1, 1, 0, 1, 0, 0], [0, 0, 1, 1, 1, 0]);
        drawTriangle3DUV([0, 0, 0, 0, 1, 0, 1, 1, 0], [0, 0, 0, 1, 1, 1]);

        gl.uniform4f(u_FragColor, rgba[0] * .7, rgba[1] * .7, rgba[2] * .7, rgba[3]);
        drawTriangle3DUV([0, 0, 1, 1, 1, 1, 0, 1, 1], [0, 0, 1, 1, 1, 0]);
        drawTriangle3DUV([0, 0, 1, 1, 0, 1, 1, 1, 1], [0, 0, 0, 1, 1, 1]);

        // Top of cube
        gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);
        drawTriangle3DUV([0, 1, 0, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 0]);
        drawTriangle3DUV([0, 1, 0, 0, 1, 1, 1, 1, 1], [0, 0, 0, 1, 1, 1]);

        // Bottom of cube
        gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);
        drawTriangle3DUV([0, 0, 0, 1, 0, 1, 0, 0, 1], [0, 0, 1, 1, 1, 0]);
        drawTriangle3DUV([0, 0, 0, 1, 0, 0, 1, 0, 1], [0, 0, 0, 1, 1, 1]);

        // Right side of cube
        gl.uniform4f(u_FragColor, rgba[0] * .8, rgba[1] * .8, rgba[2] * .8, rgba[3]);
        drawTriangle3DUV([0, 0, 0, 0, 1, 1, 0, 1, 0], [0, 0, 1, 1, 1, 0]);
        drawTriangle3DUV([0, 0, 0, 0, 0, 1, 0, 1, 1], [0, 0, 0, 1, 1, 1]);

        // Left side of cube
        gl.uniform4f(u_FragColor, rgba[0] * .8, rgba[1] * .8, rgba[2] * .8, rgba[3]);
        drawTriangle3DUV([1, 0, 0, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 0]);
        drawTriangle3DUV([1, 0, 0, 1, 0, 1, 1, 1, 1], [0, 0, 0, 1, 1, 1]);
       
    }
}