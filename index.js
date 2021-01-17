const Discord = require('discord.js');
const client = new Discord.Client();

const token = 'Njc1Nzk0MDI2MDAzMTY5MzAx.Xj9WGA.NjVa6tKF56mQUgUZQzcysJjyVNU';
const prefix = '.';
var servers = {};

const ytdl = require("ytdl-core")

client.on('ready', () =>{
    console.log(`Hi, ${client.user.username} is now online!`);
});


client.on('message', message =>{

    let args = message.content.substring(prefix.length).split(" ");
    switch(args[0]){
        case 'play':
            function play(connection, message){
                var server = servers[message.guild.id];

                server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: 'audioonly'}));
                server.queue.shift();
                server.dispatcher.on("end", function(){
                    if(server.queue[0]){
                        play(connection, message);
                    }
                    else{
                        connection.disconnect();
                    }
                });
            }
            
            //If it returns an error, print error message
            if(!args[1]){
                message.channel.send("You need to add a link!");
                return;
            }

            //If user is not in the chat, print error message
            if(!message.member.voiceChannel){
                message.channel.send("you must join the channel to play music!");
                return;
            }

            if(!servers[message.guild.id]) servers[message.guild.id]={
                queue : []
            }

            var server = servers[message.guild.id];
            
            server.queue.push(args[1]);

            if(!message.guild.voiceConnection){
                message.member.voiceChannel.join().then(function(connection){
                    play(connection, message);
                })
            }

            break;

        case 'skip':
            var server = servers[message.guild.id];
            if(server.dispatcher) server.dispatcher.end();
            message.channel.send("song skipped.")
        break;

        case 'stop':
            var server = servers[message.guild.id];
            if(message.guild.voiceConnection){
                for(var i = server.queue.length - 2; i >= 0; i--){
                    server.queue.splice(i, 1);
                }
                server.dispatcher.end();
                message.channel.send("Ending the queue...")
                console.log('stopped the queue')
            }
            if(message.guild.connection){
                message.guild.voiceConnection.disconnect();
            }
        break;
    }
});

client.login(token)