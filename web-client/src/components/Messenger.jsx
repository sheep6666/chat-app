import ChatSidebar from './ChatSidebar'; 
// import ChatBody from './ChatBody';

const Messenger = () => {

    return (
        <div className='messenger'>
            <div className="row">
                <div className="col-3">
                    <ChatSidebar/>
                </div>
                <div className='col-9'>
                    {/* <ChatBody/> */}
                </div>
            </div>
        </div>
    )
}

export default Messenger