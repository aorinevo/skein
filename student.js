var roomRef;
var peer;
var _id;
var key = "5e62xgu1fv67p66r"
var debug = true;
var whiteboard = document.getElementById('whiteboard');
initPeer();
function connect(id){
    roomRef = new Firebase('https://whiteboard-monitor.firebaseIO.com/'+id);
    var idRef = roomRef.push(_id);
    window.onbeforeunload = function(){
        idRef.remove();
    }
    document.getElementById("room_id").disabled = true;
}

function initPeer(){
    var peer = new Peer({key:key, debug: debug});
    peer.on('open', function(id){
        console.log(id);
        _id = id;
        //list id on firebase
        
        document.getElementById('start').addEventListener('click', function(){
            connect(document.getElementById('room_id').value);
        }, false);
    });
    peer.on('error', function(error){
        console.log(error);
        throw(error);
    });
    
    peer.on('connection', function(conn){
        conn.on('open', function() {
            whiteboard.addEventListener('drawstart', function(evt){
                conn.send({type: 'drawstart', coord: evt.detail});
            }, false);
            whiteboard.addEventListener('draw', function(evt){
                conn.send({type: 'draw', coord: evt.detail});
            }, false);
            whiteboard.addEventListener('drawend', function(evt){
                conn.send({type:'drawend'});
            }, false);
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
        });
        conn.on('error', function(error){
            console.log(error);
        });
    });
}



