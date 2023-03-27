const admin = require('firebase-admin');

const connectedAudioUsersRoomMap = new Map();

class SocketIOAudioRoomHandler {
    io;

    constructor(io) {
        this.io = io;
    }

    listen() {
        this.io.on('connection', (socket) => {
            socket.on('enter audio room', (data) => {
                this.addClientToMap(data, socket.id);
            });

            socket.on('leave audio room', (data) => {
                const user = Array.from(connectedAudioUsersRoomMap.values()).find((value) => value.username === data.username);
                if (user && user?.username && user?.roomId) {
                    this.removeAudioRoomParticipant(data);
                }
                this.removeClientFromMap(socket.id);
            });

            socket.on('end audio room', (data) => {
                this.endAudioRoom(data.roomId);
                this.removeClientFromMap(socket.id);
            });

            socket.on('disconnect', () => {
                const user = Array.from(connectedAudioUsersRoomMap.values()).find((data) => data.socketId === socket.id);
                if (user && user?.username && user?.roomId) {
                    this.removeAudioRoomParticipant(user);
                }
                this.removeClientFromMap(socket.id);
            });
        });
    }

    addClientToMap(data, socketId) {
        const { username, userId, roomId, status, avatarColor, profilePictureURL } = data; 
        if (!connectedAudioUsersRoomMap.has(username)) {
            connectedAudioUsersRoomMap.set(username, {username, userId, roomId, status, avatarColor, profilePictureURL, socketId});
        }
    }

    removeClientFromMap(socketId) {
        const hasSocketId = Array.from(connectedAudioUsersRoomMap.values()).some((data) => data.socketId === socketId);
        if (hasSocketId) {
            const disconnectedUser = [...connectedAudioUsersRoomMap].find((user) => {
                return user[1].socketId === socketId;
            });
            connectedAudioUsersRoomMap.delete(disconnectedUser[0]);
        }
    }

    async removeAudioRoomParticipant(data) {
        const { userId, roomId } = data; 
        try {
            const audioRoomDocument = await admin.firestore().collection('audio_live_rooms').doc(roomId).get();
            const participants = [...audioRoomDocument.data().participants];
            const user = audioRoomDocument.data();
            if (userId !== user.creator.userID) {
                const newParticipants = participants.filter((element) => element.id !== userId);
                await admin.firestore().collection('audio_live_rooms').doc(roomId).update({
                    participants: newParticipants,
                });
            } else {
                await admin.firestore().collection('audio_live_rooms').doc(roomId).update({
                    status: 'ended',
                });
            }
        } catch (error) {
            console.log(error);
        }
    }

    async endAudioRoom(roomId) {
        try {
            await admin.firestore().collection('audio_live_rooms').doc(roomId).update({
                status: 'ended',
            });
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = SocketIOAudioRoomHandler;