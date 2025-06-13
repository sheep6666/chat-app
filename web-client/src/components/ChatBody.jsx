import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaVideo, FaPhoneAlt, FaRocketchat } from 'react-icons/fa';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import ChatInfoPanel from './ChatInfoPanel';
import { getChatMessages, clearMessage } from '../store/chatSlice';

const ChatBody = ({socket, scrollRef, currentUser}) => {
    const dispatch = useDispatch();
  const { selectedUserId, messages } = useSelector(state => state.chat);
  const isOnline = useSelector(state => state.chat.onlineUserMap?.[selectedUserId]);
  const chatId = useSelector(state => state.chat.chatUsers?.[selectedUserId]);
  const chat = useSelector(state => state.chat.chatMap?.[chatId]);
  const selectedUser = useSelector(state => state.chat.userMap?.[selectedUserId]);

    useEffect(() => {
        if (chatId) {
            dispatch(getChatMessages(chatId));
        } else{
            dispatch(clearMessage());
        }
    }, [chatId])

    if (!selectedUserId) return ('Please select a conversation to chat with.')
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
                                    {isOnline?<div className="active-icon"></div>:null}
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
                        <ChatHistory socket={socket} scrollRef={scrollRef} currentUser={currentUser} selectedUser={selectedUser} messages={messages}/>

                        {/* 當前聊天面板，下部訊息輸入部分 */}
                        <ChatInput socket={socket} currentUser={currentUser} chat={chat}/>
                    </div>
                </div>

                {/* 右側好友資訊面板部分 */}
                <div className="col-4">
                    <ChatInfoPanel selectedUser={selectedUser} messages={messages} isOnline={isOnline}/>
                </div>
            </div>
        </div>
    )
}

export default ChatBody