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
        database.ref("players").off("value");
        console.log("Im in the players event");
        var data = snapshot.val();
        
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
                //initPlayer();

                database.ref("players/" + player).set({
                    name: "Waiting for Player " + player
                });

                database.ref("players/" + player).onDisconnect().remove(function () {database.ref().update({turn: -1})});
                
                console.log("I am player " + player);
            //player 2 is present
            } else if (snapshot.hasChild("2") === true) {
                player = 1;
                opponent = 2;

                database.ref("players/" + player).set({
                    name: "Waiting for Player " + player
                });
                //initPlayer();
                database.ref("players/" + player).onDisconnect().remove(function () {database.ref().update({turn: -1})});
                console.log("I am player " + player);
            }
        //there are no players yet
        } else {
            player = 1;
            opponent = 2;
            //initPlayer(true);
            database.ref("players/" + player).set({
                name: "Waiting for Player " + player
            });

    
            database.ref("players/" + player).onDisconnect().remove(function () {database.ref().update({turn: -1})});
            console.log("There were no players - I am player 1");
        }
        //the players variable set here is unreliable - setting it on the page for a more direct reference
        
        watchPlayers();
    });

    function watchPlayers() {
        console.log("Waiting");
        // database.ref("players").on("child_added", function(snapshot) {
        //     initHTML();
        // });

        var $lead = $(".lead");
        var $pname = $("#player" + player + " .name");
        var $oname = $("#player" + opponent + " .name");
        
        var $pwinloss = $("#player" + player + " .winloss"); 
        var $owinloss = $("#player" + opponent + " .winloss");
        
        $pwinloss.html("<span id=pwins></span><span>&nbsp;</span><span id=plosses></span>");
        $owinloss.html("<span id=owins></span><span>&nbsp;</span><span id=olosses></span>");

        var $pwins = $("#pwins");
        var $plosses = $("#plosses");
        var $owins = $("#owins");
        var $olosses = $("#olosses");

        var $prpsarea = $("#player" + player + " .rps");
        var $orpsarea = $("#player" + opponent + " .rps");

        var $secondrow = $("#secondrow");

        //listeners for player names
        database.ref("players/" + player + "/name").on("value", function(snapshot) {
            if (snapshot.exists()) {

                var pname = snapshot.val();

                console.log("In the pname player", player);
                console.log("In the pname", snapshot.val());
                
                //Set HTML for this players name
                if (pname !== "Waiting for Player " + player) {
                    $lead.text("Hi " + pname + "! You are player " + player + "!");
                    $secondrow.empty();
                }
                
                $pname.text(pname);

            }
        });

        database.ref("players/" + opponent + "/name").on("value", function(snapshot) {
            if (snapshot.exists()) {
                
                var oname = snapshot.val();


                console.log("In the oname opponent", opponent);
                console.log("In the oname", snapshot.val());

                $oname.text(oname);

                database.ref("players/" + player + "/name").once("value").then(function(snapshot) {
                    var pname = snapshot.val();
        
                    //Now that we have an opponent set wins and losses
                    if (pname === "Waiting for Player " + player || oname === "Waiting for Player " + opponent) {
                        console.log("OPPONENT HAS NO NAME");
                    } else {
                        console.log("IM ALL SETUP");

                        database.ref("players/" + player).update({

                            wins: 0,
                            losses: 0,
                        });

                        database.ref("players/" + opponent).update({
                    
                            wins: 0,
                            losses: 0,
                        });
                        //START THE TURNS!!!!!
                        database.ref().update({turn: 0});
                    }
                });

            }
        });

        //listeners for player wins
        database.ref("players/" + player + "/wins").on("value", function(snapshot) {
            if (snapshot.exists()) {

                var pwins = snapshot.val();

                console.log("In the pwins player", player);
                console.log("In the pwins", snapshot.val());

                $pwins.text("Wins: " + pwins);
            }
        });

        database.ref("players/" + opponent + "/wins").on("value", function(snapshot) {
            if (snapshot.exists()) {

                var owins = snapshot.val();
                

                console.log("In the owins opponent", opponent);
                console.log("In the owins", snapshot.val());

                $owins.text("Wins: " + owins);
            }

        });

        //listeners for player losses
        database.ref("players/" + player + "/losses").on("value", function(snapshot) {
            if (snapshot.exists()) {

                var plosses = snapshot.val();

                console.log("In the plosses player", player);
                console.log("In the plosses", snapshot.val());

                $plosses.text("Losses: " + plosses);
            }
        });

        database.ref("players/" + opponent + "/losses").on("value", function(snapshot) {
            if (snapshot.exists()) {

                var olosses = snapshot.val();

                console.log("In the olosses opponent", opponent);
                console.log("In the olosses", snapshot.val());

                $olosses.text("Losses: " + olosses);
            }
        });

        //listeners for player choice
        database.ref("players/" + player + "/choice").on("value", function(snapshot) {
            if (snapshot.exists()) {

                var pchoice = snapshot.val();

                console.log("In the pchoice player", player);
                console.log("In the pchoice", snapshot.val());

                //I think we need a check here to see if the other player made a choice - if they have we check winner

                database.ref("players/" + opponent + "/choice").once("value").then(function(snapshot) {
                    if (snapshot.exists()) {
                        
                        var ochoice = snapshot.val();

                        
                        //BOTH PLAYERS HAVE MADE CHOICES SEE WHO WON
                        checkWinner();
                    }

                });
            }
        });

        database.ref("players/" + opponent + "/choice").on("value", function(snapshot) {
            if (snapshot.exists()) {

                var ochoice = snapshot.val();

                console.log("In the ochoice opponent", opponent);
                console.log("In the ochoice", snapshot.val());

                //I think we need a check here to see if the other player made a choice - if they have we check winner

                database.ref("players/" + player + "/choice").once("value").then(function(snapshot) {
                    if (snapshot.exists()) {
                        
                        var pchoice = snapshot.val();

                        //BOTH PLAYERS HAVE MADE CHOICES SEE WHO WON
                        checkWinner();

                    }
                });
            }
        });

        database.ref("players/" + opponent).on("child_removed", function(snapshot) {
            $oname.text("Waiting for player" + opponent);
        });

        database.ref("turn").on("value", function(snapshot) {
            
            var turn = snapshot.val()
            console.log("I'm in turn 0, turn = ", turn);

            if (turn === 0) {

                var rps = ["Rock", "Paper", "Scissors"];
        
                $(".rpsbutton").empty();
                $("#midbox").empty();
                $prpsarea.empty();
                $orpsarea.empty();
        
                for (i=0; i<rps.length; i++) {
                    var newp = $("<p>");
                    
                    newp.text(rps[i]);
                    newp.addClass("rpsbutton");
                    newp.attr("data-value", rps[i]);
                    $prpsarea.append(newp);    
                };
            } else if (turn === 1) {


                    return new Promise((resolve, reject) => {  //found this basic idea online - don't really get why I needed it or why this made setTimeout work
                      setTimeout(reset, 5000);
                    });
                  
            

            }

        });


    };

    function checkWinner() {

        console.log("In Winner Check");
        //var ref = firebase.database().ref();


        // console.log("Setting turn to 2");
        // (database.ref().once("value").then(function(snapshot) {
        //     var data = snapshot.val();
        //     var turn = data.turn;

        //     if (data.turn === 1) {
        //         database.ref().update({turn: 2});
        //     };
        // }))
        //.then(
            
        database.ref().once("value").then(function(snapshot) {
    
            var data = snapshot.val();

            var pname = data.players[player].name;
            var oname = data.players[opponent].name;
            var pchoice = data.players[player].choice;
            var ochoice = data.players[opponent].choice;
            var pwins = data.players[player].wins;
            var plosses = data.players[player].losses;
            //var owins = data.players[opponent].wins;
            //var olosses = data.players[opponent].losses;               

            var $windiv = $("#midbox");
            var $rpsarea = $("#player" + opponent + " .rps");
            var $ochoice = $("<p>");

            var rockkey = ["Paper", "Rock", "Scissors"];
            var paperkey = ["Scissors", "Paper", "Rock"];
            var scissorskey = ["Rock", "Scissors", "Paper"];
            var key = [];

            var winstatus;
                       
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
                            $windiv.html("<p>" + oname + "</p><p>Wins!</p>");
                            break;
                        case 1:
                            $windiv.html("<p>Tie</p><p>Game</p>");
                            break;
                        case 2:
                            pwins += 1;
                            $windiv.html("<p>" + pname + "</p><p>Wins!</p>");
                            break;

                    };
                };
            };

            //Set the winloss results in the database
            database.ref("players/" + player).update({losses: plosses, wins: pwins});

            //Display the results
            $rpsarea.empty();

            $ochoice.text(ochoice);
            $ochoice.attr("data-value", ochoice);
            $ochoice.addClass("selected");
            $rpsarea.append($ochoice);

            //Set the turn to 1 and start the timer for the reset
            database.ref().update({turn: 1});
            database.ref("players/" + player + "/choice").remove();
       
            console.log("THE WINNER ISSSSSS", winstatus);
        });
    };

    function reset() {
        database.ref().update({turn: 0})
    }

    $("#submit").on("click", function(event) {
        event.preventDefault();

        //initPlayer();
         database.ref("players/" + player).update({
             name: $("#form-input").val().trim()
         }); //.then(initHTML());
    });

    $(document).on("click", ".rpsbutton", function() {
        console.log("YOU CLICKED ON SOMETHING");
            
        var rpspick = $(this).attr("data-value");
        var turnplayer = $(this).parents(".innerbox").attr("id").slice(-1);

        var $rpsarea = $("#player" + turnplayer + " .rps");
        var $choice = $("<p>");
        
        $rpsarea.empty();
               
        $choice.text(rpspick);
        $choice.attr("data-value", rpspick);
        $choice.addClass("selected");

        $rpsarea.append($choice);


        database.ref("players/" + turnplayer).update({choice: rpspick}); 
    });

});