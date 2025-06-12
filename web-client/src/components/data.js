export const users = [
  {
    _id: '6846d8ba718f7212e4a8a26c',
    userName: 'user_01',
    avatar: '1749473465777-231085305.jpg',
    createdAt: '2025-06-09T12:51:06.126Z'
  },
  {
    _id: '6846d90a341a1f401038d7b8',
    userName: 'user_02',
    avatar: '1749473545746-1548082.jpg',
    createdAt: '2025-06-09T12:52:26.171Z'
  },
  {
    _id: '684a4db497e765fd3df5cd2f',
    userName: 'user_03',
    avatar: '1749700020222-735200788.jpg',
    createdAt: '2025-06-12T03:47:00.327Z'
  },
  {
    _id: '684aaa655f0d02f70209c60d',
    userName: 'user_04',
    avatar: 'default_avatar.jpg',
    createdAt: '2025-06-12T10:22:29.797Z'
  }
];

export const chats = [
  {
    _id: '684aa9b65f0d02f70209c5bd',
    members: [
      {
        _id: '6846d90a341a1f401038d7b8',
        userName: 'user_02',
        avatar: '1749473545746-1548082.jpg'
      },
      {
        _id: '6846d8ba718f7212e4a8a26c',
        userName: 'user_01',
        avatar: '1749473465777-231085305.jpg'
      }
    ],
    lastMessage: {
      _id: '684aa9eb5f0d02f70209c5e2',
      senderId: '6846d8ba718f7212e4a8a26c',
      content: '♥',
      type: 'text',
      status: 'seen'
    },
    createdAt: '2025-06-12T10:19:34.130Z',
    updatedAt: '2025-06-12T10:20:27.865Z',
    __v: 0
  },
  {
    _id: '684aaa3b5f0d02f70209c5fd',
    members: [
      {
        _id: '6846d8ba718f7212e4a8a26c',
        userName: 'user_01',
        avatar: '1749473465777-231085305.jpg'
      },
      {
        _id: '684a4db497e765fd3df5cd2f',
        userName: 'user_03',
        avatar: '1749700020222-735200788.jpg'
      }
    ],
    lastMessage: {
      _id: '684aaa3c5f0d02f70209c600',
      senderId: '6846d8ba718f7212e4a8a26c',
      content: '♥',
      type: 'text',
      status: 'delivered'
    },
    createdAt: '2025-06-12T10:21:47.539Z',
    updatedAt: '2025-06-12T10:21:48.457Z',
    __v: 0
  },
  {
    _id: '684aab4f9a09f439a9344c04',
    senderId: '6846d8ba718f7212e4a8a26c',
    chatId: '684aab4f9a09f439a9344c01',
    type: 'text',
    content: '♥',
    status: 'sent',
    createdAt: '2025-06-12T10:26:23.756Z'
  }
];

export const chatUsers = [
  {
    _id: '6846d8ba718f7212e4a8a26c',
    userName: 'user_01',
    avatar: '1749473465777-231085305.jpg',
    createdAt: '2025-06-09T12:51:06.126Z'
  },
  {
    _id: '6846d90a341a1f401038d7b8',
    userName: 'user_02',
    avatar: '1749473545746-1548082.jpg',
    createdAt: '2025-06-09T12:52:26.171Z',
    chat: {
      _id: '684aa9b65f0d02f70209c5bd',
      members: [
        {
          _id: '6846d90a341a1f401038d7b8',
          userName: 'user_02',
          avatar: '1749473545746-1548082.jpg'
        },
        {
          _id: '6846d8ba718f7212e4a8a26c',
          userName: 'user_01',
          avatar: '1749473465777-231085305.jpg'
        }
      ],
      lastMessage: {
        _id: '684aa9eb5f0d02f70209c5e2',
        senderId: '6846d8ba718f7212e4a8a26c',
        content: '♥',
        type: 'text',
        status: 'seen'
      },
      createdAt: '2025-06-12T10:19:34.130Z',
      updatedAt: '2025-06-12T10:20:27.865Z',
      __v: 0
    }
  },
  {
    _id: '684a4db497e765fd3df5cd2f',
    userName: 'user_03',
    avatar: '1749700020222-735200788.jpg',
    createdAt: '2025-06-12T03:47:00.327Z',
    chat: {
      _id: '684aaa3b5f0d02f70209c5fd',
      members: [
        {
          _id: '6846d8ba718f7212e4a8a26c',
          userName: 'user_01',
          avatar: '1749473465777-231085305.jpg'
        },
        {
          _id: '684a4db497e765fd3df5cd2f',
          userName: 'user_03',
          avatar: '1749700020222-735200788.jpg'
        }
      ],
      lastMessage: {
        _id: '684aaa3c5f0d02f70209c600',
        senderId: '6846d8ba718f7212e4a8a26c',
        content: '♥',
        type: 'text',
        status: 'delivered'
      },
      createdAt: '2025-06-12T10:21:47.539Z',
      updatedAt: '2025-06-12T10:21:48.457Z',
      __v: 0
    }
  },
  {
    _id: '684aaa655f0d02f70209c60d',
    userName: 'user_04',
    avatar: 'default_avatar.jpg',
    createdAt: '2025-06-12T10:22:29.797Z',
    chat: {
      _id: '684aab4f9a09f439a9344c01',
      members: [
        {
          _id: '6846d8ba718f7212e4a8a26c'
        },
        {
          _id: '684aaa655f0d02f70209c60d'
        }
      ],
      lastMessage: {
        _id: '684aab4f9a09f439a9344c04',
        senderId: '6846d8ba718f7212e4a8a26c',
        chatId: '684aab4f9a09f439a9344c01',
        type: 'text',
        content: '♥',
        status: 'sent',
        createdAt: '2025-06-12T10:26:23.756Z'
      }
    }
  }
];

export const messages = [
  {
    _id: '684aab4f9a09f439a9344c04',
    senderId: '6846d8ba718f7212e4a8a26c',
    chatId: '684aab4f9a09f439a9344c01',
    type: 'text',
    content: '♥',
    status: 'sent',
    createdAt: '2025-06-12T10:26:23.756Z'
  }
];