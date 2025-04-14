import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import StudentDashboard from "./pages/StudentDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StudentLandingPage from "./pages/StudentLandingPage";
import AddGoals from "./pages/AddGoals";
import FindTeammatesPage from "./pages/FindTeammatesPage";
import { useAuth } from "./context/AuthContext";
import FindTeammates from "./pages/FindTeammates";
import OpenTeams from "./pages/OpenTeams";
import Chat from "./pages/Chat";
import MyTeams from "./pages/MyTeams";
import SDGMapping from "./pages/SDGMapping";
import SDGMap from "./pages/mentor/pages/SDGMap"
import MentorProfile from "./pages/mentor/pages/MentorProfile";
import MentorTeams from "./pages/mentor/components/Teams";
import MentorSessions from "./pages/mentor/components/TeamSessions";
import MentorProgress from "./pages/mentor/components/TeamProgress";
import MentorChat from "./pages/mentor/pages/Chat";
import MentorNavbar from "./pages/mentor/components/MentorNavbar";
import { useState, useMemo } from "react";

const MentorLayout = ({ children, mode, setMode }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: 'background.default',
    }}>
      <MentorNavbar mode={mode} setMode={setMode} />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, md: 3 },
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

function App() {
  const { user } = useAuth();
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'dark');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'dark'
            ? {
                primary: {
                  main: '#6366f1',
                  light: '#818cf8',
                  dark: '#4f46e5',
                },
                secondary: {
                  main: '#ec4899',
                  light: '#f472b6',
                  dark: '#db2777',
                },
                background: {
                  default: '#0f172a',
                  paper: '#1e293b',
                },
                text: {
                  primary: '#f8fafc',
                  secondary: '#cbd5e1',
                },
                success: {
                  main: '#10b981',
                  light: '#34d399',
                  dark: '#059669',
                },
                warning: {
                  main: '#f59e0b',
                  light: '#fbbf24',
                  dark: '#d97706',
                },
                error: {
                  main: '#ef4444',
                  light: '#f87171',
                  dark: '#dc2626',
                },
              }
            : {
                primary: {
                  main: '#6366f1',
                  light: '#818cf8',
                  dark: '#4f46e5',
                },
                secondary: {
                  main: '#ec4899',
                  light: '#f472b6',
                  dark: '#db2777',
                },
                background: {
                  default: '#f8fafc',
                  paper: '#ffffff',
                },
                text: {
                  primary: '#1e293b',
                  secondary: '#64748b',
                },
                success: {
                  main: '#10b981',
                  light: '#34d399',
                  dark: '#059669',
                },
                warning: {
                  main: '#f59e0b',
                  light: '#fbbf24',
                  dark: '#d97706',
                },
                error: {
                  main: '#ef4444',
                  light: '#f87171',
                  dark: '#dc2626',
                },
              }),
        },
        typography: {
          fontFamily: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
          ].join(','),
          h1: {
            fontWeight: 800,
            fontSize: '2.5rem',
            letterSpacing: '-0.025em',
          },
          h2: {
            fontWeight: 700,
            fontSize: '2rem',
            letterSpacing: '-0.025em',
          },
          h3: {
            fontWeight: 700,
            fontSize: '1.75rem',
            letterSpacing: '-0.025em',
          },
          h4: {
            fontWeight: 700,
            fontSize: '1.5rem',
            letterSpacing: '-0.025em',
          },
          h5: {
            fontWeight: 700,
            fontSize: '1.25rem',
            letterSpacing: '-0.025em',
          },
          h6: {
            fontWeight: 700,
            fontSize: '1rem',
            letterSpacing: '-0.025em',
          },
          subtitle1: {
            fontWeight: 600,
            fontSize: '1rem',
          },
          subtitle2: {
            fontWeight: 600,
            fontSize: '0.875rem',
          },
          body1: {
            fontSize: '1rem',
            lineHeight: 1.75,
          },
          body2: {
            fontSize: '0.875rem',
            lineHeight: 1.75,
          },
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'dark' ? '#1e293b' : '#ffffff',
                color: mode === 'dark' ? '#f8fafc' : '#1e293b',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                backdropFilter: 'blur(8px)',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: '16px',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                },
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                padding: '8px 16px',
                fontSize: '0.875rem',
              },
              contained: {
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                },
              },
              outlined: {
                borderWidth: '2px',
                '&:hover': {
                  borderWidth: '2px',
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.75rem',
              },
            },
          },
          MuiAvatar: {
            styleOverrides: {
              root: {
                fontWeight: 600,
              },
            },
          },
          MuiLinearProgress: {
            styleOverrides: {
              root: {
                borderRadius: '8px',
                height: '8px',
              },
            },
          },
          MuiListItem: {
            styleOverrides: {
              root: {
                borderRadius: '12px',
                marginBottom: '8px',
                '&:last-child': {
                  marginBottom: 0,
                },
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* 🚀 Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* 🔐 Authentication Page */}
          <Route path="/auth" element={<Auth />} />

          {/* Mentor Routes */}
          <Route 
            path="/mentor-dashboard" 
            element={user ? (
              <MentorLayout mode={mode} setMode={setMode}>
                <MentorDashboard />
              </MentorLayout>
            ) : <Navigate to="/auth" />}
          />
          
          <Route 
            path="/mentor/teams" 
            element={user ? (
              <MentorLayout mode={mode} setMode={setMode}>
                <MentorTeams />
              </MentorLayout>
            ) : <Navigate to="/auth" />}
          />
          
          <Route 
            path="/mentor/sessions" 
            element={user ? (
              <MentorLayout mode={mode} setMode={setMode}>
                <MentorSessions />
              </MentorLayout>
            ) : <Navigate to="/auth" />}
          />
          
          <Route 
            path="/mentor/progress" 
            element={user ? (
              <MentorLayout mode={mode} setMode={setMode}>
                <MentorProgress />
              </MentorLayout>
            ) : <Navigate to="/auth" />}
          />
          
          <Route 
            path="/mentor/sdg" 
            element={user ? (
              <MentorLayout mode={mode} setMode={setMode}>
                <SDGMap />
              </MentorLayout>
            ) : <Navigate to="/auth" />}
          />
          
          <Route 
            path="/mentor/chat" 
            element={user ? (
              <MentorLayout mode={mode} setMode={setMode}>
                <MentorChat />
              </MentorLayout>
            ) : <Navigate to="/auth" />}
          />
          
          <Route 
            path="/mentor/profile" 
            element={user ? (
              <MentorLayout mode={mode} setMode={setMode}>
                <MentorProfile />
              </MentorLayout>
            ) : <Navigate to="/auth" />}
          />

          {/* 🎓 Student Routes */}
          <Route
            path="/student/dashboard"
            element={user ? <StudentLandingPage /> : <Navigate to="/auth" />}
          />
          <Route
            path="/student-dashboard"
            element={user ? <StudentDashboard /> : <Navigate to="/student/dashboard" />}
          />

          {/* 🏛️ Admin Dashboard */}
          <Route
            path="/admin-dashboard"
            element={user ? <AdminDashboard /> : <Navigate to="/auth" />}
          />

          {/* 🎯 Add Goals Page */}
          <Route
            path="/add-goals"
            element={user ? <AddGoals /> : <Navigate to="/student/dashboard" />}
          />

          {/* 👥 Find Teammates Page */}
          <Route
            path="/find-teammates"
            element={user ? <FindTeammatesPage /> : <Navigate to="/student/dashboard" />}
          />

          {/* Other existing routes */}
          <Route path="dashboard" element={<FindTeammates />} />
          <Route path="open-teams" element={<OpenTeams />} />
          <Route path="chats" element={<MentorChat />} />
          <Route path="my-teams" element={<MyTeams />} />
          <Route path="sdg" element={<SDGMapping />} />

          {/* 🚨 Default Redirect to Landing */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;