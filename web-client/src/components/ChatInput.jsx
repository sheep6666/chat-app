import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from "lodash";
import useSound from 'use-sound'
import { FaGift, FaFileImage, FaPlusCircle, FaRegSmile, FaPaperPlane } from 'react-icons/fa';
import { setDraftMessage, sendMessage, createChatAndSendMessage } from '../store/chatSlice';
import SOCKET_EVENTS from "../socketEvents";
import sendingSound from '../audio/sending.mp3'

const emojis = [
    '😀', '😃', '😄', '😁',
    '😆', '😅', '😂', '🤣',
    '😊', '😇', '🙂', '🙃',
    '😉', '😌', '😍', '😝',
    '😜', '🧐', '🤓', '😎',
    '😕', '🤑', '🥴', '😱'
]

const MesageSend = ({socket, currentUser, chat}) => {
    const dispatch = useDispatch();
    const [sendingSPlay] = useSound(sendingSound)
    const { draftMessage, selectedUserId } = useSelector(state => state.chat);
    const isComposing = useRef(false); 
    const sendTypingEvent = debounce(() => {
        socket.current.emit(SOCKET_EVENTS.CLIENT_USER_TYPING, { 
            senderId: currentUser._id, 
            receiverIds: [selectedUserId], 
            chatId: chat?._id
        });
    }, 1000
    );
    const onInputChange = (e) => {
        dispatch(setDraftMessage(e.target.value));
        sendTypingEvent();
    }
    const onAddEmoji = (e) => {
        dispatch(setDraftMessage(draftMessage + e));
        sendTypingEvent();
    }
    const onSendTextMessage = (e) => {
        //sendingSPlay();
        let data = {
            chatId: chat?._id,
            senderId: currentUser._id,
            content: draftMessage ? draftMessage : '♥',
            type: 'text'
        }
        if (chat) {
            dispatch(sendMessage(data));
        } else {
            dispatch(createChatAndSendMessage({ members: [selectedUserId, currentUser._id], message: data }));
        }
    }
    const onSendImageMessage = (e) => {
        if (e.target.files.length === 0) return;
        //sendingSPlay();
        let formData = new FormData();
        formData.append('chatId', chat?._id);
        formData.append('senderId', currentUser._id,);
        formData.append('type', "image");
        formData.append('image', e.target.files[0]);
        if (chat) {
            dispatch(sendMessage(formData));
        } else {
            dispatch(createChatAndSendMessage({ members: [selectedUserId, currentUser._id], message: formData }));
        }
        e.target.value = ''
    }
    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !isComposing.current) {
            onSendTextMessage(e);
        }
    };
    return (
        <div className='message-send-section'>
            <input type="checkbox" id='emoji' />
            <div className="file hover-attachment">
                <div className="add-attachment">
                    Add Attachment
                </div>
                <FaPlusCircle />
            </div>

            <div className="file hover-image">
                <div className="add-image">
                    Add Image
                </div>
                <input type="file" id="pic" className='form-control' name="image" onChange={onSendImageMessage} />
                <label htmlFor="pic"> <FaFileImage /> </label>
            </div>

            <div className="file hover-gift">
                <div className="add-gift">
                    Add Gift
                </div>
                <FaGift />
            </div>

            <div className="message-type">
                <input
                    type="text"
                    onKeyDown={onKeyDown}
                    onChange={onInputChange}
                    value={draftMessage}
                    name='message'
                    id='message'
                    placeholder='Aa'
                    className='form-control'
                />
                <div className="file hover-gift">
                    <label htmlFor="emoji"><FaRegSmile /></label>
                </div>
            </div>

            <div className="file" onClick={onSendTextMessage}>
                <label>{draftMessage ? <FaPaperPlane /> : "♥"}</label>
            </div>

            <div className="emoji-section">
                <div className="emoji">
                    {emojis.map((e, i) => (
                        <span key={i} onClick={() => onAddEmoji(e)}>{e}</span>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default MesageSend