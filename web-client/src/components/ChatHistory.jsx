import { useEffect } from 'react';
import moment from 'moment'
import { useDispatch, useSelector } from 'react-redux';
import { FaRegCheckCircle, FaRegCircle } from 'react-icons/fa';
import { clearIsMessageSent, updateMessageStatusDB, updateChatLastMessage } from '../store/chatSlice';
import SOCKET_EVENTS from "../socketEvents";

const ChatHistory = ({ socket, scrollRef, currentUser, selectedUser, messages }) => {
  const dispatch = useDispatch();
  const { isUserTyping, isMessageSent } = useSelector(state => state.chat);

  // After the message is successfully processed by the server, notify the recipient client via WebSocket
  useEffect(() => {
    if (isMessageSent) {
      const lastMessage = messages[messages.length - 1];
      socket.current.emit(SOCKET_EVENTS.CLIENT_MESSAGE_SENT, {
        senderId: currentUser._id,
        receiverIds: [selectedUser._id],
        message: lastMessage
      });
      dispatch(clearIsMessageSent());
    }
  }, [isMessageSent])
useEffect(() => {
      scrollRef.current?.scrollIntoView({
          behavior: 'smooth'
      });
  }, [messages]);
  // Mark the last loaded message as read, if it hasn't been read yet
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const lastMsg = messages[messages.length - 1]
    if (lastMsg.status === 'seen') return;

    if (lastMsg.senderId !== currentUser._id) {
      const updatedMessage = { ...lastMsg, status: 'seen' }
      dispatch(updateChatLastMessage(updatedMessage));
      dispatch(updateMessageStatusDB(updatedMessage));

      socket.current.emit(SOCKET_EVENTS.CLIENT_MESSAGE_UPDATED, {
        senderId: currentUser._id,
        receiverIds: [lastMsg.senderId],
        message: updatedMessage
      })
    }
  }
    , [messages]);

  if (!messages || messages.length === 0) return (
    <div className="message-show">
      <div className="friend_connect">
        <img src={`http://localhost:5001/uploads/avatars/${selectedUser.avatar}`} alt="" />
        <h3>{selectedUser.userName} Connect you</h3>
        <span>{moment(selectedUser.createdAt).startOf('mini').fromNow()}</span>
      </div>
    </div>
  );
  return (
    <>
      <div className="message-show">
        {
          messages.map((msg, i) => (
            msg.senderId === currentUser._id ?
              <div className="my-message"  ref={scrollRef} key={i}>
                <div className="image-message">
                  <div className="my-text">
                    {/* 訊息展示（文字 / 圖片） */}
                    <p className="message-text">
                      {
                        msg.type === 'text'
                          ? msg.content
                          : <img src={`http://localhost:5001/uploads/images/${msg.content}`} alt="" />
                      }
                    </p>
                    <div className="time-status">
                    {/* 訊息時間展示 */}
                    <p className="time">{moment(msg.createdAt).startOf('mini').fromNow()}</p>

                    {/* 在最後一則訊息下方，展示已讀狀態 */}
                    {
                      i === messages.length - 1 ?
                        (
                          msg.status === 'seen'
                            ? <img className='img' src={`http://localhost:5001/uploads/avatars/${selectedUser.avatar}`} alt="" />
                            :
                            (
                              msg.status === 'delivered' ?
                                <span><FaRegCheckCircle /></span>
                                : <span><FaRegCircle /></span>
                            )
                        )
                        : null
                    }
                    </div>
                  </div>
                </div>
                
              </div>
              :
              <div className="fd-message"  ref={scrollRef} key={i}>
                <div className="image-message-time">
                  <img src={`http://localhost:5001/uploads/avatars/${selectedUser.avatar}`} alt="" />
                  <div className="message-time">
                    <div className="fd-text">
                      <p className="message-text">
                        {
                          msg.type === 'text'
                            ? msg.content
                            : <img src={`http://localhost:5001/uploads/images/${msg.content}`} alt="message" />
                        }
                      </p>
                    </div>
                    <p className="time">{moment(msg.createdAt).startOf('mini').fromNow()}</p>
                  </div>
                </div>
              </div>
          ))
        }
      </div>

      {/* 聊天狀態展示條（對象輸入中狀態） */}
      {isUserTyping ?
        <div className="typing-message">
          <div className="fd-message">
            <div className="image-message-time">
              <img src={`http://localhost:5001/uploads/avatars/${selectedUser.avatar}`} alt="" />
              <div className="message-time">
                <div className="fd-text">
                  <p className="time">Typing Message...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        : null
      }
    </>
  )
}

export default ChatHistory