import { FaCaretSquareDown } from 'react-icons/fa';
import env from '@/config';

const ChatInfoPanel = ({selectedUser, messages, isOnline}) => {
    return (
        <div className="friend-info">
            <input type="checkbox" id='gallery' />

            {/* 展示用戶資訊 */}
            <div className="image-name">
                <div className="image">
                    <img src={`${env.STATIC_URL}/avatars/${selectedUser.avatar}`} alt="" />
                </div>
                    {isOnline ? <div className="active-user">Active</div> : null}
                <div className="name">
                    <h4>{selectedUser.userName}</h4>
                </div>
            </div>

            {/* 三個功能區塊，目前只有 shared media 被開發 */}
            <div className="others">
                <div className="custom-chat">
                    <h3>Customize Chat</h3>
                    <FaCaretSquareDown />
                </div>
                <div className="privacy">
                    <h3>Privacy and Support</h3>
                    <FaCaretSquareDown />
                </div>
                <div className="media">
                    <h3>Shared Media</h3>
                    <label htmlFor="gallery"><FaCaretSquareDown /></label>
                </div>
            </div>

            {/* shared media 展開部分: 展示聊天發送過的歷史圖片 */}
            <div className="gallery">
                {
                    messages.length > 0 &&
                    messages.map((msg, index) => {
                        return (
                            msg.type === 'image' 
                            ? <img src={`${env.STATIC_URL}/images/${msg.content}`} key={index} alt="" /> 
                                : null
                            )
                        })
                }
            </div>
        </div>
    )
}

export default ChatInfoPanel