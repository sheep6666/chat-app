import { useState, useEffect } from 'react';

import ChatSidebar from './ChatSidebar'; 
import ChatBody from './ChatBody';
import { users, chatUsers, messages } from './data.js';
const currentUser = users[0];
const selectedUser = users[1];

const Messenger = () => {
    const [theme, setTheme] = useState('light');

    const handleSetTheme = (e) => {
        localStorage.setItem('theme', e.target.value);
        setTheme(e.target.value);
    };

    useEffect(()=>{
        const savedTheme = localStorage.getItem('theme');
        if(savedTheme) setTheme(savedTheme);
    }, [])

    return (
        <div className={theme==='light' ? 'messenger':'messenger dark'}>
            <div className="row">
                <div className="col-3">
                    <ChatSidebar currentUser={currentUser} chatUsers={chatUsers} theme={theme} handleSetTheme={handleSetTheme}/>
                </div>
                <div className='col-9'>
                    <ChatBody currentUser={currentUser} selectedUser={selectedUser} messages={messages}/>
                </div>
            </div>
        </div>
    )
}

export default Messenger