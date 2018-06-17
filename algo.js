var fs = require('fs');
//const turf = require("@turf/turf")
const _ = require('underscore');
var obj = JSON.parse(fs.readFileSync('lines.json', 'utf8'));
//preparing JSON for further processing
feature_list = obj.features
var obj_point = JSON.parse(fs.readFileSync('points.json', 'utf8'));
//preparing JSON for further processing
feature_list_points = obj_point.features

//definitions
function Node(data,lat,long,capacity) {
    this.data = data;
    this.km = 0;
    this.kv = null;
    this.x = lat;
    this.y = long;
    this.capacity = capacity;
    this.parent = null;
    this.children = [];
    this.prod=0;
    this.rename="0";
}

function Tree(data,lat,long,capacity) {
    var node = new Node(data,lat,long,capacity);
    this._root = node;
}

Tree.prototype.add = function(value,value_lat,value_long,capacity,parent,callback) {
    var found_flag=0;
    // this is a recurse and immediately-invoking function 
    (function recurse(currentNode,value,parent) {
        // step 3
        if(currentNode.data == parent){
            var node = new Node(value,value_lat,value_long,capacity);
            // console.log(node.capacity);
            node.parent = currentNode;
            currentNode.children.push(node);
            found_flag=1;
            callback(currentNode);
            return;
        }
        // step 3
        for (var i = 0, length = currentNode.children.length; i < length; i++) {
            // step 4
            recurse(currentNode.children[i],value,parent);
        }     
        // step 1
    })(this._root,value,parent);
    if(found_flag==0){
        callback(-1);
    }

};
Tree.prototype.traverseDF = function(callback) {
 
    // this is a recurse and immediately-invoking function 
    (function recurse(currentNode) {
        // step 2
        for (var i = 0, length = currentNode.children.length; i < length; i++) {
            // step 3
            recurse(currentNode.children[i]);
        }
 
        // step 4
        callback(currentNode);
         
        // step 1
    })(this._root);
 
};

function geoDistance(lat1, lon1, lat2, lon2) {
    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    dist = dist * 1.609344
    return dist
}

findKm = function(currentNode) {

    if(currentNode.children.length==0){
        // console.log('ye zero hai');
        return 0;
    }
    for (var i = 0, length = currentNode.children.length; i < length; i++) {
        currentNode.km=geoDistance(currentNode.x,currentNode.y,currentNode.children[i].x,currentNode.children[i].y)+findKm(currentNode.children[i]);
        // console.log(geoDistance(currentNode.y,currentNode.x,currentNode.children[i].y,currentNode.children[i].x),currentNode.x,currentNode.y,currentNode.children[i].x,currentNode.children[i].y,currentNode.data,currentNode.children[i].data);   
    }
    // console.log(currentNode.km,currentNode.data);
    return currentNode.km;
};

findKv = function(currentNode) {

    if(currentNode.children.length==0){
        // console.log('ye zero hai');
        return currentNode.capacity;
    }
    var child_sum = 0;
    for (var i = 0, length = currentNode.children.length; i < length; i++) {
        child_sum+=findKv(currentNode.children[i]);
        // console.log(geoDistance(currentNode.y,currentNode.x,currentNode.children[i].y,currentNode.children[i].x),currentNode.x,currentNode.y,currentNode.children[i].x,currentNode.children[i].y,currentNode.data,currentNode.children[i].data);   
    }
    currentNode.kv=currentNode.capacity+child_sum;
    // console.log(currentNode.km,currentNode.data);
    currentNode.prod=currentNode.km*currentNode.kv;
    return currentNode.kv;
};

