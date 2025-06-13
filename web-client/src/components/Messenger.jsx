import ChatSidebar from './ChatSidebar'; 
import ChatBody from './ChatBody';
import { users, chatUsers, messages } from './data.js';
const currentUser = users[0];
const selectedUser = users[1];

const Messenger = () => {
    return (
        <div className='messenger'>
            <div className="row">
                <div className="col-3">
                    <ChatSidebar currentUser={currentUser} chatUsers={chatUsers}/>
                </div>
                <div className='col-9'>
                    <ChatBody currentUser={currentUser} selectedUser={selectedUser} messages={messages}/>
                </div>
            </div>
        </div>
    )
}

export default Messenger