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
    var track = 0;
    var wins = 0;
    var losses = 0;

    function addPlayer(name) {
        console.log("In addPlayer");
        var welcome = $("<p>");

        var ref = firebase.database().ref("players");
        ref.once("value")
            .then(function(snapshot) {

                //no players have joined yet
                if (snapshot.hasChild("1") === false && snapshot.hasChild("2") === false) {
                    player = 1;
                    opponent = 2;

                //player 1 is present
                } else if (snapshot.hasChild("1") === true) {
                    player = 2;
                    opponent = 1;
                
                //player 2 is present
                } else if (snapshot.hasChild("2") === true) {
                    player = 1;
                    opponent = 2;
                };

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

    function winnerCheck() {
        console.log("In Winner Check");
        var ref = firebase.database().ref();
        choice1 = "";
        choice2 = "";

        ref.once("value")
           .then(function(snapshot) {
            
            var data = snapshot.val();
            var pchoice = data.players[player].choice;
            var ochoice = data.players[opponent].choice;
            var pname = data.players[player].name;
            var oname = data.players[opponent].name;
            
            var rockkey = ["Paper", "Rock", "Scissors"];
            var paperkey = ["Scissors", "Paper", "Rock"];
            var scissorskey = ["Rock", "Scissors", "Paper"];
            var key = [];
            var windiv = $("#midbox");
           
            
            switch(pchoice) {
                case "Rock":
                    key = rockkey;
                    break;
                case "Paper":
                    key = paperkey;
                    break;
                case "Scissors":
                    key = scissorskey;
            }

            for (var i = 0; i<key.length; i++) {
                if (ochoice === key[i]) {
                    switch(i) {
                        case 0:
                            losses++;
                            windiv.html("<p>" + oname + "</p><p>Wins!</p>");
                            database.ref("players/" + player).update({losses: losses});
                            break;
                        case 1:
                            windiv.html("<p>Tie</p><p>Game</p>");
                            break;
                        case 2:
                            wins++;
                            windiv.html("<p>" + pname + "</p><p>Wins!</p>");
                            database.ref("players/" + player).update({wins: wins});
                            break;

                    };
                };
            
            };
        setTimeout(reset, 5000);
        });
    };

    function reset() {
        console.log("In reset");
        $(".rps").empty();
        $("#midbox").empty();
        $()

        if (player === 1) {
            database.ref().update( {
                turn: 1
            });
        };

        $("#player" + player + " .winloss").html("<span>Wins: " + wins + "</span><span>&nbsp;</span><span>Losses: " + losses + "</span>");

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

        database.ref("players/" + player).onDisconnect().remove();
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
            } else if (turn === 3) {
                console.log("Run WInner CHeck")
                winnerCheck();
            };//
        };
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

        database.ref("players/" + turnplayer).update({choice: rpspick});
        database.ref("turn").transaction(function(turn) {return turn + 1});
    });

    $("#submit").on("click", function(event) {
        console.log("In submit");
        event.preventDefault();

        var playername = $("#form-input").val().trim();
        addPlayer(playername);

    });

    $("#send").on("click", function(event) {
        console.log("In send");
        event.preventDefault();
        var chat = $("<p>");

        message = $("#chat-input").val().trim();
        chat.text(message);
        $("#chatbox").append(chat);

        database.ref("chat").push({message});

    });

    console.log("ver1");

});