import { useState } from 'react';
import { FaGift, FaFileImage, FaPlusCircle, FaRegSmile, FaPaperPlane } from 'react-icons/fa';

const emojis = [
    '😀', '😃', '😄', '😁',
    '😆', '😅', '😂', '🤣',
    '😊', '😇', '🙂', '🙃',
    '😉', '😌', '😍', '😝',
    '😜', '🧐', '🤓', '😎',
    '😕', '🤑', '🥴', '😱'
]

const MesageSend = () => {
    const [draftMessage, setDraftMessage] = useState('');

    const onInputChange = () => {

    }
    const onAddEmoji = () => {

    }
    const onSendTextMessage = () => {

    }
    const onSendImageMessage = () => {

    }
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