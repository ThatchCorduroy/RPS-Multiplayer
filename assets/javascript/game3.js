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

        var $midarea = $("#midarea");

        var $secondrow = $("#secondrow");

        var $chatarea = $(".chatarea");
        var $chatbox = $("#chatbox");

        //listeners for player names
        database.ref("players/" + player + "/name").on("value", function(snapshot) {
            if (snapshot.exists()) {

                var pname = snapshot.val();

                console.log("In the pname player", player);
                console.log("In the pname", snapshot.val());

                $chatbox.empty();
                database.ref("chat").remove();
                
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
                $chatbox.empty();
                database.ref("chat").remove();

                database.ref("players/" + player + "/name").once("value").then(function(snapshot) {
                    var pname = snapshot.val();
        
                    //Now that we have an opponent set wins and losses
                    if (pname === "Waiting for Player " + player || oname === "Waiting for Player " + opponent) {
                        console.log("OPPONENT HAS NO NAME");
                    } else {
                        console.log("IM ALL SETUP");

                        $chatarea.show();

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

        database.ref("players").on("child_removed", function(snapshot) {

            var data = snapshot.val();
            var oname = data.name;
            var $newchat = $("<div>");

            console.log("OPP NAME", oname)
          
            $oname.text("Waiting for player" + opponent);
            $prpsarea.empty();
            $orpsarea.empty();
            //$chatbox.empty();

            //$("#chatbox").append("<p>")

            database.ref("players/" + player + "/choice").remove();
            
            $newchat.addClass("alert alert-danger");
            $newchat.attr("role", "alert");
            $newchat.css("text-align", "center");
            $newchat.text(oname + " has disconnected.");
            $chatbox.append($newchat);
            $chatbox.scrollTop(($chatbox)[0].scrollHeight);
        });

        database.ref("turn").on("value", function(snapshot) {
            
            var turn = snapshot.val()
            console.log("I'm in turn 0, turn = ", turn);

            switch(turn) {
                case -1:
                    $chatarea.hide();
                    break;
                case 0:
                    var rps = ["Rock", "Paper", "Scissors"];
            
                    $chatarea.show();
                    $(".rpsbutton").empty();
                    $("#midbox").empty();
                    $midarea.css("visibility", "hidden");
                    $prpsarea.empty();
                    $orpsarea.empty();
            
                    for (i=0; i<rps.length; i++) {
                        var newp = $("<p>");
                        
                        newp.text(rps[i]);
                        newp.addClass("rpsbutton");
                        newp.attr("data-value", rps[i]);
                        $prpsarea.append(newp);    
                    };
                    break;
                case 1:
                    $chatarea.show();

                    return new Promise((resolve, reject) => {  //found this basic idea online - don't really get why I needed it or why this made setTimeout work
                    setTimeout(reset, 5000);
                    });
            };

        });

        database.ref("chat").on("child_added", function(snapshot) {
            
            var chat = snapshot.val();
            
            var chatplayer = chat.player;
            var chattext = chat.text;
            var chatname;

            var pname;
            var oname;

            var $newchat = $("<div>");      
            
            database.ref().once("value").then(function(snapshot) { //should have made pname/oname global
    
                var data = snapshot.val();
    
                var pname = data.players[player].name;
                var oname = data.players[opponent].name;

                if (chatplayer === player) {
                    chatname = pname;
                    $newchat.addClass("alert alert-success");
                    $newchat.attr("role", "alert");
                } else if (chatplayer === opponent) {
                    chatname = oname;
                    $newchat.addClass("alert alert-info");
                    $newchat.attr("role", "alert");
                    $newchat.css("text-align", "right");
                    
                }

                $newchat.text(chatname + ": " + chattext);

                $chatbox.append($newchat);
                $chatbox.scrollTop(($chatbox)[0].scrollHeight);
            });
        })
    };

    function checkWinner() {

        console.log("In Winner Check");
  
            
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
            console.log("OCHOICE", ochoice);
            for (var i = 0; i<key.length; i++) {
                if (ochoice === key[i]) {
                    switch(i) {
                        case 0:
                            plosses += 1;
                            $windiv.html("<p>" + oname + "</p><p>Wins!</p>");
                            console.log("I WON");
                            break;
                        case 1:
                            $windiv.html("<p>Tie</p><p>Game</p>");
                            console.log("TIE GAME");
                            break;
                        case 2:
                            pwins += 1;
                            $windiv.html("<p>" + pname + "</p><p>Wins!</p>");
                            console.log("I LOST");
                            break;

                    };
                    $("#midarea").css("visibility", "visible");;
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
       
        });
    };

    function reset() {
        database.ref().update({turn: 0})
    };

    $("#submit").on("click", function(event) {
        console.log("YOU CLICKED SUBMIT");
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

    $("#send").on("click", function(event) {
        event.preventDefault();

        //initPlayer();
         database.ref("chat/").push().set({
             player: player,
             text: $("#chat-input").val().trim()
         });
         $("#chat-input").val("");
    });

});