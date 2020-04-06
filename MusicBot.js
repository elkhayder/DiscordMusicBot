const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
//////////////////////////////////////
const Commands = [
    {
        command: "search",
        description: "Search for a Youtube track By his Name or link",
        parameters : ["Track Name or Link"],
        execute: function(query) {
            YoutubeSearch(query);
        }
    },
    {
        command: "select",
        description: "Select Track from `!search` results",
        parameters : ["Track id"],
        execute: function(number) {
            SelectTrackToQueue(number);
        }
    },
    {
        command: "print",
        description: "S3iba 3lik a zbi",
        parameters: [],
        execute: function() {
            console.log(Queue);
        }
    },
    {
        command: "volume",
        description: "Change Playback Volume",
        parameters: ["Volume (10 ~ 200)"],
        execute: function(vol) {
            vol = parseInt(vol);
            if(isNaN(vol)) return;
            SelectedVolume = (vol < 10 ? 10 : vol > 200 ? 200 : vol) / 100;
            if(IsPlaying) VoicePlayer.setVolume(SelectedVolume);
        }
    },
    {
        command: "pause",
        description: "Pause the playback",
        parameters: [],
        execute: function() {
            if(!IsPlaying) return;
            VoicePlayer.pause();
        }
    },
    {
        command: "resume",
        description: "Resume playing",
        parameters: [],
        execute: function() {
            if(!IsPlaying) return;
            VoicePlayer.resume();
        }
    },
    {
        command: "skip",
        description: "Skip the current Track",
        parameters: [],
        execute: function() {
            if(!IsPlaying) return;
            VoicePlayer.end();
        }
    },
    {
        command: "end",
        description: "End the playback",
        parameters: [],
        execute: function() {
            if(!IsPlaying) return;
            ForceEnd = true;
            VoicePlayer.end();
        }
    },
    {
        command: "commands",
        description: "Show This !?  Duuuh",
        parameters: [],
        execute: function() {
            var embedData = {
                color: 0,
                description: ""
            }
            var embedDescription = "";
            for(var i = 0; i < Commands.length; i++) {
                //console.log(Commands[i].command);
                embedDescription += "**" + Commands[i].description + "**\n→ `!" + Commands[i].command.toUpperCase();
                for(var y = 0; y < Commands[i].parameters.length; y++) {
                    embedDescription += " [" + Commands[i].parameters[y] + "]";
                }
                embedDescription += "`\n";
            }
            embedData.description = embedDescription;
            RecievedMessage.channel.send({embed: embedData});
        }
    }
];
//////////////////////////////////////
var QueueRequests = [];
var Queue = [];
var RecievedMessage = null;
var TextChannel = null;
var VoiceChannel = null;
var VoiceConnection = null;
var VoicePlayer = null;
var YTSearchFilter = null;
var IsPlaying = false;
var ForceEnd = false;
var SelectedVolume = 1;
//////////////////////////////////////
const YoutubeSearch = function(query) {
    ytsr.getFilters(query, function(err, filters) {
        //if(err) throw err;
        YTSearchFilter = filters.get('Type').find(o => o.name === 'Video');
            var options = {
                limit: 5,
                nextpageRef: YTSearchFilter.ref,
            }
            ytsr(null, options, function(err, results) {
                //if(err) console.log(err);
                if(!results) {
                    RecievedMessage.channel.send({embed: {
                        color: 0,
                        description: "<@" + RecievedMessage.author.id + "> No Results found.\n To be noted only Videos are allowed, Playlists and live videos unfortunately are not Streamable ...",
                      }
                    });
                    return;
                };
                var TempQueueRequest = [];
                TempQueueRequest["user"] = RecievedMessage.author.id;
                for(var i = 0; i < results.items.length; i++) {
                    TempQueueRequest.push({
                        title: results.items[i].title,
                        link: results.items[i].link,
                        duration: results.items[i].duration
                    });
                }
                var embedData = {
                    color: 0,
                    description: ""
                };
                var embedDescription = ""
                for(var i = 0; i < TempQueueRequest.length; i++) {
                    var embedDescription = embedDescription + "__" + parseInt(i + 1) + ":__ ["+ TempQueueRequest[i].title + "](" + TempQueueRequest[i].link + ") _(" + TempQueueRequest[i].duration + ")_\n";
                }
                embedDescription = embedDescription + "=> **Please <@" + TempQueueRequest["user"] + ">, select your desired Track by typing `!select 1-5`**"
                embedData.description = embedDescription;
                //TempQueueRequest["SentMessage"] = RecievedMessage.channel.send({embed: embedData});
                RecievedMessage.channel.send({embed: embedData});
                QueueRequests.push(TempQueueRequest);
            });
    });
};

const SelectTrackToQueue = async function(number) {
    if(isNaN(number) || number > 5 || number < 0) return;
    var message = RecievedMessage;
    var SelectAmong = await QueueRequests.find(data => data.user === message.author.id);
    if(SelectAmong) {
        ytsr(SelectAmong[parseInt(number) - 1].link, {limit: 1}, function(err, results) {
            PlayQueue(Queue.push(results.items[0]));
        });
        QueueRequests.splice(QueueRequests.indexOf(SelectAmong), 1);
        RecievedMessage.channel.send({embed: {
            color: 0,
            description: "<@" + RecievedMessage.author.id + "> [" + SelectAmong[parseInt(number) - 1].title + "](" + SelectAmong[parseInt(number) - 1].link + ") has been added to Queue.",
          }
        });
    } else {
        RecievedMessage.channel.send({embed: {
            color: 0,
            description: "<@" + RecievedMessage.author.id + "> You haven't Requested for any Song,\n=> **Type `!commands` for More Infos**",
          }
        });
    }
}

const PlayQueue = async function() {
    if(IsPlaying == true) {
        console.log("Already Playing");
        return;
    }
    VoicePlayer = VoiceConnection.play(await ytdl(Queue[0].link, { filter: 'audioonly' , quality: "lowestaudio" }), { type: 'unknown', volume: SelectedVolume });
    IsPlaying = true;
    VoicePlayer.once("finish", async reason => {
        console.log("ended");
        IsPlaying = false;
        Queue.splice(0, 1);
        if(ForceEnd == true) {
            ForceEnd = false;
            Queue = [];
            return;
        }
        if(Queue.length > 0) {
            PlayQueue();
        }
    });
}
//////////////////////////////////////
const CommandsSearch = function(commandQuery) {
    for(var i = 0; i < Commands.length; i++) {
        if(commandQuery.toLowerCase() == Commands[i].command.toLowerCase()) {
            return Commands[i];
        }
    }
}

const CommandsHandler = function(message, BotRecievedMessage) {
    RecievedMessage = BotRecievedMessage;
    var options = message.split(" ");
    var selectedCommand = CommandsSearch(options[0]);
    if(selectedCommand) {
        var optionsString = "";
        if(options.length > 1) {
            for(var i = 1; i < options.length; i++) {
                optionsString = optionsString + options[i] + " ";
            }
        };
        selectedCommand.execute(optionsString);
    } else {
        // Command doesnt exist
        // Ask user to use !Commands to see avaliable commands
        //logWrite("No command Found");
    }
}

const DataImport = function(ImportedTextChannel, ImportedVoiceChannel, ImportedVoiceConnection) {
    TextChannel = ImportedTextChannel;
    VoiceChannel = ImportedVoiceChannel;
    VoiceConnection = ImportedVoiceConnection;
}
//////////////////////////////////////
module.exports = {
    CommandsHandler,
    DataImport
}