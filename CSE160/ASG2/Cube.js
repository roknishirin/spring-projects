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
       drawTriangle3D([0,0,0, 1,1,0, 1,0,0]);
       drawTriangle3D([0,0,0, 0,1,0, 1,1,0]);

        //back of the Cube
       drawTriangle3D([0,0,1, 1,1,1, 1,0,1]);
       drawTriangle3D([0,0,1, 0,1,1, 1,1,1]);

       gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
       //Top of Cube
       drawTriangle3D([0,1,0, 0,1,1, 1,1,1]);
       drawTriangle3D([0,1,0, 1,1,1, 1,1,0]);

       //bottom of Cube
       drawTriangle3D([0,0,0, 0,0,1, 1,0,1]);
       drawTriangle3D([0,0,0, 1,0,1, 1,0,0]);

       //right side of Cube 
       drawTriangle3D([1,0,0, 1,1,0, 1,1,1]);
       drawTriangle3D([1,0,0, 1,0,1, 1,1,1]);

       //gl.uniform4f(u_FragColor, rgba[0]*.2, rgba[1]*.2, rgba[2]*.2, rgba[3]);
       //left side of Cube
       drawTriangle3D([0,0,0, 0,1,1, 0,1,0]);
       drawTriangle3D([0,0,0, 0,1,1, 0,0,1]); 
       
    }
}