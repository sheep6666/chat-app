import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {io} from 'socket.io-client';
import ChatSidebar from './ChatSidebar'; 
import ChatBody from './ChatBody';
import { getUsers, getChats, setChatUsers, setIsUserTyping, setOnlineUserMap, updateOnlineUserMap } from '../store/chatSlice';
import SOCKET_EVENTS from "../socketEvents";

const Messenger = () => {
    const dispatch = useDispatch();

    const { currentUser } = useSelector(state => state.auth);
    const { userMap, chatMap, selectedUserId } = useSelector(state => state.chat);
    const [theme, setTheme] = useState('light');
    const socket = useRef();
    const typingTimerRef = useRef(null);
    const selectedUserIdRef = useRef(null);

    const handleSetTheme = (e) => {
        localStorage.setItem('theme', e.target.value);
        setTheme(e.target.value);
    };

    useEffect(() => {
        selectedUserIdRef.current = selectedUserId;
    }, [selectedUserId]);

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


    useEffect(() => {
        socket.current = io(`http://localhost:8000`, {
            auth: {userId: currentUser._id, userName: currentUser.userName}
        });

        // =======================================================================
        // Define handlers for specific events received from the WebSocket server
        // =======================================================================
        // Receive the list of currently online users
        socket.current.on(SOCKET_EVENTS.SERVER_ACTIVE_USERS, (data)=>{
            const onlineUserIds = data.map(o=>o.userId);
            dispatch(setOnlineUserMap(onlineUserIds));
        });
        //  A user has come online
        socket.current.on(SOCKET_EVENTS.SERVER_USER_JOINED, (data)=>{
            dispatch(updateOnlineUserMap({[data.senderId]: true}));  
        })
        // A user has gone offline
        socket.current.on(SOCKET_EVENTS.SERVER_USER_LEFT, (data)=>{
            dispatch(updateOnlineUserMap({[data.senderId]: false}));
        })
        // The current chat target is typing a message
        socket.current.on(SOCKET_EVENTS.SERVER_USER_TYPING, (data) => { 
            const {senderId, chatId} = data;
            if (senderId !== selectedUserIdRef.current) return;
            dispatch(setIsUserTyping(true));

            if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
            typingTimerRef.current = setTimeout(() => {
                dispatch(setIsUserTyping(false));
            }, 2000);
        });
        // A new message has been received
        socket.current.on(SOCKET_EVENTS.SERVER_MESSAGE_SENT, (data) => {
            console.log("Receive SERVER_MESSAGE_SENT", data)
        });
        // A message has been marked as read or delivered
        socket.current.on(SOCKET_EVENTS.SERVER_MESSAGE_UPDATED, (data)=>{    
            console.log("Receive SERVER_MESSAGE_UPDATED", data)
        })
        return () => {
            socket.current.disconnect(); 
        };
    }
    , []);

    return (
        <div className={theme==='light' ? 'messenger':'messenger dark'}>
            <div className="row">
                <div className="col-3">
                    <ChatSidebar currentUser={currentUser} theme={theme} handleSetTheme={handleSetTheme}/>
                </div>
                <div className='col-9'>
                    <ChatBody socket={socket} currentUser={currentUser}/>
                </div>
            </div>
        </div>
    )
}

export default Messenger