function getNextVal (num, direction){
    if(direction == "s"){
        if(num.includes("|")){
            no = num.lastIndexOf('|') +1;
            lastPrt = num.substring(no);
            if(lastPrt.includes("A")){
                return num.substring(0,no) + (parseInt(lastPrt.replace("A","")) + 1) + "A";
            }
            else {
                return num.substring(0,no) + (parseInt(lastPrt) + 1);
            }
        }else {
            return "" + (parseInt(num) + 1);
        }
    }
    else if(direction == "t"){
        return (num + "|1");
    }
    else if(direction == "a"){
        return (num + "|1A");
    }
    else {
        return "";
    }
}
renum = function(currentNode){

if(currentNode.children.length==0){
        // console.log('ye zero hai');
        return 0;
    }
    var x,y,z,a,b,c;
    x=y=z=a=b=c=-1;

    for (var i = 0, length = currentNode.children.length; i < length; i++) {
      if(currentNode.children[i].prod>x)
        {
            c=b;
            b=a;
            a=i;

            z=y;
            y=x;
            x=currentNode.children[i].prod;
        }
        else if(currentNode.children[i].prod>y)
        {
            c=b;
            b=i;

            z=y;
            y=currentNode.children[i].prod;
        }
        else if(currentNode.children[i].prod>z)
        {
            c=i;
            z=currentNode.children[i].prod;
        }
    }

    if(x!=-1)
    {
        currentNode.children[a].rename=getNextVal(currentNode.rename,"s");
        if(y!=-1)
        {
            currentNode.children[b].rename=getNextVal(currentNode.rename,"t");
            if(z!=-1)
            {
                currentNode.children[c].rename=getNextVal(currentNode.rename,"a");
            }
        }
    }

     for (var i = 0, length = currentNode.children.length; i < length; i++) {
            // step 3
            renum(currentNode.children[i]);
        }
 
        // step 4
        // callback(currentNode);

}
sorted_list = _.sortBy(feature_list, function(feature){
    // return "" + feature.properties.feeder_id + feature.properties.start_point
    return feature.properties.id
})
grouped_list = _.groupBy(sorted_list,function(feature){
    return feature.properties.feeder_id
})
no_of_feeder_id = _.uniq(sorted_list,true,function(feature){
    return feature.properties.feeder_id
})

createTree = function(feeder_id){
    feeder_id=240
    rows=grouped_list[feeder_id]
    console.log("creating tree of ",rows.length,"rows with root as",rows[0].properties.start_point);
    // finds point with the same id for capacity property
    point = _.find(feature_list_points, function(feature){ 
        if(feature.properties.id == rows[0].properties.start_point)
            return true });
    // adds new base(root node to) the tree
    var tree = new Tree(rows[0].properties.start_point,rows[0].geometry.coordinates[0][1],rows[0].geometry.coordinates[0][0],point.properties.capacity);
    var count=0,count2=0;
    for (var i = 0; i < rows.length; i++) {
        // console.log(rows[i].properties.end_point)
        // finds capacity of new to be added node
        point = _.find(feature_list_points, function(feature){ 
                    if(feature.properties.id == rows[i].properties.end_point)
                return true });
        // console.log(point.properties.capacity);
        // console.log(rows[i].properties.end_point,rows[i].geometry.coordinates[1][1],rows[i].geometry.coordinates[1][0],rows[i].properties.start_point);
        //adds new node to the tree
        tree.add(rows[i].properties.end_point,rows[i].geometry.coordinates[1][1],rows[i].geometry.coordinates[1][0],point.properties.capacity,rows[i].properties.start_point,function(node){
            if(rows[i].properties.start_point==node.data){
                count+=1;
            }
            else {
                count2+=1;
                console.log("ye nai hua",rows[i].properties.id,rows[i].properties.start_point,rows[i].properties.end_point);
            }

        });
    }  
    console.log(count,'done',count2,'failed');
    console.log(findKm(tree._root));
    console.log(findKv(tree._root));
    renum(tree._root);
    tree.traverseDF(function(node){
        console.log(node.rename)
    })
}

for( var i=0;i<no_of_feeder_id.length;i++){
    createTree(no_of_feeder_id[i].properties.feeder_id)
}
// console.log(geoDistance(feature_list[0].geometry.coordinates[0][1],feature_list[0].geometry.coordinates[0][0],feature_list[0].geometry.coordinates[1][1],feature_list[0].geometry.coordinates[1][0]));
 