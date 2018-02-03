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
    var track = 0;

    function addPlayer(name) {
        console.log("In addPlayer");
        var welcome = $("<p>");

        var ref = firebase.database().ref("players");
        ref.once("value")
            .then(function(snapshot) {
                if (snapshot.hasChild("1") === true) {
                    player = 2;
                    box = "#player2";
                } else {
                    player = 1;
                    box = "#player1";
                }
                //add the welcome text
                welcome.text("Hi " + name + "! You are player " + player + "!");
                $("#secondRow").html(welcome);

                //add the player to firebase
                database.ref("players/" + player).set( {
                    losses: 0,
                    name: name,
                    wins: 0
                });
            });
    };

    function takeTurn(turnCount) {
        console.log("In takeTurn");

        var rps = ["Rock", "Paper", "Scissors"];
        var rpsdiv = $("#player" + player + " .rps");

        for (i=0; i<rps.length; i++) {
            var newp = $("<p>");
            
            newp.text(rps[i]);
            newp.addClass("rpsbutton");
            newp.attr("data-value", rps[i]);
            rpsdiv.append(newp);    
        }
        console.log("I finished setting up player", player);
    };

    database.ref("players").on("value", function(snapshot) {
        console.log("In db players change");
        //initialize the player boxes as a new player comes online
        var name;
        var wins;
        var losses;

        snapshot.forEach(function(childSnapshot) {
            
            var childData = childSnapshot.val();
            var player = childSnapshot.key;
            var name = childData.name;
            var wins = childData.wins;
            var losses = childData.losses;
            var childbox;

            if (player === '1') {
                childbox = "#player1";
            } else if (player === '2') {
                childbox = "#player2";
            }

            $(childbox + " .waiting").text(name);
            $(childbox + " .winloss").html("<span>Wins: " + wins + "</span><span>&nbsp;</span><span>Losses: " + losses + "</span>");

            });

        if (snapshot.numChildren() === 2) {
            //remove the event handler
            database.ref("players").off("value");
            //add the turn
            console.log("Setting turn to 1 in the players db change");
            database.ref().update( {
                turn: 1
            })
        };  
    });

    database.ref("turn").on("value", function(snapshot) {
        console.log("In the db turn on");
        if (snapshot.exists()) {

            console.log("Got into turn");
            
            var turn = snapshot.val();
      
            console.log("player", player);
            console.log("turn", turn);

            if (turn === player) {
                //think about killing off left/right and just making the id of the box have the number
                //if I did that I could flash the border here based on turn #
                console.log(player, "was equal");
                takeTurn(turn);
            } else {
                console.log(player,"wasn't equal");
            }
        }
    });

    $(document).on("click", ".rpsbutton", function(event) {
        console.log("I'm in the rps click");
        //set the html up
        var rpspick = $(this).attr("data-value");
        var turnplayer = $(this).parents(".innerbox").attr("id").slice(-1);
        var rpsarea = $("#player" + turnplayer + " .rps");
        var choice = $("<p>");

        console.log("rpsarea", rpsarea);
        
        rpsarea.empty();

        choice.text(rpspick);
        choice.attr("data-value", rpspick);
        choice.addClass("selected");

        rpsarea.append(choice);

        //weird thing happened when the commmented out section was separate
        //race condition????
        database.ref("players/" + turnplayer).update({choice: rpspick}, function() {
            database.ref("turn").transaction(function(turn) {
                console.log("Incrementing turn in the rps click", turn);
                return turn + 1
            });
        });

        // database.ref("players/" + turnplayer).update( {
        //     choice: rpspick
        // })
    })

    $("#submit").on("click", function(event) {
        console.log("In submit");
        event.preventDefault();

        var playername = $("#form-input").val().trim();
        addPlayer(playername);

    })

});