import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ChatSidebar from './ChatSidebar'; 
import ChatBody from './ChatBody';
import { getUsers, getChats, setChatUsers } from '../store/chatSlice';

const Messenger = () => {
    const dispatch = useDispatch();

    const { currentUser } = useSelector(state => state.auth);
    const { userMap, chatMap } = useSelector(state => state.chat);

    const [theme, setTheme] = useState('light');

    const handleSetTheme = (e) => {
        localStorage.setItem('theme', e.target.value);
        setTheme(e.target.value);
    };

    useEffect(()=>{
        const savedTheme = localStorage.getItem('theme');
        if(savedTheme) setTheme(savedTheme);
        dispatch(getUsers());
        dispatch(getChats());
    }, [])

    useEffect(()=>{
        if (!userMap || !chatMap) return;
        const userChats = {}
        Object.values(userMap).forEach(user => {
            if (user._id === currentUser._id) return;
            userChats[user._id] = null
        })
        Object.values(chatMap).forEach(chat => {
            const targetUser = chat.members.find(member=>member._id !== currentUser._id)
            userChats[targetUser._id] = chat._id
        })
        dispatch(setChatUsers(userChats));
    }, [userMap, chatMap])

    return (
        <div className={theme==='light' ? 'messenger':'messenger dark'}>
            <div className="row">
                <div className="col-3">
                    <ChatSidebar currentUser={currentUser} theme={theme} handleSetTheme={handleSetTheme}/>
                </div>
                <div className='col-9'>
                    <ChatBody currentUser={currentUser}/>
                </div>
            </div>
        </div>
    )
}

export default Messenger