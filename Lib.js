var mergeMeshes = function (meshName, arrayObj, scene) {
	debugger;
    var arrayPos = [];
    var arrayNormal = [];
    var arrayUv = [];
    var arrayUv2 = [];
    var arrayColor = [];
    var arrayMatricesIndices = [];
    var arrayMatricesWeights = [];
    var arrayIndice = [];
    var savedPosition = [];
    var savedNormal = [];
    var newMesh = new BABYLON.Mesh(meshName, scene);
    var UVKind = true;
    var UV2Kind = true;
    var ColorKind = true;
    var MatricesIndicesKind = true;
    var MatricesWeightsKind = true;

    for (var i = 0; i != arrayObj.length ; i++) {
        if (!arrayObj[i].isVerticesDataPresent([BABYLON.VertexBuffer.UVKind]))
            UVKind = false;
        if (!arrayObj[i].isVerticesDataPresent([BABYLON.VertexBuffer.UV2Kind]))
            UV2Kind = false;
        if (!arrayObj[i].isVerticesDataPresent([BABYLON.VertexBuffer.ColorKind]))
            ColorKind = false;
        if (!arrayObj[i].isVerticesDataPresent([BABYLON.VertexBuffer.MatricesIndicesKind]))
            MatricesIndicesKind = false;
        if (!arrayObj[i].isVerticesDataPresent([BABYLON.VertexBuffer.MatricesWeightsKind]))
            MatricesWeightsKind = false;
    }

    for (i = 0; i != arrayObj.length ; i++) {
        var ite = 0;
        var iter = 0;
        arrayPos[i] = arrayObj[i].getVerticesData(BABYLON.VertexBuffer.PositionKind);
        arrayNormal[i] = arrayObj[i].getVerticesData(BABYLON.VertexBuffer.NormalKind);
        if (UVKind)
            arrayUv = arrayUv.concat(arrayObj[i].getVerticesData(BABYLON.VertexBuffer.UVKind));
        if (UV2Kind)
            arrayUv2 = arrayUv2.concat(arrayObj[i].getVerticesData(BABYLON.VertexBuffer.UV2Kind));
        if (ColorKind)
            arrayColor = arrayColor.concat(arrayObj[i].getVerticesData(BABYLON.VertexBuffer.ColorKind));
        if (MatricesIndicesKind)
            arrayMatricesIndices = arrayMatricesIndices.concat(arrayObj[i].getVerticesData(BABYLON.VertexBuffer.MatricesIndicesKind));
        if (MatricesWeightsKind)
            arrayMatricesWeights = arrayMatricesWeights.concat(arrayObj[i].getVerticesData(BABYLON.VertexBuffer.MatricesWeightsKind));

        var maxValue = savedPosition.length / 3;

        arrayObj[i].computeWorldMatrix(true);
        var worldMatrix = arrayObj[i].getWorldMatrix();

        for (var ite = 0 ; ite != arrayPos[i].length; ite += 3) {
            var vertex = new BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(arrayPos[i][ite], arrayPos[i][ite + 1], arrayPos[i][ite + 2]), worldMatrix);
            savedPosition.push(vertex.x);
            savedPosition.push(vertex.y);
            savedPosition.push(vertex.z);
        }

        for (var iter = 0 ; iter != arrayNormal[i].length; iter += 3) {
            var vertex = new BABYLON.Vector3.TransformNormal(new BABYLON.Vector3(arrayNormal[i][iter], arrayNormal[i][iter + 1], arrayNormal[i][iter + 2]), worldMatrix);
            savedNormal.push(vertex.x);
            savedNormal.push(vertex.y);
            savedNormal.push(vertex.z);
        }

        var tmp = arrayObj[i].getIndices();
        for (it = 0 ; it != tmp.length; it++) {
            arrayIndice.push(tmp[it] + maxValue);
        }
        arrayIndice = arrayIndice.concat(tmp);

        arrayObj[i].dispose(false);
    }

    newMesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, savedPosition, false);
    newMesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, savedNormal, false);
    if (arrayUv.length > 0)
        newMesh.setVerticesData(BABYLON.VertexBuffer.UVKind, arrayUv, false);
    if (arrayUv2.length > 0)
        newMesh.setVerticesData(BABYLON.VertexBuffer.UV2Kind, arrayUv, false);
    if (arrayColor.length > 0)
        newMesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, arrayUv, false);
    if (arrayMatricesIndices.length > 0)
        newMesh.setVerticesData(BABYLON.VertexBuffer.MatricesIndicesKind, arrayUv, false);
    if (arrayMatricesWeights.length > 0)
        newMesh.setVerticesData(BABYLON.VertexBuffer.MatricesWeightsKind, arrayUv, false);

    newMesh.setIndices(arrayIndice);
    return newMesh;
};

var loadedPlanograms = [];

function urlExists(url, callback){
	 var request = new XMLHttpRequest;
    request.open('GET', url, true);
    request.send();
    request.onreadystatechange = function(){
        //if(request.readyState==4){
            //console.log(request.readyState);
			if(request.status==200){
				
				if(callback){
					callback(true);
				}
				return true;
			}
			else{
				callback(false);
				return false;
			}
            return true;
        //}else{
        //    return false;
        //}
    }
}

