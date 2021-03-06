// var fs = require('fs');
// //const sturf = require("@turf/turf")
// const _ = require('underscore');
// var obj = JSON.parse(fs.readFileSync('lines.json', 'utf8'));
// //preparing JSON for further processing
// feature_list = obj.features
// var obj_point = JSON.parse(fs.readFileSync('points.json', 'utf8'));
// //preparing JSON for further processing
// feature_list_points = obj_point.features

//definitions
//var totalKv=0;
var obj = {};
//var resistance={};
var resistance={};
var transformer_losses={};


// var counter=0;
function Node(data,lat,long,capacity, conductor_type) {
    this.data = data;
    this.km = 0;
    this.kv = null;
    this.x = lat;
    this.y = long;
    this.capacity = capacity;
    this.parent = null;
    this.children = [];
    this.prod=0; //km x KVA
    this.rename="0";
    this.line_current=0;
    this.conductor_type=conductor_type;
    this.resistance= getPropertyResistance(conductor_type); 
    this.distance= 0; //changes made
    this.power_loss= 0;
    this.transformer_loss=0;
    this.percentage_voltage_drop = 0;
    this.voltage = 0;
    // this.resistance=resistance;
    // feature Pole;
    // feature line;
};


//console.log(obj);

function Tree(data,lat,long,capacity) {
    var node = new Node(data,lat,long,capacity);
    this._root = node;
};

