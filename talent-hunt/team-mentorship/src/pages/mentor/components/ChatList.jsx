import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  TextField,
  InputAdornment,
  Badge,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  FiberManualRecord as FiberManualRecordIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ChatList = ({ onSelectChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);

  const chats = [
    {
      id: 1,
      name: 'John Doe',
      lastMessage: 'Can we discuss the project timeline?',
      timestamp: '10:30 AM',
      unread: 2,
      online: true,
      avatar: 'JD',
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      lastMessage: 'I need help with the API integration',
      timestamp: 'Yesterday',
      unread: 0,
      online: false,
      avatar: 'SW',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      lastMessage: 'The UI design is ready for review',
      timestamp: '2 days ago',
      unread: 0,
      online: true,
      avatar: 'MJ',
    },
  ];

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatSelect = (chat) => {
    setSelectedChat(chat.id);
    onSelectChat(chat);
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: (theme) => theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, rgba(17, 25, 40, 0.95), rgba(22, 31, 49, 0.95))'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(247, 250, 252, 0.95))',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)',
        border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
      }}
    >
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.05)',
            },
          }}
        />
      </Box>

      <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
        {filteredChats.map((chat) => (
          <motion.div
            key={chat.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <ListItem
              button
              selected={selectedChat === chat.id}
              onClick={() => handleChatSelect(chat)}
              sx={{
                px: 2,
                py: 1.5,
                '&.Mui-selected': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.05)',
                },
              }}
            >
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  color={chat.online ? 'success' : 'default'}
                >
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 48,
                      height: 48,
                    }}
                  >
                    {chat.avatar}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {chat.name}
                    </Typography>
                    {chat.online && (
                      <FiberManualRecordIcon
                        sx={{ fontSize: 12, color: 'success.main' }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {chat.lastMessage}
                  </Typography>
                }
              />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {chat.timestamp}
                </Typography>
                {chat.unread > 0 && (
                  <Box
                    sx={{
                      bgcolor: 'primary.main',
                      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      color: 'white',
                      borderRadius: '12px',
                      minWidth: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                      transform: 'scale(1)',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    {chat.unread}
                  </Box>
                )}
              </Box>
            </ListItem>
            <Divider sx={{ mx: 2 }} />
          </motion.div>
        ))}
      </List>
    </Box>
  );
};

export default ChatList; 