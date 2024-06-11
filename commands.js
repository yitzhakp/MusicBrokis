const { yt_validate } = require('play-dl')
const play = require('play-dl')
const { send_song } = require('./messagesBot.js');
const { joinVoiceChannel } = require('@discordjs/voice')

const connection_channel = async (message) => {
    if (!message.member.voice.channel) {
        message.channel.send('Métete en un canal, cachón!')
        return null
    }
    return joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
    })
}

const p = async (message) => {
    const content = message.content
    const partes = content.split(' ')
    partes.shift()
    const song = partes.join(' ')
    let posibleLink = song.split(' ')[0];
    if (!song.startsWith('https') || !(yt_validate(posibleLink) === 'video')) {
        let songInfo = await play.search(song, { limit: 1 })
        link = songInfo[0].url
    }

    await send_song(link, message.channel, 'Agregada a la cola')
    return link
}

module.exports = { p, connection_channel };