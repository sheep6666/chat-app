import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useSound from 'use-sound'
import {io} from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import ChatSidebar from './ChatSidebar'; 
import ChatBody from './ChatBody';
import { 
    getUsers, 
    getChats, 
    setChatUsers, 
    setChatUsersInitialized,
    setIsUserTyping, 
    setOnlineUserMap, 
    updateUserMap,
    updateOnlineUserMap, 
    updateCurrentMessage,
    updateChatLastMessage,
    pushMessage,
    pushChat,
    updateMessageStatusDB
} from '../store/chatSlice';
import notificationSound from '../audio/notification.mp3'
import SOCKET_EVENTS from "../socketEvents";
import env from '@/config';

const Messenger = () => {
    const dispatch = useDispatch();
    const [notificationSPlay] = useSound(notificationSound)
    const { currentUser } = useSelector(state => state.auth);
    const { userMap, chatMap, selectedUserId, chatUsersInitialized } = useSelector(state => state.chat);
    const [theme, setTheme] = useState('light');
    const [isSocketReady, setIsSocketReady] = useState(false);
    const socket = useRef();
    const typingTimerRef = useRef(null);
    const selectedUserIdRef = useRef(null);
    const userMapRef = useRef(null);
    const scrollRef = useRef();

    const handleSetTheme = (e) => {
        localStorage.setItem('theme', e.target.value);
        setTheme(e.target.value);
    };

    useEffect(() => {
        selectedUserIdRef.current = selectedUserId;
        userMapRef.current = userMap;
    }, [selectedUserId, userMap]);

    useEffect(()=>{
        const savedTheme = localStorage.getItem('theme');
        if(savedTheme) setTheme(savedTheme);
        dispatch(getUsers());
        dispatch(getChats());
    }, [])

    useEffect(()=>{
            if (!userMap || !chatMap) return;
            if (chatUsersInitialized) return;
            const chatUsers = {}
            Object.values(userMap).forEach(user => {
                if (user._id === currentUser._id) return;
                chatUsers[user._id] = null
            })
            Object.values(chatMap).forEach(chat => {
                const targetUser = chat.members.find(member=>member._id !== currentUser._id)
                chatUsers[targetUser._id] = chat._id
            })
            dispatch(setChatUsers(chatUsers));
            dispatch(setChatUsersInitialized(true));
        }, [userMap, chatMap, chatUsersInitialized])

    useEffect(() => {
        if(!isSocketReady || !chatMap) return;
        if (selectedUserId) return;
        Object.values(chatMap).forEach(chat => {
            if (chat.lastMessage.status === 'sent' && chat.lastMessage.senderId !== currentUser._id){
                const updatedMessage = {...chat.lastMessage, status:'delivered'}
                dispatch(updateMessageStatusDB(updatedMessage)) 
                socket.current.emit(SOCKET_EVENTS.CLIENT_MESSAGE_UPDATED, {
                    senderId: currentUser._id,
                    receiverIds: [updatedMessage.senderId],
                    message: updatedMessage
                });
            }
        })
    }, [chatMap, isSocketReady, selectedUserId])

    useEffect(() => {
        socket.current = io(env.WEBSOCKET_URL, {
            path: '/ws/socket.io',
            auth: {
                userId: currentUser._id, 
                userName: currentUser.userName, 
                avatar: currentUser.avatar, 
                createdAt: currentUser.createdAt
            }
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
            dispatch(updateOnlineUserMap({[data.userId]: true})); 
            dispatch(updateUserMap(data)); 
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
            notificationSPlay()
            const {senderId, message} = data;
            const updatedMessage = {...message, status: 'delivered'}
            if(senderId === selectedUserIdRef.current){
                dispatch(pushMessage(updatedMessage));
            }
            else{
                toast.success(`${userMapRef.current[senderId].userName} send you a new Message`) 
            }
            if (!chatMap?.[updatedMessage.chatId]){
                const newChat = {
                        _id: updatedMessage.chatId,
                        members: [{_id: currentUser._id}, {_id: senderId}],
                        lastMessage: updatedMessage
                    }
                dispatch(pushChat({userId: senderId, chat: newChat}));
            }
            else{
                updateChatLastMessage(updatedMessage)
            }

            dispatch(updateMessageStatusDB(updatedMessage)) 
            socket.current.emit(SOCKET_EVENTS.CLIENT_MESSAGE_UPDATED, {
                senderId: currentUser._id,
                receiverIds: [updatedMessage.senderId],
                message: updatedMessage
            });
        });
        // A message has been marked as read or delivered
        socket.current.on(SOCKET_EVENTS.SERVER_MESSAGE_UPDATED, (data)=>{   
            const {senderId, message} = data;
            dispatch(updateChatLastMessage(message));      
            if(senderId === selectedUserIdRef.current){
                dispatch(updateCurrentMessage(message));  
            }
        })
        setIsSocketReady(true);
        return () => {
            socket.current.disconnect(); 
        };
    }
    , []);

    return (
        <div className={theme==='light' ? 'messenger':'messenger dark'}>
            <Toaster 
                position={'top-right'} 
                reverseOrder = {false} 
                toastOptions = {{
                    style : {
                        fontSize: '18px'
                    }
                }}
            />
            <div className="row">
                <div className="col-3">
                    <ChatSidebar currentUser={currentUser} theme={theme} handleSetTheme={handleSetTheme}/>
                </div>
                <div className='col-9'>
                    <ChatBody socket={socket} scrollRef={scrollRef} currentUser={currentUser}/>
                </div>
            </div>
        </div>
    )
}

export default Messenger