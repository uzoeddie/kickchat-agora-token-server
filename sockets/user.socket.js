const admin = require('firebase-admin');

const connectedUsersMap = new Map();

class SocketIOUserHandler {
    io;

    constructor(io) {
        this.io = io;
    }

    listen() {
        this.io.on('connection', (socket) => {
            socket.on('setup', (data) => {
                this.addClientToMap(data.username, data.userId, socket.id);
                this.io.emit('users online', Array.from(connectedUsersMap.values()));
            });

            socket.on('disconnect', () => {
                const user = Array.from(connectedUsersMap.values()).find((data) => data.socketId === socket.id);
                if (user && user?.username && user?.userId) {
                    this.updateUserActive(user.userId);
                }
                this.removeClientFromMap(socket.id);
            });
        });
    }

    addClientToMap(username, userId, socketId) {
        if (!connectedUsersMap.has(username)) {
            connectedUsersMap.set(username, {username, userId, socketId});
        }
    }

    removeClientFromMap(socketId) {
        const hasSocketId = Array.from(connectedUsersMap.values()).some((data) => data.socketId === socketId);
        if (hasSocketId) {
            const disconnectedUser = [...connectedUsersMap].find((user) => {
                return user[1].socketId === socketId;
            });
            connectedUsersMap.delete(disconnectedUser[0]);
            this.io.emit('users online', Array.from(connectedUsersMap.values()));
        }
    }

    async updateUserActive(userId) {
        try {
            await admin.firestore().collection('users').doc(userId).update({
                active: false,
            });
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = SocketIOUserHandler;