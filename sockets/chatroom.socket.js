const admin = require('firebase-admin');

const connectedUsersRoomMap = new Map();

class SocketIOUserChatRoomHandler {
    io;

    constructor(io) {
        this.io = io;
    }

    listen() {
        this.io.on('connection', (socket) => {
            socket.on('enter room', (data) => {
                this.addClientToMap(data.username, data.userId, data.clubId, data.groupId, socket.id);
                this.updateUserMessageCount(data.userId, data.clubId, data.groupId);
                this.io.emit('in room', Array.from(connectedUsersRoomMap.values()));
            });

            socket.on('leave room', (data) => {
                const user = Array.from(connectedUsersRoomMap.values()).find((value) => value.username === data.username);
                if (user && user?.username && user?.groupId) {
                    this.updateUserMessageCount(data.userId, data.clubId, data.groupId);
                }
                this.removeClientFromMap(socket.id);
            });

            socket.on('disconnect', () => {
                const user = Array.from(connectedUsersRoomMap.values()).find((data) => data.socketId === socket.id);
                if (user && user?.username && user?.groupId) {
                    this.updateUserMessageCount(user.userId, user.clubId, user.groupId);
                }
                this.removeClientFromMap(socket.id);
            });
        });
    }

    addClientToMap(username, userId, clubId, groupId, socketId) {
        if (!connectedUsersRoomMap.has(username)) {
            connectedUsersRoomMap.set(username, {username, userId, clubId, groupId, socketId});
        }
    }

    removeClientFromMap(socketId) {
        const hasSocketId = Array.from(connectedUsersRoomMap.values()).some((data) => data.socketId === socketId);
        if (hasSocketId) {
            const disconnectedUser = [...connectedUsersRoomMap].find((user) => {
                return user[1].socketId === socketId;
            });
            connectedUsersRoomMap.delete(disconnectedUser[0]);
            this.io.emit('in room', Array.from(connectedUsersRoomMap.values()));
        }
    }

    async updateUserMessageCount(userId, clubId, groupId) {
        try {
            const clubDocument = await admin.firestore().collection('clubs').doc(clubId).get();
            const document = await admin.firestore().collection('users').doc(userId).get();
            const clubGroups = [...clubDocument.data().clubRooms];
            const index = clubGroups.findIndex((element) => element.groupId === groupId);
            const message = clubGroups[index];
            let teamChatGroups = [...document.data().teamChatGroups];
            const itemIndex = teamChatGroups.findIndex((element) => element.groupId === groupId);
            if (itemIndex > -1) {
                teamChatGroups[itemIndex].messageCount = message['messageCount'];
                await admin.firestore().collection('users').doc(userId).update({
                    teamChatGroups,
                });
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = SocketIOUserChatRoomHandler;