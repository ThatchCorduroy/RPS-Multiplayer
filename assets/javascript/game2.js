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
    var ready = false;
    var winstatus = "";

    
    // var track = 0;
    // var wins = 0;
    // var losses = 0;


    database.ref("players").on("value", function(snapshot) {
        console.log("Im in players");
        database.ref("players").off("value");
        var data = snapshot.val();

        console.log('here');

        //players have joined
        if (snapshot.exists()) {
            //the game is already full
            if (snapshot.hasChild("1") === true && snapshot.hasChild("2") === true) {
                $("#main").empty();
                $(".lead").text("Oh my, there are already two players.  Please check back later!");
                return;
            //player 1 is present
            } else if (snapshot.hasChild("1") === true) {
                player = 2;
                opponent = 1;
                initPlayer();

                database.ref("players/" + player).onDisconnect().remove(function () {database.ref().update({turn: -1})});
                
                console.log("I am player " + player);
            //player 2 is present
            } else if (snapshot.hasChild("2") === true) {
                player = 1;
                opponent = 2;
                initPlayer();
                database.ref("players/" + player).onDisconnect().remove(function () {database.ref().update({turn: -1})});
                database.ref("players/" + player).onDisconnect
                console.log("I am player " + player);
            }
        //there are no players yet
        } else {
            player = 1;
            opponent = 2;
            initPlayer(true);
            //database.ref("players/" + player).onDisconnect().remove();
            database.ref("players/" + player).onDisconnect().remove(function () {database.ref().update({turn: -1})});
            console.log("There were no players - I am player 1");
        }
        ///////////////////////////////////////////////////////

        main();
        

        $("#submit").on("click", function(event) {

            event.preventDefault();
            //initPlayer();
             database.ref("players/" + player).update({
                 name: $("#form-input").val().trim()
             }).then(initHTML());
        });

        $(document).on("click", "#player" + player + " .rpsbutton", function() {
            
            //database.ref().update({turn: 0});

            database.ref

            var rpspick = $(this).attr("data-value");
            var turnplayer = $(this).parents(".innerbox").attr("id").slice(-1);

            database.ref().once("value").then(function(snapshot) {
                var data = snapshot.val()
                var thisturn = data.turn;

                var rpsarea = $("#player" + turnplayer + " .rps");
                var choice = $("<p>");
    
                rpsarea.empty();
        
                choice.text(rpspick);
                choice.attr("data-value", rpspick);
                choice.addClass("selected");
        
                rpsarea.append(choice);
        
                database.ref("players/" + turnplayer).update({choice: rpspick}); 
            });
         
            

 

                    // if (data.players[opponent].choice) {
                    //     console.log("player choice", data.players[opponent].choice);
                    // }
                    //if opponent made a choice
                    //if both players made a choice
                    //put what to do in HTML
                    //initHTML();
                
        
        });
  
    });

    function main() {
        console.log("I'm in main");
        database.ref().on("value", function(secondsnap) {
            
            
            var data = secondsnap.val();
            var turn = data.turn;
            console.log("I hit the point above", turn);

            if (data.players[player] && data.players[opponent] && turn === 0) {
                var pchoice = data.players[player].choice;
                var ochoice = data.players[opponent].choice;

                if (pchoice !== "" && ochoice !== "") {
                    console.log("Setting turn to 1");
                    database.ref().update({turn: 1});
                }
            }


            switch(turn) {
                //the start of the game
                case -1:
                    initHTML();
                    break;
                //both players have the selection
                case 0:
                    gameHTML();
                    break;
                //both players have made choices
                case 1:
                    checkWinner();
                    break;
                //we have a winner
                case 3:
                    //
                    winHTML();
                    break;
                case 4:
                    database.ref().off()
                    database.ref("players/" + player).update({choice: ""});
                    database.ref().once("value").then(function(snapshot) {
                        var data = snapshot.val();
                        var turn = data.turn;
            
                        if (data.turn === 4) {
                            database.ref().update({turn: 0});
                        }
                    });

                    setTimeout(reset, 5000);
                    break;
            };

        });
    }

    function initPlayer(first) {
        console.log("Im in initplayer");

        database.ref("turn").once("value").then(function (snapshot) {
            if (!snapshot.exists()) {
                database.ref().update({turn: -1})
            };
        }).then(function () {
        //if there are already players add this player and reset the opponents win/loss
            if (!first) {
                database.ref("players/" + player).set( {
                    choice: "",
                    losses: 0,
                    name: "",
                    wins: 0
                }).then(
                    database.ref("players/" + opponent).update( {
                        losses: 0,
                        wins: 0
                })).then(function() {ready = true})
                .then(initHTML());
                
            } else {
                //if there aren't players setup this player
                database.ref("players/" + player).set( {
                    choice: "",
                    losses: 0,
                    name: "",
                    wins: 0
                }).then(function() {ready = true})
                .then(initHTML());;
            };
        });
    };

    function initHTML() {
        console.log("Im in initHTML");
        var ref = firebase.database().ref();

        ref.once("value").then(function(snapshot) {

            var data = snapshot.val();
            var turn = data.turn;
            //var turn = data.turn;

            var pname = data.players[player].name;
            var pwins = data.players[player].wins;
            var plosses = data.players[player].losses;

            var $lead = $(".lead");
            var $pname = $("#player" + player + " .name");
            var $pwinloss = $("#player" + player + " .winloss");
            var $secondrow = $("#secondrow");

            if (pname !== "") {
                $secondrow.empty();
                $lead.text("Hi " + pname + "! You are player " + player + "!");
                $pname.text(pname);
            }

            if (data.players[opponent]) { //there is an opponent
                var oname = data.players[opponent].name;
                if (oname !== "") { //the opponent has submitted their name
                    var $oname = $("#player" + opponent + " .name");
                    $oname.text(oname);
                    if (pname !== "" && turn === -1) { //the opponent and player have both submitted their names

                        //update turn to 1 to indicate that the game is ready
                        console.log("Setting turn to 0", turn);
                        database.ref().update({turn: 0});

                        var owins = data.players[opponent].wins;
                        var olosses = data.players[opponent].losses;
                        var $oname = $("#player" + opponent + " .name");
                        var $owinloss = $("#player" + opponent + " .winloss");

                        $pwinloss.html("<span>Wins: " + pwins + "</span><span>&nbsp;</span><span>Losses: " + plosses + "</span>");
                        $owinloss.html("<span>Wins: " + owins + "</span><span>&nbsp;</span><span>Losses: " + olosses + "</span>");
                    
                    };
                };
            };
        });
    };

        
    function gameHTML() {
        console.log("I'm in game");

        database.ref().once("value").then(function (snapshot) {

            var data = snapshot.val();

            var turn = data.turn;
            var pchoice = data.players[player].choice

            if (turn === 0 && pchoice === "") {
                console.log("Im in game HTML");
                var rps = ["Rock", "Paper", "Scissors"];
                var rpsdiv = $("#player" + player + " .rps");
        
                $(".rpsbutton").empty();
        
                for (i=0; i<rps.length; i++) {
                    var newp = $("<p>");
                    
                    newp.text(rps[i]);
                    newp.addClass("rpsbutton");
                    newp.attr("data-value", rps[i]);
                    rpsdiv.append(newp);    
                };
            }
        });
    };

    function winHTML() {

               
        console.log("The winner is ", winstatus);
        database.ref().once("value").then(function (snapshot) {
            
            var data = snapshot.val();
            var pname = data.players[player].name;
            var oname = data.players[opponent].name;
            var ochoice = data.players[opponent].choice;
            
            var $windiv = $("#midbox");
            var $rpsarea = $("#player" + opponent + " .rps");
            var $ochoice = $("<p>");

            $rpsarea.empty();

            $ochoice.text(ochoice);
            $ochoice.attr("data-value", ochoice);
            $ochoice.addClass("selected");
            $rpsarea.append($ochoice);

            console.log("winstatus", winstatus);

            switch(winstatus) {
                case "win":
                    $windiv.html("<p>" + pname + "</p><p>Wins!</p>");
                    break;
                case "tie":
                    $windiv.html("<p>Tie</p><p>Game</p>");
                    break;
                case "loss":
                    $windiv.html("<p>" + oname + "</p><p>Wins!</p>");
                    break;

            }

        }).then(function () {
            (database.ref().once("value").then(function(snapshot) {
                var data = snapshot.val();
                var turn = data.turn;

                if (data.turn === 3) {
                    database.ref().update({turn: 4});
                };
            }))
        });
    };

     
    function checkWinner() {

        console.log("In Winner Check");
        var ref = firebase.database().ref();


        console.log("Setting turn to 2");
        (database.ref().once("value").then(function(snapshot) {
            var data = snapshot.val();
            var turn = data.turn;

            if (data.turn === 1) {
                database.ref().update({turn: 2});
            };
        }))
        .then(database.ref().once("value").then(function(snapshot) {
    
            var data = snapshot.val();

            
            var pchoice = data.players[player].choice;
            var ochoice = data.players[opponent].choice;
            var pwins = data.players[player].wins;
            var plosses = data.players[player].losses;
            var owins = data.players[opponent].wins;
            var olosses = data.players[opponent].losses;               

            
            var rockkey = ["Paper", "Rock", "Scissors"];
            var paperkey = ["Scissors", "Paper", "Rock"];
            var scissorskey = ["Rock", "Scissors", "Paper"];
            var key = [];
            
        
            
            switch(pchoice) {
                case "Rock":
                    key = rockkey;
                    break;
                case "Paper":
                    key = paperkey;
                    break;
                case "Scissors":
                    key = scissorskey;
            };

            for (var i = 0; i<key.length; i++) {
                if (ochoice === key[i]) {
                    switch(i) {
                        case 0:
                            plosses += 1;
                            winstatus = "loss";
                            break;
                        case 1:
                            winstatus = "tie";
                            break;
                        case 2:
                            pwins += 1;
                            winstatus = "win"
                            break;

                    };
                };
            };

            //only 1 player can set the winner - otherwise there's double counting
            if (player === 1) {
                database.ref("players/" + player).update({losses: plosses, wins: pwins});
                database.ref("players/" + opponent).update({losses: olosses, wins: owins});
            };

        })).then(function () {
            (database.ref().once("value").then(function(snapshot) {
                var data = snapshot.val();
                var turn = data.turn;

                if (data.turn === 2) {
                    database.ref().update({turn: 3});
                };
            }))
        });
        
             
        //setTimeout(reset, 5000);

    };

    function reset() {
        console.log("In reset");
        $(".rps").empty();
        $("#midbox").empty();
        $()

        console.log("reserplayer", player);
        database.ref("players/" + player).once("value").then((function (snapshot) {
            var data = snapshot.val();

            var pwins = data.wins;
            var plosses = data.losses;
            
            $("#player" + player + " .winloss").html("<span>Wins: " + pwins + "</span><span>&nbsp;</span><span>Losses: " + plosses + "</span>")}))
        
        .then(function () {database.ref().once("value").then(function(snapshot) {
            var data = snapshot.val();
            var turn = data.turn;
            //gameHTML();
            main();
        })});
       
    

    };
});