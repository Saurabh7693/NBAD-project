const userConnection = require('./UserConncetion').userConnection;

class UserProfile {
    constructor(userId) {
        this.userId = userId;
        this.connectionsList = [];
    };
    
    addConnection(connection, rsvp) {
        console.log();        
        console.log('Inside addConnection');
        let connectionCheck = false
        this.connectionsList.forEach(element => {
            if (element.connection.connectionID == connection.connectionID){
                connectionCheck = true;
            }
        });
        if (connectionCheck == false){
            const newConnection = userConnection(connection, rsvp);
            this.connectionsList.push(newConnection);
            console.log(`New Connection added is ${connection['connectionID']}`);
        }
    };
    removeConnection(userConnection) {
        if (this.connectionsList.indexOf(userConnection) != -1){
            const index = this.connectionsList.indexOf(userConnection);
            this.connectionsList.splice(index, 1);
        };
    };

    updateConnection(userConnection) {
        //check implementation
        const index = this.connectionsList.indexOf(userConnection);
        this.connectionsList[index].rsvp = userConnection.rsvp;
    };

    getConnections(userConnection) {
        return (this.connectionsList);
    };

    emptyProfile(userConnection) {
        this.connectionsList = [];
    };

}

// export default UserProfile;
module.exports = UserProfile;