Tree.prototype.add = function(value,value_lat,value_long,capacity,conductor_type,parent,callback) {
    var found_flag=0;
    // this is a recurse and immediately-invoking function 
    (function recurse(currentNode,value,parent) {
        // step 3
        if(currentNode.data == parent){
            var node = new Node(value,value_lat,value_long,capacity,conductor_type);
            // console.log(node.capacity);
            node.parent = currentNode;
            currentNode.children.push(node);
            window.obj.value = node;
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





Tree.prototype.search = function(value,callback) {
    var found_flag=0;
    // console.log(value);
    // this is a recurse and immediately-invoking function 
    (function recurse(currentNode,value) {
        // step 3
        if(currentNode.data == value){
            found_flag=1;
            callback(currentNode);
        }
        // step 3
        for (var i = 0, length = currentNode.children.length; i < length; i++) {
            // step 4
            recurse(currentNode.children[i],value);
        }     
        // step 1
    })(this._root,value);
    if(found_flag==0){
        return("-1");
    }

};

Tree.prototype.traverseDF = function(callback) {
 
    // this is a recurse and immediately-invoking function 
    (function recurse(currentNode) {
        // step 2
        window.counter+=1;
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

function findKv(currentNode) {

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
    return currentNode.kv;
};

function findKm(currentNode) {
    currentNode.km=0;
    if(currentNode.children.length==0){
        // console.log('ye zero hai');
        return 0;
    }
    for (var i = 0, length = currentNode.children.length; i < length; i++) {
        
    if(currentNode.children[i].kv > 0 )
        currentNode.km+=geoDistance(currentNode.x,currentNode.y,currentNode.children[i].x,currentNode.children[i].y)+findKm(currentNode.children[i]);
        currentNode.children[i].distance=geoDistance(currentNode.x,currentNode.y,currentNode.children[i].x,currentNode.children[i].y); //changes made
        //changes made
        // console.log(geoDistance(currentNode.y,currentNode.x,currentNode.children[i].y,currentNode.children[i].x),currentNode.x,currentNode.y,currentNode.children[i].x,currentNode.children[i].y,currentNode.data,currentNode.children[i].data);   
    }
    // console.log(currentNode.km,currentNode.data);
    currentNode.prod=currentNode.km*currentNode.kv;
    return currentNode.km;
};

// function totalKv(currentNode){
//     //  if(currentNode.children.length==0){
//     //     // console.log('ye zero hai');
//     //     return currentNode.capacity;
//     // }
//     var kv_sum = 0;
//     for (var i = 0, length = currentNode.children.length; i < length; i++) {
//         kv_sum+=findKv(currentNode);
//         // console.log(geoDistance(currentNode.y,currentNode.x,currentNode.children[i].y,currentNode.children[i].x),currentNode.x,currentNode.y,currentNode.children[i].x,currentNode.children[i].y,currentNode.data,currentNode.children[i].data);   
//     }
//     // currentNode.kv=currentNode.capacity+child_sum;
//     // // console.log(currentNode.km,currentNode.data);
//     // currentNode.prod=currentNode.km*currentNode.kv;
//     return kv_sum;
// };


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

function renum(currentNode){

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
// sorted_list = _.sortBy(feature_list, function(feature){
//     // return "" + feature.properties.feeder_id + feature.properties.start_point
//     return feature.properties.id
// })
// grouped_list = _.groupBy(sorted_list,function(feature){
//     return feature.properties.feeder_id
// })
// no_of_feeder_id = _.uniq(sorted_list,true,function(feature){
//     return feature.properties.feeder_id
// })

// function createTreeValuePair(feeder_id,grouped_list,feature_list_points){
//     feeder_id=240;
//     rows=grouped_list[feeder_id];
//     for(var i=1; i<=rows.length;i++){

//         obj.
//     }
//}

function getPropertyResistance(conductor_type){


    resistance["AAAC-Rabbit (55 mm2)"] = 1.0692;
    resistance["AAAC-Weasel (34 mm2)"] = 0.67068
    resistance["AAAC-DOG (100 mm2)"] = 0.36612;
    resistance["ACSR-Rabbit (50 mm2)"] = 0.596592;
    resistance["ACSR-Wease (30 mm2)"] = 1.003212;
    resistance["ACSR-DOG (105 mm2)"] = 0.301536;
    resistance["AB Cable (95 mm2)"] = 0.32;
    resistance["AB Cable (70 mm2)"] = 0.443;
    resistance["AB Cable (120 mm2)"] = 0.253;
    resistance["AB Cable (35 mm2)"] = 0.868;
    resistance["3C X 70sqmm"] = 0.5700;
    resistance["3C X 95sqmm"] = 0.416;
    resistance["3C x 120sqmm"] = 0.268;
    resistance["3C X 150sqmm"] = 0.268;
    resistance["3C X 185sqmm"] = 0.211;
    resistance["3C X 225sqmm"] = 0.189;
    resistance["3C X 240sqmm"] = 0.161;
    resistance["3C X 300 sqmm"] = 0.121;

    return resistance[conductor_type];
};

function getPropertyLoad(capacity){

    transformer_losses["0"]=[0,0];
    transformer_losses["5"]=[25,140];
    transformer_losses["10"]=[45,225];
    transformer_losses["16"]=[65,425];
    transformer_losses["25"]=[100,685];
    transformer_losses["50"]=[150,1300];
    transformer_losses["63"]=[180,1235];
    transformer_losses["100"]=[260,1760];
    transformer_losses["200"]=[480,2500];
    transformer_losses["250"]=[480,2500];
    transformer_losses["300"]=[580,3850];
    transformer_losses["500"]=[850,5600];
    transformer_losses["600"]=[1100,7450];
    transformer_losses["1000"]=[1650,12500];

    return transformer_losses[capacity];
}

//function getProperty

function getTransformerLoss(capacity, line_current){

    var no_load_loss = getPropertyLoad(capacity)[0];
    var load_loss = getPropertyLoad(capacity)[1]*line_current;
    var total_loss = no_load_loss + load_loss;
    // console.log(total_loss);
    return (total_loss);


    // return resistance[conductor_type];
};

function getElectricalLoss(root_kv,currentNode,max_amp){ //cut rootNode for currentNode
    //Given SS voltage, max ampere and pf.
    var ss_voltage = 11;
    var total_kv = root_kv;
    var connected_load_ampere = total_kv/(Math.sqrt(3)*ss_voltage);
    var amp_df = max_amp/connected_load_ampere;
    var factor_k = amp_df*amp_df;

    for (var i = 0, length = currentNode.children.length; i < length; i++) {
        currentNode.line_current = (currentNode.kv*amp_df)/(Math.sqrt(3)*ss_voltage);
        // console.log(currentNode.line_current);
        currentNode.power_loss = currentNode.line_current*currentNode.line_current*currentNode.resistance*currentNode.distance;
        // console.log(currentNode.distance);
        if(currentNode.capacity > 0)
            currentNode.transformer_loss=getTransformerLoss(currentNode.capacity, currentNode.line_current);
            // console.log(currentNode.transformer_loss);
        //getVoltageDrop(currentNode);
        // getVoltage(currentNode);
        getElectricalLoss(root_kv,currentNode.children[i],max_amp);
    }
    // console.log(currentNode.power_loss,currentNode.rename);
    return currentNode.power_loss;

    //console.log(getPropertyLoad(10)[0]);
    //console.log(getProperty("AAAC-Rabbit (55mm2)"));
    // console.log(transformer_losses[])
    // (function traverseNode(currentNode, ss_voltage, amp_df) {
    //     // step 2
    //     for (var i = 0, length = currentNode.children.length; i < length; i++) {

    //         currentNode.children[i].line_current = (currentNode.children[i].kv*amp_df)/(sqrt(3)*ss_voltage);
    //         currentNode.heat_loss = currentNode.line_current*currentNode.line_current*currentNode.resistance;
    //         // step 3
    //         if(currentNode.capacity!=0)
    //         {
    //             currentNode.transformer_loss= getTransformerLoss(currentNode.capacity, currentNode.line_current);
    //         }

    //         traverseNode(currentNode.children[i], ss_voltage, amp_df);

    //     }
 
    //     // step 4
    //     // callback(currentNode);
         
    //     // step 1
    // })(rootNode, ss_voltage, amp_df);

}

function getVoltageDrop(currentNode){


    var voltage_drop = (Math.sqrt(3)*currentNode.power_loss*currentNode.resistance)/currentNode.distance;
    // voltage_drop=()
    currentNode.percentage_voltage_drop = voltage_drop/100;
    return currentNode.percentage_voltage_drop;
}

function getVoltage(root_volt, currentNode){

    //currentNode.voltage = 11;
    // var voltage_drop = (Math.sqrt(3)*currentNode.power_loss*currentNode.resistance)/currentNode.distance;
    // // voltage_drop=()
    var root_voltage = root_volt;
    //console.log(currentNode.voltage, currentNode.percentage_voltage_drop);
    for (var i = 0, length = currentNode.children.length; i < length; i++) {
            getVoltageDrop(currentNode.children[i]);
            console.log(currentNode.children[i].percentage_voltage_drop);
            currentNode.children[i].voltage = root_voltage - ((currentNode.percentage_voltage_drop/(100*100))*root_voltage);
            getVoltage(currentNode.children[i].voltage, currentNode.children[i]);
    }
    return currentNode.voltage;
    // var voltage_drop = getVoltageDrop(currentNode.voltage,currentNode); 
    // currentNode.percentage_voltage_drop = voltage_drop/100;
    //console.log(currentNode.voltage, currentNode.percentage_voltage_drop);
    // currentNode.children.voltage = currentNode.voltage - (currentNode.percentage_voltage_drop)*volt;

    // //var voltage_drop = (Math.sqrt(3)*currentNode.power_loss*currentNode.resistance)/currentNode.distance;
    //  for (var i = 0, length = currentNode.children.length; i < length; i++) {
    
    //     //var voltage_drop = getVoltageDrop(currentNode.voltage,currentNode);
    //     // currentNode.children[i].voltage = currentNode.voltage - (currentNode.percentage_voltage_drop)*currentNode.voltage;
    //     getVoltage(currentNode.children[i],currentNode.voltage);
    // }    // getVoltage(currentNode.children[i]);

     
}
// for( var i=0;i<no_of_feeder_id.length;i++){
//     createTree(no_of_feeder_id[i].properties.feeder_id)
// }
// console.log(geoDistance(feature_list[0].geometry.coordinates[0][1],feature_list[0].geometry.coordinates[0][0],feature_list[0].geometry.coordinates[1][1],feature_list[0].geometry.coordinates[1][0]));
 
function createTree(feeder_id,grouped_list,feature_list_points){
    // feeder_id=240
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
        tree.add(rows[i].properties.end_point,rows[i].geometry.coordinates[1][1],rows[i].geometry.coordinates[1][0],point.properties.capacity,rows[i].properties.conductor_type,rows[i].properties.start_point,function(node){
            if(rows[i].properties.start_point==node.data){
                count+=1;
            }
            else {
                count2+=1;
                console.log("Couldn't create node.",rows[i].properties.id,rows[i].properties.start_point,rows[i].properties.end_point);
            }

        });
    }  
    tree._root.voltage=11;
    console.log(count,'done',count2,'failed');
    console.log("KVA =",findKv(tree._root));
    console.log("KM =",findKm(tree._root));
    renum(tree._root);
    console.log("Electrical Loss =", getElectricalLoss(tree._root.kv,tree._root.children[0],23.45));
    console.log("Voltage =", getVoltage(11, tree._root));

    //electricalLoss(tree._root,25);
    //console.log(getTransformerLoss(currentNode.capacity,currentNode.line_current));
    return tree;
    // tree.traverseDF(function(node){
    //     console.log(node.rename)
    // })
};