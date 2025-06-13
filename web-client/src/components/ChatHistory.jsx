import { useEffect } from 'react';
import moment from 'moment'
import { useDispatch, useSelector } from 'react-redux';
import { FaRegCheckCircle, FaRegCircle } from 'react-icons/fa';
import { clearIsMessageSent } from '../store/chatSlice';
import SOCKET_EVENTS from "../socketEvents";
  
const ChatHistory = ({socket, currentUser, selectedUser, messages}) => {
  const dispatch = useDispatch();
  const { isUserTyping, isMessageSent } = useSelector(state => state.chat);

  // 當發送的訊息被後端處理成功時，才執行的動作
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
              <div className="my-message">
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
                {/* 訊息時間展示 */}
                <p className="time">{msg.createdAt}</p>
              </div>
              :
              <div className="fd-message">
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
                    <p className="time">{msg.createdAt}</p>
                  </div>
                </div>
              </div>
          ))
        }
      </div>

      {/* 聊天狀態展示條（對象輸入中狀態） */}
      { isUserTyping ? 
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