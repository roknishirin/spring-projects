class Cube {
    constructor(){
        this.type='cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = -2;
    }


    render() {
        var rgba = this.color;

        // pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the position of a point to a_Position variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the color of a point to u_FragColor variable
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        //front of cube 
        drawTriangle3DUV([0, 0, 0, 1, 1, 0, 1, 0, 0], [0, 0, 1, 1, 1, 0]);
        drawTriangle3DUV([0, 0, 0, 0, 1, 0, 1, 1, 0], [0, 0, 0, 1, 1, 1]);

        // Back of cube
        drawTriangle3DUV([0, 0, 1, 1, 1, 1, 1, 0, 1], [0, 0, 1, 1, 1, 0]); 
        drawTriangle3DUV([0, 0, 1, 0, 1, 1, 1, 1, 1], [0, 0, 0, 1, 1, 1]);

        // Top of cube
        gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);
        drawTriangle3DUV([0, 1, 0, 1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 0]);
        drawTriangle3DUV([0, 1, 0, 0, 1, 1, 1, 1, 1], [0, 0, 0, 1, 1, 1]);

        // Bottom of cube
        gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);
        drawTriangle3DUV([0, 0, 0, 1, 0, 1, 0, 0, 1], [0, 0, 1, 1, 1, 0]);
        drawTriangle3DUV([0, 0, 0, 1, 0, 0, 1, 0, 1], [0, 0, 0, 1, 1, 1]);

        // Right side of cube
        drawTriangle3DUV([1, 0, 0, 1, 1, 0, 1, 1, 1], [0, 0, 0, 1, 1, 1]); 
        drawTriangle3DUV([1, 0, 0, 1, 0, 1, 1, 1, 1], [0, 0, 1, 0, 1, 1]);

        // Left side of cube
        drawTriangle3DUV([0, 0, 0, 0, 1, 1, 0, 1, 0], [1, 0, 0, 1, 1, 1]);
        drawTriangle3DUV([0, 0, 0, 0, 1, 1, 0, 0, 1], [1, 0, 0, 1, 0, 0]); 

    }

    renderquickly() {

        var rgba = this.color;

        // pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the position of a point to a_Position variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the color of a point to u_FragColor variable
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);


        var vert =[];
        var uv =[];
        var Normals = [];
        
        // Front of cube
        vert = vert.concat([0, 0, 0, 1, 1, 0, 1, 0, 0]);
        vert = vert.concat([0, 0, 0, 0, 1, 0, 1, 1, 0]);
        uv = uv.concat([0, 0, 1, 1, 1, 0]);
        uv = uv.concat([0, 0, 0, 1, 1,1]);
        Normals = Normals.concat([0, 0, -1, 0, 0, -1, 0, 0, -1]);
        Normals = Normals.concat([0, 0, -1, 0, 0, -1, 0, 0, -1]);

        // Back of the Cube
        vert = vert.concat([0, 0, 1, 1, 1, 1, 1, 0, 1]);
        vert = vert.concat([0, 0, 1, 0, 1, 1, 1, 1, 1]);
        uv = uv.concat([0, 0, 1, 1, 1, 0]);
        uv = uv.concat([0, 0, 0, 1, 1, 1]);
        Normals = Normals.concat([0, 0, 1, 0, 0, 1, 0, 0, 1]);
        Normals = Normals.concat([0, 0, 1, 0, 0, 1, 0, 0, 1]);

        // Top of Cube
        gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);
        vert = vert.concat([0, 1, 0, 1, 1, 1, 1, 1, 0]);
        vert = vert.concat([0, 1, 0, 0, 1, 1, 1, 1, 1]);
        uv = uv.concat([0, 0, 1, 1, 1, 0]);
        uv = uv.concat([0, 0, 0, 1, 1, 1]);
        Normals = Normals.concat([0, 1, 0, 0, 1, 0, 0, 1, 0]);
        Normals = Normals.concat([0, 1, 0, 0, 1, 0, 0, 1, 0]);

        // Bottom of Cube
        vert = vert.concat([0, 0, 0, 1, 0, 1, 0, 0, 1]);
        vert = vert.concat([0, 0, 0, 1, 0, 0, 1, 0, 1]);
        uv = uv.concat([0, 0, 1, 1, 1, 0]);
        uv = uv.concat([0, 0, 0, 1, 1, 1]);
        Normals = Normals.concat([0, -1, 0, 0, -1, 0, 0, -1, 0]);
        Normals = Normals.concat([0, -1, 0, 0, -1, 0, 0, -1, 0]);
            

        // Right side of Cube
        vert = vert.concat([1, 0, 0, 1, 1, 0, 1, 1, 1]);
        vert = vert.concat([1, 0, 0, 1, 0, 1, 1, 1, 1]);
        uv = uv.concat([0, 0, 0, 1, 1, 1]);
        uv = uv.concat([0, 0, 1, 0, 1, 1]);
        Normals = Normals.concat([1, 0, 0, 1, 0, 0, 1, 0, 0]);
        Normals = Normals.concat([1, 0, 0, 1, 0, 0, 1, 0, 0]);


        // Left side of Cube
        vert = vert.concat([0, 0, 0, 0, 1, 1, 0, 1, 0]);
        vert = vert.concat([0, 0, 0, 0, 1, 1, 0, 0, 1]);
        uv = uv.concat([1, 0, 0, 1, 1, 1]);
        uv = uv.concat([1, 0, 0, 1, 0, 0]); 
        Normals = Normals.concat([-1, 0, 0, -1, 0, 0, -1, 0, 0]);
        Normals = Normals.concat([-1, 0, 0, -1, 0, 0, -1, 0, 0]); 

        // Drawing the Cube
        // drawTriangle3DUV(vert, uv);  
        drawTriangle3DUVNormal(vert, uv, Normals);
    }

}