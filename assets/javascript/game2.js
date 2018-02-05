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

                database.ref("players/" + player).onDisconnect().remove();
                console.log("I am player " + player);
            //player 2 is present
            } else if (snapshot.hasChild("2") === true) {
                player = 1;
                opponent = 2;
                initPlayer();
                database.ref("players/" + player).onDisconnect().remove();
                console.log("I am player " + player);
            }
        //there are no players yet
        } else {
            player = 1;
            opponent = 2;
            initPlayer(true);
            database.ref("players/" + player).onDisconnect().remove();
            console.log("There were no players - I am player 1");
        }
        ///////////////////////////////////////////////////////

        database.ref().on("value", function(secondsnap) {
            console.log("I hit the point above");
            
            var data = secondsnap.val();
            var turn = data.turn;

            if (data.players[player] && data.players[opponent]) {
                var pchoice = data.players[player].choice;
                var ochoice = data.players[opponent].choice;

                if (pchoice !== "" && ochoice !== "") {
                    database.ref().update({turn: 1});
                }
            }

            console.log ("turn", turn);

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
                case 2:
                    winHTML();
                    break;
            };

        });

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
        
                console.log("rpsarea", rpsarea);
                
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

    function initPlayer(first) {
        console.log("Im in initplayer");

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

        //regardless of whether there were players, the turn count is set back to -1
        database.ref().update( {
            turn: -1
        });
    };

    function initHTML() {
        console.log("Im in initHTML");
        var ref = firebase.database().ref();

        ref.once("value").then(function(snapshot) {

            var data = snapshot.val();
            //var turn = data.turn;

            var pname = data.players[player].name;
            var pwins = data.players[player].wins;
            var plosses = data.players[player].losses;

            var $lead = $(".lead");
            var $pname = $("#player" + player + " .name");
            var $pwinloss = $("#player" + player + " .winloss");

            if (pname !== "") {
                $lead.text("Hi " + name + "! You are player " + player + "!");
                $pname.text(pname);
            }

            if (data.players[opponent]) { //there is an opponent
                var oname = data.players[opponent].name;
                if (oname !== "") { //the opponent has submitted their name
                    var $oname = $("#player" + opponent + " .name");
                    $oname.text(oname);
                    if (pname !== "") { //the opponent and player have both submitted their names

                        //update turn to 1 to indicate that the game is ready
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
        console.log("THe winner is ", winstatus);
        database.ref().once("value").then(function (snapshot) {
            
            var data = snapshot.val();

            var pname = data.players[player].name;
            var oname = data.players[opponent].name;
            
            var windiv = $("#midbox");
            var windiv = $("#midbox");
            
            windiv.html("<p>" + oname + "</p><p>Wins!</p>");
            windiv.html("<p>Tie</p><p>Game</p>");
        });
    };

    


            // if (data.players[opponent]) { //there is an opponent
            //     var oname = data.players[opponent].name;
            //     var owins = data.players[opponent].wins;
            //     var olosses = data.players[opponent].losses;

            //     if (oname !== "") { //the opponent has submitted their name
            //         console.log("The opponet has submitted their name");
            //         var $oname = $("#player" + opponent + " .name");
            //         var $owinloss = $("#player" + opponent + " .winloss");

            //         $oname.text(oname);
            //         $pwinloss.html("<span>Wins: " + pwins + "</span><span>&nbsp;</span><span>Losses: " + plosses + "</span>");
            //         $owinloss.html("<span>Wins: " + owins + "</span><span>&nbsp;</span><span>Losses: " + olosses + "</span>");
            //     };
            // };



    // function addPlayer(name) {
    //     console.log("In addPlayer");
    //     var welcome = $("<p>");

    //     var ref = firebase.database().ref("players");
    //     ref.once("value")
    //         .then(function(snapshot) {

    //             //no players have joined yet
    //             if (snapshot.hasChild("1") === false && snapshot.hasChild("2") === false) {
    //                 player = 1;
    //                 opponent = 2;

    //             //player 1 is present
    //             } else if (snapshot.hasChild("1") === true) {
    //                 player = 2;
    //                 opponent = 1;
                
    //             //player 2 is present
    //             } else if (snapshot.hasChild("2") === true) {
    //                 player = 1;
    //                 opponent = 2;
    //             } else {
    //                 $("#main").empty();
    //                 $(".lead").text("Oh my, there are already two players.  Please check back later!")
    //             };

    //             //add the welcome text
    //             welcome.text("Hi " + name + "! You are player " + player + "!");
    //             $("#secondRow").html(welcome);

    //             //add the player to firebase
    //             database.ref("players/" + player).set( {
    //                 losses: 0,
    //                 name: name,
    //                 wins: 0
    //             });
    //         });
        
    // };

    // function takeTurn(turnCount) {
    //     console.log("In takeTurn");

    //     var rps = ["Rock", "Paper", "Scissors"];
    //     var rpsdiv = $("#player" + player + " .rps");

    //     for (i=0; i<rps.length; i++) {
    //         var newp = $("<p>");
            
    //         newp.text(rps[i]);
    //         newp.addClass("rpsbutton");
    //         newp.attr("data-value", rps[i]);
    //         rpsdiv.append(newp);    
    //     }
    //     console.log("I finished setting up player", player);
    // };

    function checkWinner() {
        console.log("In Winner Check");
        var ref = firebase.database().ref();
        choice1 = "";
        choice2 = "";

        database.ref().once("value").then(function(snapshot) {
            
            var data = snapshot.val();

            
            var pchoice = data.players[player].choice;
            var ochoice = data.players[opponent].choice;
            var pwins = data.players[player].wins;
            var plosses = data.players[player].losses;
            
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
            }

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

            database.ref("players/" + player).update({losses: plosses, wins: pwins})
            .then(database.ref().update({turn: 2}));   
        //setTimeout(reset, 5000);
        });
    };

    function reset() {
        console.log("In reset");
        $(".rps").empty();
        $("#midbox").empty();
        $()

        $("#player" + player + " .winloss").html("<span>Wins: " + wins + "</span><span>&nbsp;</span><span>Losses: " + losses + "</span>");

    };

    // database.ref("players").on("value", function(snapshot) {
    //     console.log("In db players change");
    //     //initialize the player boxes as a new player comes online
    //     var name;
    //     var wins;
    //     var losses;

    //     snapshot.forEach(function(childSnapshot) {
            
    //         var childData = childSnapshot.val();
    //         var player = childSnapshot.key;
    //         var name = childData.name;
    //         var wins = childData.wins;
    //         var losses = childData.losses;
    //         var childbox;

    //         if (player === '1') {
    //             childbox = "#player1";
    //         } else if (player === '2') {
    //             childbox = "#player2";
    //         }

    //         $(childbox + " .waiting").text(name);
    //         $(childbox + " .winloss").html("<span>Wins: " + wins + "</span><span>&nbsp;</span><span>Losses: " + losses + "</span>");

    //         });

    //     if (snapshot.numChildren() === 2) {
    //         //remove the event handler
    //         database.ref("players").off("value");
    //         //add the turn
    //         console.log("Setting turn to 1 in the players db change");
    //         database.ref().update( {
    //             turn: 1
    //         })
    //     };  
    // });

    // database.ref("turn").on("value", function(snapshot) {
    //     console.log("In the db turn on");
    //     if (snapshot.exists()) {

    //         console.log("Got into turn");
            
    //         var turn = snapshot.val();
      
    //         console.log("player", player);
    //         console.log("turn", turn);

    //         if (turn === player) {
    //             //think about killing off left/right and just making the id of the box have the number
    //             //if I did that I could flash the border here based on turn #
    //             console.log(player, "was equal");
    //             takeTurn(turn);
    //         } else if (turn === 3) {
    //             console.log("Run WInner CHeck")
    //             winnerCheck();
    //         };//
    //     };
    // });

    // database.ref("players/" + player).onDisconnect().remove();


    // $(document).on("click", ".rpsbutton", function(event) {
    //     console.log("I'm in the rps click");
    //     //set the html up
    //     var rpspick = $(this).attr("data-value");
    //     var turnplayer = $(this).parents(".innerbox").attr("id").slice(-1);
    //     var rpsarea = $("#player" + turnplayer + " .rps");
    //     var choice = $("<p>");

    //     console.log("rpsarea", rpsarea);
        
    //     rpsarea.empty();

    //     choice.text(rpspick);
    //     choice.attr("data-value", rpspick);
    //     choice.addClass("selected");

    //     rpsarea.append(choice);

    //     //weird thing happened when the commmented out section was separate
    //     //race condition????
    //     // database.ref("players/" + turnplayer).update({choice: rpspick}, function() {
    //     //     database.ref("turn").transaction(function(turn) {
    //     //         console.log("Incrementing turn in the rps click", turn);
    //     //         return turn + 1
    //     //     });
    //     // });

    //     // database.ref("players/" + turnplayer).update( {
    //     //     choice: rpspick
    //     // })
    //     database.ref("players/" + turnplayer).update({choice: rpspick});
    //     database.ref("turn").transaction(function(turn) {return turn + 1});
    // });

    // $("#submit").on("click", function(event) {
    //     console.log("In submit");
    //     event.preventDefault();

    //     var playername = $("#form-input").val().trim();
    //     addPlayer(playername);

    // });

    // $("#send").on("click", function(event) {
    //     console.log("In send");
    //     event.preventDefault();
    //     var chat = $("<p>");

    //     message = $("#chat-input").val().trim();
    //     chat.text(message);
    //     $("#chatbox").append(chat);

    //     database.ref("chat").push({message});

    // });

    // console.log("ver1");

});