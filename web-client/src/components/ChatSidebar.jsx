import { FaEdit, FaEllipsisH, FaSistrix } from 'react-icons/fa';
import ChatCard from './ChatCard'
import { users, chatUsers } from './data.js';
const currentUser = users[0];

const ChatSidebar = () => {

    return (
        <div className="left-side">
            <div className="top">
                <div className="image-name">
                    <div className="image">
                        <img src={`http://localhost:5001/uploads/avatars/${currentUser.avatar}`} alt=''></img>
                    </div>
                    <div className="name">
                        <h3>{currentUser.userName}</h3>
                    </div>
                </div>

                
                <div className="icons">
                    <div className="icon">
                        <FaEllipsisH />
                    </div>
                    <div className="icon">
                        <FaEdit />
                    </div>
                </div>
            </div>

            <div className="friend-search">
                <div className="search">
                    <button><FaSistrix /></button>
                    <input type="text" placeholder='Search' className='form-control' onChange={null} />
                </div>
            </div>

            <div className="friends">
            {
                chatUsers?.length > 0 && 
                chatUsers.map((chatUser, index) => (
                    <ChatCard chatUser={chatUser} />
                ))
            }
            </div>
        </div>
    )
}

export default ChatSidebar