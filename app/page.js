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
      content: `Hi! I'm your Personal Development Coach, how can I assist you today?`
    }
  ]);

  const [message, setMessage] = useState(``);

  const sendMessage = async () => {
    if (message.trim() === '') return; // Prevent sending empty messages
    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: `` },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }])
      });

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let result = '';
      reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Int8Array(), { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text
            },
          ];
        });
        return reader.read().then(processText);
      });
    } catch (error) {
      console.error('Error sending message:', error); // Log the error
      alert('A server or network error occurred during the request!');
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
            Personal Development AI Coach
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
                mb={2} // Add some bottom margin for spacing between messages
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
                  maxWidth="70%" // Ensure the message box doesn't take full width
                  ml={message.role === 'user' ? 2 : 0} // Add left margin for user messages
                  mr={message.role === 'assistant' ? 2 : 0} // Add right margin for assistant messages
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
              onKeyDown={handleKeyDown} // Add the event listener here
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
