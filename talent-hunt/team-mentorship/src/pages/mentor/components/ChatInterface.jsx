import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiEmotionsIcon,
  Videocam as VideocamIcon,
  Call as CallIcon,
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MessageBubble = ({ message, isMentor }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isMentor ? 'flex-end' : 'flex-start',
        mb: 1.5,
        width: '100%',
        px: 3,
      }}
    >
      <Box
        sx={{
          p: 1.5,
          px: 2,
          borderRadius: '12px',
          background: isMentor
            ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
            : '#1e293b',
          color: '#fff',
          maxWidth: '65%',
          minWidth: '80px',
          wordBreak: 'break-word',
        }}
      >
        <Typography 
          variant="body1" 
          sx={{ 
            fontSize: '0.9375rem',
            lineHeight: 1.5,
          }}
        >
          {message.text}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.6)',
            textAlign: 'right',
          }}
        >
          {message.time}
        </Typography>
      </Box>
    </Box>
  );
};

const ChatInterface = ({ selectedChat }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const messages = [
    {
      id: 1,
      text: 'Hi there! How can I help you today?',
      time: '10:30 AM',
      isMentor: true,
    },
    {
      id: 2,
      text: 'I need help with the project timeline. Can we discuss it?',
      time: '10:31 AM',
      isMentor: false,
    },
    {
      id: 3,
      text: 'Of course! What specific aspects would you like to discuss?',
      time: '10:32 AM',
      isMentor: true,
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  if (!selectedChat) return null;

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#0f172a',
        width: '100%',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: '#0f172a',
          width: '100%',
        }}
      >
        <IconButton sx={{ display: { md: 'none' }, color: '#fff' }}>
          <ArrowBackIcon />
        </IconButton>
        <Avatar 
          sx={{ 
            width: 40, 
            height: 40,
            bgcolor: '#6366f1',
          }}
        >
          JD
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 500,
              color: '#fff',
            }}
          >
            John Doe
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            Online
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton sx={{ color: '#fff' }}>
            <VideocamIcon />
          </IconButton>
          <IconButton sx={{ color: '#fff' }}>
            <CallIcon />
          </IconButton>
          <IconButton sx={{ color: '#fff' }}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          py: 3,
          width: '100%',
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '2px',
          },
        }}
      >
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMentor={msg.isMentor}
          />
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: 3,
          display: 'flex',
          gap: 1.5,
          alignItems: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: '#0f172a',
          width: '100%',
        }}
      >
        <IconButton sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          <AttachFileIcon />
        </IconButton>
        <IconButton sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          <EmojiEmotionsIcon />
        </IconButton>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '24px',
              backgroundColor: '#1e293b',
              color: '#fff',
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused fieldset': {
                border: 'none',
              },
              '& .MuiOutlinedInput-input': {
                py: 1.5,
                px: 2,
              },
            },
            '& .MuiOutlinedInput-input': {
              '&::placeholder': {
                color: 'rgba(255, 255, 255, 0.6)',
                opacity: 1,
              },
            },
          }}
        />
        <IconButton
          type="submit"
          sx={{
            color: message.trim() ? '#6366f1' : 'rgba(255, 255, 255, 0.3)',
          }}
          disabled={!message.trim()}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatInterface; 