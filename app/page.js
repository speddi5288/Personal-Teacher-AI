'use client'
import { Box, Button, Stack, TextField, Typography, Avatar } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import { useState } from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { deepPurple, teal } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: teal[500],
    },
    secondary: {
      main: deepPurple[500],
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm the AI Personal Learning Assistant, how can I assist you today?`
    }
  ]);

  const [message, setMessage] = useState(``);

  const sendMessage = async () => {
    if (message.trim() === '') return;
    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: `...` }, // Placeholder for AI response
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }])
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let result = '';
      const read = async () => {
        const { done, value } = await reader.read();
        if (done) return result;
        result += decoder.decode(value, { stream: true });
        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1];
          const otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: result
            },
          ];
        });
        return read();
      };

      await read();

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{
          backgroundImage: 'url(/img/background-img.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Stack
          direction="column"
          width="600px"
          height="700px"
          boxShadow={3}
          borderRadius={2}
          bgcolor="white"
          p={3}
          spacing={3}
        >
          <Typography variant="h4" align="center" color="primary">
            AI Learning Assistant
          </Typography>
          <Stack
            direction="column"
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
            px={2}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display='flex'
                justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
                alignItems="center"
                mb={2}
              >
                {message.role === 'assistant' && <Avatar sx={{ bgcolor: teal[500], mr: 2 }}>AI</Avatar>}
                {message.role === 'user' && <Avatar sx={{ bgcolor: deepPurple[500], ml: 2 }}>U</Avatar>}
                <Box
                  bgcolor={
                    message.role === 'assistant'
                      ? 'primary.main'
                      : 'secondary.main'
                  }
                  color="white"
                  borderRadius={2}
                  p={2}
                  boxShadow={1}
                  maxWidth="70%"
                  ml={message.role === 'user' ? 2 : 0}
                  mr={message.role === 'assistant' ? 2 : 0}
                >
                  {message.content}
                </Box>
              </Box>
            ))}
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Type your message..."
              variant="outlined"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button variant="contained" color="primary" onClick={sendMessage} endIcon={<SendIcon />}>
              Send
            </Button>
          </Stack>
        </Stack>
      </Box>
    </ThemeProvider>
  );
}
