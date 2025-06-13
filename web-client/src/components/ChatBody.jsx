import { FaVideo, FaPhoneAlt, FaRocketchat } from 'react-icons/fa';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import ChatInfoPanel from './ChatInfoPanel';

const ChatBody = ({currentUser, selectedUser, messages}) => {
    
    return (
        <div className="right-side">
            <input type="checkbox" id='dot' />
            <div className="row">
                {/* 左側當前聊天面板部分 */}
                <div className="col-8">
                    <div className="message-send-show">
                        {/* 當前聊天面板，上部 header 部分 */}
                        <div className="header">
                            <div className="image-name">
                                <div className="image">
                                    <img src={`http://localhost:5001/uploads/avatars/${selectedUser.avatar}`} alt="" />
                                    <div className="active-icon"></div>
                                </div>
                                <div className="name">
                                    <h3>{selectedUser.userName}</h3>
                                </div>
                            </div>
                            <div className="icons">
                                <div className="icon">
                                    <FaPhoneAlt />
                                </div>
                                <div className="icon">
                                    <FaVideo />
                                </div>
                                <div className="icon">
                                    <label htmlFor="dot"><FaRocketchat /></label>
                                </div>
                            </div>
                        </div>

                        {/* 當前聊天面板，中間聊天訊息部分 */}
                        <ChatHistory currentUser={currentUser} selectedUser={selectedUser} messages={messages}/>

                        {/* 當前聊天面板，下部訊息輸入部分 */}
                        <ChatInput />
                    </div>
                </div>

                {/* 右側好友資訊面板部分 */}
                <div className="col-4">
                    <ChatInfoPanel selectedUser={selectedUser} messages={messages}/>
                </div>
            </div>
        </div>
    )
}

export default ChatBody