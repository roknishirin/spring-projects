import * as THREE from './three.module.js';

// code from three.js website where it talks about pickhelper
// https://threejs.org/manual/#en/picking
let audio;

export class PickHelper {
	constructor() {
		this.raycaster = new THREE.Raycaster();
		this.pickedObject = null;
		this.prevObject = null;
		this.pickedObjectSavedColor = 0;
	}
	
	pick(normalizedPosition, scene, camera, time) {
		// cast a ray through the frustum
		this.raycaster.setFromCamera(normalizedPosition, camera);
		// get the list of objects the ray intersected
		const intersectedObjects = this.raycaster.intersectObjects(scene.children);
		
		if ((intersectedObjects.length)&&(intersectedObjects[0].object.name != "")) {
			// pick the first object. It's the closest one
			// record the last selected object as well
			this.prevObject = this.pickedObject;
			this.pickedObject = intersectedObjects[0].object;
			
			// reset the emissiveness of the previous object
			if ((this.prevObject != null)&&(this.prevObject.material.length == 6)){
				this.prevObject.material[4].emissive = {r:0, g:0, b:0};
				this.prevObject.material[4].emissiveIntensity = 0;
				this.prevObject.material[5].emissive = {r:0, g:0, b:0};
				this.prevObject.material[5].emissiveIntensity = 0;
			}
			
			// depending on the itentity of the selected object, do something
			if (this.pickedObject.name == "themesong"){
				this.pickedObject.material[4].emissive = {r:1, g:1, b:1};
				this.pickedObject.material[4].emissiveIntensity = 0.2;
				this.pickedObject.material[5].emissive = {r:1, g:1, b:1};
				this.pickedObject.material[5].emissiveIntensity = 0.2;
				// play the song if the screen is newly selected
				if (this.pickedObject != this.prevObject){
					var audio = document.getElementById("audio");
					audio.src = './songs/fast.mp3';
					audio.play();
				}
			} else if (this.pickedObject.name == "greenhill"){
				this.pickedObject.material[4].emissive = {r:1, g:1, b:1};
				this.pickedObject.material[4].emissiveIntensity = 0.2;
				this.pickedObject.material[5].emissive = {r:1, g:1, b:1};
				this.pickedObject.material[5].emissiveIntensity = 0.2;
				// play the song if the screen is newly selected
				if (this.pickedObject != this.prevObject){
					var audio = document.getElementById("audio");
					audio.src = './songs/greenhill.mp3';
					audio.play();
				}
			// stop the music
			} else{
				var audio = document.getElementById("audio");
				audio.src = '';
			}
		}
	}
}