/* let's redefine some BABYLON functions */
BABYLON.Mesh.prototype.setLODCallBackFunc = function (func) { this.readMesh = false; this.LODCallBackFunc = func; }

BABYLON.Mesh.prototype.getLOD = function (camera, boundingSphere) {
    if (!this._LODLevels || this._LODLevels.length === 0) { return this; }

    //debugger;
    var distanceToCamera = (boundingSphere ? boundingSphere : this.getBoundingInfo().boundingSphere).centerWorld.subtract(camera.position).length();

    // last LOD
    if (this._LODLevels[this._LODLevels.length - 1].distance > distanceToCamera) {
        this.LODCallBackFunc && this.LODCallBackFunc(distanceToCamera, this._LODLevels[this._LODLevels.length - 1].mesh);
        return this;
    }

    // some intermediate LOD?
    for (var index = 0; index < this._LODLevels.length; index++) {
        var level = this._LODLevels[index];
        if (level.distance < distanceToCamera) {
            if (level.mesh) {
                level.mesh._preActivate();
                level.mesh._updateSubMeshesBoundingInfo(this.worldMatrixFromCache);
            }
            this.LODCallBackFunc && this.LODCallBackFunc(distanceToCamera, this._LODLevels[index].mesh);
            return level.mesh;
        }
    }

    // the original mesh?
    this.LODCallBackFunc && this.LODCallBackFunc(distanceToCamera, this.mesh);
    return this;
};

/* let's redefine some BABYLON functions */
BABYLON.Mesh.prototype.LoadData = function (scene, name) { 


						this.computeWorldMatrix(true);
						var pos = this.getAbsolutePosition();
	(function(self){
		
		if(self.readMesh == false){	
			//urlExists("20' Hair Color" + ".incremental.babylon", function(exists){
				if(self.readMesh == false){
					BABYLON.SceneLoader.ImportMesh("", "./", name + ".incremental.babylon", scene, function (newMeshes)
					{
						mergeMeshes(self.name, newMeshes,scene);
						
						//newMeshes[0].setPositionWithLocalVector(self.getAbsolutePosition());
						//alert(newMeshes.length);
						//alert(self.getAbsolutePosition().x);
						for(var idx =0; idx<newMeshes.length; idx++){
							//debugger;
							//newMeshes[idx].parent = self;
							//self.meshes.push(newMeshes[idx]);
							//newMeshes[idx].visibility = 0.0;
							
							//newMeshes[idx].rotation.y = 180; // or box1.rotation = new BABYLON.Vector3(Math.PI/4,0,0);
							//newMeshes[idx].scaling.x = 5;
							//newMeshes[idx].scaling.y = 5;
							
							//debugger;
							//newMeshes[idx].position.x = self.position.x;
							//newMeshes[idx].position.y = self.position.z;
							//newMeshes[idx].position.z = self.position.y;
							
							//var normal = self.getNormal();
							
							//var rotationAxis = BABYLON.Vector3.Cross(normal, planeNormal).normalize();
							//var angle = Math.acos(BABYLON.Vector3.Dot(normal, planeNormal)); 
							//newMeshes[idx].rotate(rotationAxis,angle);
							//newMeshes[idx].position = normal.point;
							
							//newMeshes[idx].rotate(BABYLON.Axis.Y, -3.0, BABYLON.Space.LOCAL);
							//newMeshes[idx].translate(BABYLON.Axis.X, self.position.x, BABYLON.Space.LOCAL);
							//newMeshes[idx].translate(BABYLON.Axis.Z, self.position.z, BABYLON.Space.LOCAL);
							
							    //Rotate the box around the y ax	is
//							newMeshes[idx].rotation.y = Math.PI/6;
							
							//newMeshes[idx].visibility = 0.1;
							
							newMeshes[idx].setLODCallBackFunc(function (dist, LODMesh){
								//debugger;
								if(dist >20 ){
									//this.visibility = 0.0;
								}
								else{
									this.visibility = (-dist + 25) / 3.0;
								}
							});
							
							newMeshes[idx].addLODLevel(20, null);
							
							try{
								//newMeshes[idx] && newMeshes[idx].optimizeIndices(function() {
									//alert('dne');
									//newMeshes[idx] && newMeshes[idx].simplify([{distance:20, quality:0.9}, {distance:30, quality:0.8}, {distance:40, quality:0.7}, {distance:50, quality:0.6}]);
								//});
							
								
							}
							catch(e){
								//ignore for now
							}
							
							//newMeshes[idx].dispose();
							//scene.meshes.push(newMeshes[idx]);
						}
						
						//console.log('found but not working', newMeshes.length);
					}, function(){
					
					}, function(){
						//console.log('not found');		
						
					});
					
					
				}
			//});
			self.readMesh = true;
		}
		
	})(this);

	//this.CreateBox("box", 1, scene);
}