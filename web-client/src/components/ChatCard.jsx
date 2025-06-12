import moment from 'moment'
import { FaRegCircle, FaRegCheckCircle } from 'react-icons/fa';
import { users } from './data.js';
const currentUser = users[0];

const ChatCard = ({ chatUser }) => {
  if (chatUser._id === currentUser._id) return null;
  const lastMessage = chatUser?.chat?.lastMessage;

  const handleClick = () => {
  }
  
  const getLastMessagePreview = () => {
    if (!lastMessage) {
      const time = moment(chatUser.createdAt).startOf('minute').fromNow();
      return `${chatUser.userName} connected to you • ${time}`;
    }

    let senderName = lastMessage.senderId === currentUser._id ? "You" : currentUser.userName;
    let messageSnippet = lastMessage.type === 'text' ? lastMessage.content.slice(0, 10) : "sent an Image";
    const time = moment(lastMessage.createdAt).startOf('minute').fromNow();
    return `${senderName}: ${messageSnippet} • ${time}`
  }

  const getLastMessageStatus = () => {
    if (!lastMessage) return;

    if(lastMessage.senderId === currentUser._id){
        if (lastMessage.status === 'seen'){
            return <img src={`http://localhost:5001/uploads/avatars/${chatUser.avatar}`} alt="" />
        }else if(lastMessage.status === 'delivered'){
            return <div className="delivered"><FaRegCheckCircle /></div>
        }else{
            return <div className="sent"><FaRegCircle /></div>
        }
    }
    else{
        if(lastMessage.status === 'seen'){
            return null
        }else{
            return <div className="seen-icon"></div>
        }
    }
  }

  return (
    <div className='hover-friend' onClick={handleClick}>
      <div className="friend">
        <div className="friend-image">
          <div className="image">
            <img src={`http://localhost:5001/uploads/avatars/${chatUser.avatar}`} alt="" />
            <div className="active_icon"></div>
          </div>
        </div>

        <div className="friend-name-seen">
          <div className="friend-name">
            <h4 className="Fd_name">{chatUser.userName}</h4>
            <div className="msg-time">
              <span>{getLastMessagePreview()}</span>
            </div>
          </div>
          <div className="seen-unseen-icon">
            {getLastMessageStatus()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatCard;