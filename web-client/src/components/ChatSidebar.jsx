import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FaEdit, FaEllipsisH, FaSistrix, FaSignOutAlt } from 'react-icons/fa';
import ChatCard from './ChatCard'
import { userLogout } from '../store/authSlice';

const ChatSidebar = ({ currentUser, chatUsers, theme, handleSetTheme }) => {
    const dispatch = useDispatch();

    const [isThemeMenuVisible, setIsThemeMenuVisible] = useState(false);
    const toggleThemeMenu = () =>{ setIsThemeMenuVisible(!isThemeMenuVisible) };
    const handleLogoutClick = () =>{dispatch(userLogout())};
    return (
        <div className="left-side">
            <div className="top">
                <div className="image-name">
                    <div className="image">
                        <img src={`http://localhost:5001/uploads/avatars/${currentUser.avatar}`} alt=''></img>
                    </div>
                    <div className="name">
                        <h3>{currentUser.userName}</h3>
                    </div>
                </div>


                <div className="icons">
                    <div className="icon" onClick={toggleThemeMenu}>
                        <FaEllipsisH />
                    </div>
                    <div className="icon">
                        <FaEdit />
                    </div>
                    <div className={isThemeMenuVisible ? 'theme_logout show' : 'theme_logout'}>
                        <h3>Dark Mode</h3>
                        <div className="on">
                            <label htmlFor="dark">ON</label>
                            <input
                                type="radio"
                                value="dark"
                                name="theme"
                                id="dark"
                                onChange={handleSetTheme}
                                checked={theme === 'dark'}
                            />
                        </div>
                        <div className="off">
                            <label htmlFor="light">OFF</label>
                            <input
                                type="radio"
                                value="light"
                                name="theme"
                                id="light"
                                onChange={handleSetTheme}
                                checked={theme === 'light'}
                            />
                        </div>
                        <div className="logout" onClick={handleLogoutClick}>
                            <FaSignOutAlt />  Logout
                        </div>
                    </div>
                </div>
            </div>

            <div className="friend-search">
                <div className="search">
                    <button><FaSistrix /></button>
                    <input type="text" placeholder='Search' className='form-control' onChange={null} />
                </div>
            </div>

            <div className="friends">
                {
                    chatUsers?.length > 0 &&
                    chatUsers.map((chatUser, index) => (
                        <ChatCard chatUser={chatUser} />
                    ))
                }
            </div>
        </div>
    )
}

export default ChatSidebar