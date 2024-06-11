const play = require('play-dl')
const Discord = require("discord.js");

const send_song = async (link, channel, message) => {
    const info = await play.video_info(link)
    data = info.video_details;
    thumbnail = data.thumbnails[0].url.split('jpg')[0] + "jpg";
    const embed = new Discord.EmbedBuilder()
        .setTitle(`${message}:\n${data.title}`)
        .setThumbnail(thumbnail)
    channel.send({ embeds: [embed] });
}


module.exports = { send_song };