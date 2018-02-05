$(document).ready(function() {
    var config = {
        apiKey: "AIzaSyAMgcr-143SzWFYKxyHDk19Ulm8ZTNRUvw",
        authDomain: "rps-multplayer.firebaseapp.com",
        databaseURL: "https://rps-multplayer.firebaseio.com",
        projectId: "rps-multplayer",
        storageBucket: "rps-multplayer.appspot.com",
        messagingSenderId: "750860625225"
      };
    
    firebase.initializeApp(config);

    var database = firebase.database();
    var player = 0;
    var opponent = 0;


    var data = 0;
    var track = 0;
    var wins = 0;
    var losses = 0;


    database.ref("players").on("value", function(snapshot) {
        console.log("here");
        var data = snapshot.val();
    });
    
    setInterval(function () {console.log(data)}, 500);
});