import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment'
import { FaRegCircle, FaRegCheckCircle } from 'react-icons/fa';
import { setSelectedUserId } from '../store/chatSlice';
import env from '@/config';

const ChatCard = ({ userId }) => {
  const dispatch = useDispatch(); 
  const { currentUser } = useSelector(state => state.auth);
  const { selectedUserId } = useSelector(state => state.chat);
  const chatId = useSelector(state => state.chat.chatUsers?.[userId]);
  const chat = useSelector(state => state.chat.chatMap?.[chatId]);
  const user = useSelector(state => state.chat.userMap?.[userId]);
  const isOnline = useSelector(state => state.chat.onlineUserMap?.[userId]);
  const lastMessage = chat?.lastMessage;
  const handleClick = () => {
    dispatch(setSelectedUserId(user._id));
  }
  
  const getLastMessagePreview = () => {
    if (!lastMessage) {
      const time = moment(user.createdAt).startOf('minute').fromNow();
      return `${user.userName} connected to you • ${time}`;
    }

    let senderName = lastMessage.senderId === currentUser._id ? "You" : user.userName;
    let messageSnippet = lastMessage.type === 'text' ? lastMessage.content.slice(0, 10) : "sent an Image";
    const time = moment(lastMessage.createdAt).startOf('minute').fromNow();
    return `${senderName}: ${messageSnippet} • ${time}`
  }

  const getLastMessageStatus = () => {
    if (!lastMessage) return;

    if(lastMessage.senderId === currentUser._id){
        if (lastMessage.status === 'seen'){
            return <img src={`${env.STATIC_URL}/avatars/${user.avatar}`} alt="" />
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
    <div className={user._id===selectedUserId?'hover-friend active' : 'hover-friend'} onClick={handleClick}>
      <div className="friend">
        <div className="friend-image">
          <div className="image">
            <img src={`${env.STATIC_URL}/avatars/${user.avatar}`} alt="" />
            {isOnline?<div className="active_icon"></div>:null}
          </div>
        </div>

        <div className="friend-name-seen">
          <div className="friend-name">
            <h4 className="Fd_name">{user.userName}</h4>
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