var roomRef;
var peer;
var _id;
var key = "5e62xgu1fv67p66r"
var debug = true;
function connect(id){
    var fbRef = new Firebase('https://whiteboard-monitor.firebaseIO.com/');
    roomRef = fbRef.child(id)
    roomRef.set(['null']);
    window.onbeforeunload = function(){
        roomRef.remove();
    }
    initPeer(id);
}

function initPeer(id){
    var peer = new Peer(id, {key:key, debug: debug});
    peer.on('open', function(id){
        console.log(id);
        _id = id;
        //list id on firebase
        
        document.getElementById("room_id").disabled = true;
    });
    peer.on('error', function(error){
        console.log(error);
        throw(error);
    });
    
    roomRef.on('child_added', function addUser(snapshot){
        if(snapshot.val() != _id && snapshot.val() != 'null'){
            console.log(snapshot.val());
            var conn = peer.connect(snapshot.val());
            conn.on('open', function(){
                var whiteboard = document.createElement('whiteboard-canvas');
                var wbdiv = document.createElement('div');
                var namespan = document.createElement('span');
                namespan.innerHTML = snapshot.val();
                wbdiv.appendChild(namespan);
                wbdiv.appendChild(whiteboard);
                document.body.appendChild(wbdiv);
                conn.on('data', function(data){
                    switch(data.type){
                        case "drawstart":
                            whiteboard.drawStart(data.coord.x, data.coord.y, true);
                            break;
                        case "draw":
                            whiteboard.draw(data.coord.x, data.coord.y, true);
                            break;
                        case "drawend":
                            break;
                    }
                });
                
                whiteboard.addEventListener('drawstart', function(evt){
                    conn.send({type: 'drawstart', coord: evt.detail});
                }, false);
                whiteboard.addEventListener('draw', function(evt){
                    conn.send({type: 'draw', coord: evt.detail});
                }, false);
                whiteboard.addEventListener('drawend', function(evt){
                    conn.send({type:'drawend'});
                }, false);
            });
            conn.on('error', function(error){
                console.log(error);
            });
        }
    });
}

document.getElementById('start').addEventListener('click', function(){
    connect(document.getElementById('room_id').value);
}, false);