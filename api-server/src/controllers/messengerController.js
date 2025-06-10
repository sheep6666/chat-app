module.exports.getUsers = async (req, res) => {
   res.send("<h1>getUsers</h1>");
};

module.exports.getChats = async (req, res) => {
    res.send("<h1>getChats</h1>");
};

module.exports.getChatMessages = (req, res) => {
    res.send("<h1>getChatMessages</h1>");
};

module.exports.createChat = async (req, res) => {
   res.send("<h1>createChat</h1>");
};

module.exports.createMessage = async (req, res) => {
    res.send("<h1>createMessage</h1>");
};

module.exports.updateMessageStatus = (req, res) => {
    res.send("<h1>updateMessageStatus</h1>");
};