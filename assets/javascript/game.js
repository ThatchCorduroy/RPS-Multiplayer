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
    var box = "";

    function addPlayer(name) {
        var welcome = $("<p>");

        var ref = firebase.database().ref("players");
        ref.once("value")
            .then(function(snapshot) {
                console.log(snapshot.hasChild("1"));
                if (snapshot.hasChild("1") === true) {
                    player = 2;
                    box = "#rightbox";
                } else {
                    player = 1;
                    box = "#leftbox";
                }
                //add the welcome text
                welcome.text("Hi " + name + "! You are player " + player + "!");
                $("#secondRow").html(welcome);

                //initialize the player box
                $(box + ".waiting").text(name)
                $(box + " .winloss").html("<span>Wins: 0</span><span>&nbsp;</span><span>Losses: 0</span>");
    
                //add the player to firebase
                database.ref("players/" + player).set( {
                    losses: 0,
                    name: name,
                    wins: 0
                });
            });
    };

    // function addPlayer(name) {
    //     //set player
    //     whatPlayerAmI();
    //     console.log("player", player);
    //     //add the player to the database
    //     database.ref("players/" + player).set( {
    //         losses: 0,
    //         name: name,
    //         wins: 0
    //     });

    //     welcome.text("Hi " + name + "! You are player " + player + "!");
    //     $("#secondRow").html(welcome);

    //     if (player === 1) {
    //         box = "#leftbox"
    //         $("#leftbox .waiting").text(name)
    //         $("#leftbox .winloss").html("<span>Wins: 0</span><span>&nbsp;</span><span>Losses: 0</span>");

    //     } else if (player === 2) {
    //         $("#rightbox .waiting").text(name)
    //         $("#rightbox .winloss").html("<span>Wins: 0</span><span>&nbsp;</span><span>Losses: 0</span>");
    //     }
    // };

    function turnBox(handside) {
        var rps = ["Rock", "Paper", "Scissors"];
        var rpsdiv = $(handside + "#rps");

        for (i=0; i<rps.length; i++) {
            var newp = $("<p>");
            
            newp.text(rps[i]);
            newp.addClass("rpsbutton")
            newp.attr("data-value", i)
            rpsdiv.append(newp);    
        }
    };

    function selectBox(handside, selection) {
        var rpsdiv = $(handside + "#rps");
        var newp = $("<p>");

        rpsdiv.empty();
        newp.text(selection);
        rpsdiv.append(newp);

    }

    // database.ref().on("child_added", function() {
    //     players += 1
    //     console.log(players);
    // });

    database.ref().on("value", function(snapshot) {
        var data = snapshot.val();



    });

    $("#submit").on("click", function(event) {
        event.preventDefault();

        playername = $("#form-input").val().trim();
        addPlayer(playername);

    })

});