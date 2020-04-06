const Discord = require('discord.js');
const MusicBot = require('./MusicBot');
///////////////////////////////////////////
const BOTPrivateToken = "NjkwNjA4MjI1ODk2MzY2MTcw.XneCFA.d5x2ivOK5xV4hmEc4WGvf5amXuI";
const GuildID = "689814299014725641";
const VoiceChannelID = "692859345305731084";
const TextChannelID = "692843786627186718";
///////////////////////////////////////////
const MusicBotCommand = "!";
///////////////////////////////////////////
const client = new Discord.Client({
    messageCacheLifetime: 120,
    messageSweepInterval: 120,
    restRequestTimeout: 60000,
    autoReconnect: true
});
////////////////////////////////////////////
var VoiceChannel = null;
var TextChannel = null;
var VoiceConnection = null;
////////////////////////////////////////////
client.on("ready", async () => {
    //client.user.setAvatar('./files/avatar.jpg');
    //client.user.setUsername('Mu$icBot');
    client.user.setActivity('!COMMANDS', { type: 'LISTENING' }); // Set BOT statue to LISTENING TO !COMMANDS
    client.user.setPresence({ status: 'online' });
    var VoiceChannel = await client.channels.cache.find(chn => chn.id === VoiceChannelID && chn.type === "voice");
    var TextChannel = await client.channels.cache.find(chn => chn.id === TextChannelID && chn.type === "text");
    if(VoiceChannel === null) {
        logWrite("Error Finding the Voice Channel");
        process.exit();
    }
    if(TextChannel === null){
        logWrite("Error finding the texts Channel");
        process.exit();
    }
    await VoiceChannel.join().then(connection => { VoiceConnection = connection; });
    if(VoiceConnection === null) {
        logWrite("Error while connecting to Voice Channel");
        process.exit();
    }
    MusicBot.DataImport(TextChannel, VoiceChannel, VoiceConnection);
});
//////////////////////////////////////////////
client.on('message', async message => {
    // Voice only works in guilds, if the message does not come from a guild,
    // we ignore it
    if (!message.guild || message.channel.id !== TextChannelID) return;
    TextChannel = message.channel;
    if(message.content.toLowerCase().startsWith(MusicBotCommand)) {
        var MessageCommand = message.content.replace(MusicBotCommand, '');
        MusicBot.CommandsHandler(MessageCommand, message);
    }
});
//////////////////////////////////////////////
const logWrite = function(log) { 
    var now = new Date();
    var dd = (now.getDate() > 9) ? now.getDate() : "0" + now.getDate();
    var mm = (now.getMonth()+1 > 9) ? now.getMonth() + 1 : "0" + (now.getMonth()+1); 
    var yyyy = now.getFullYear();
    var h = (now.getHours() > 9) ? now.getHours() : "0" + now.getHours();
    var	m = (now.getMinutes() > 9) ? now.getMinutes() : "0" + now.getMinutes();
    var s = (now.getSeconds() > 9) ? now.getSeconds() : "0" + now.getSeconds();
    var ms = now.getMilliseconds();
    console.log("[ " + dd + "/" + mm + "/" + yyyy + " " + h + ":" + m + ":" + s + "." + ms + " ] => " + log);
};
////////////////////////////////////////////////
client.login(BOTPrivateToken);
////////////////////////////////////////////////