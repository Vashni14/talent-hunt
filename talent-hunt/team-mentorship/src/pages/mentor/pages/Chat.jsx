import React, { useState } from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import ChatList from '../components/ChatList';
import ChatInterface from '../components/ChatInterface';

const Chat = () => {
  const theme = useTheme();
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 64,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        background: '#0A0A0A',
        color: '#fff',
      }}
    >
      <Grid 
        container 
        sx={{ 
          height: '100%',
          width: '100%',
          margin: 0,
          flexWrap: 'nowrap',
        }}
        spacing={0}
      >
        <Grid 
          item 
          sx={{
            width: '320px',
            flexShrink: 0,
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            height: '100%',
            overflow: 'hidden',
            background: '#151515',
            display: { xs: selectedChat ? 'none' : 'block', md: 'block' },
          }}
        >
          <ChatList onSelectChat={setSelectedChat} />
        </Grid>
        <Grid 
          item 
          sx={{
            flex: 1,
            height: '100%',
            display: 'flex',
            background: '#151515',
            overflow: 'hidden',
          }}
        >
          {selectedChat ? (
            <ChatInterface selectedChat={selectedChat} />
          ) : (
            <Box
              sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#151515',
              }}
            >
              <Box
                sx={{
                  textAlign: 'center',
                  maxWidth: '400px',
                  mx: 'auto',
                  p: 4,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    mb: 2,
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  Select a conversation
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  Choose from your existing conversations
                </Typography>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Chat; 