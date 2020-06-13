var users = [];
const addUsers = ({ id, name, room, socket }) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();
    var findUsers = users.find(user => user.name == name && user.room == room);
    if (findUsers) {
        return { error: "User with same name exist" };
    }
    const user = { id, name, room, notification: {} };
    users.push(user);
    return { user };
};

const removeNotificationtouser = ({ to, from }) => {
    var finduser = users.find(user => user.id == to);
    console.log(finduser);
    if (finduser != undefined) {
        if (typeof finduser.notification != "undefined") {
            delete finduser.notification[from];
        }

    }
    console.dir(users, {depth: 'full'});
    return users;
}

const addNotificationtouser = ({ from, to }) => {
    var finduser = users.find(user => user.id == to);
    if (finduser != undefined) {
        if(finduser.notification[from] == undefined){
            finduser.notification[from] = [];
        }
        finduser.notification[from].push({notif: "seen"});
    }
    
    return finduser;
}

const removeUsers = (id) => {
    var findIndex = users.findIndex(user => user.id == id);
    if (findIndex > -1) {
        return users.splice(findIndex, 1)[0];
    }
};

const getUsers = (id) => { return users.find(user => user.id == id) };

const getUsersInRoom = (room) => {
    var newusers = users.filter(user => user.room == room);
    console.log(users);
    // newusers.forEach(e => {
    //     delete e.socket;
    // })
    return newusers;
};

module.exports = { addUsers, removeUsers, getUsers, getUsersInRoom, addNotificationtouser, removeNotificationtouser };

