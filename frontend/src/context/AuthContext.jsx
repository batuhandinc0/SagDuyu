import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Axios defaults set
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Check existing token on mount
    useEffect(() => {
        const checkAuth = async () => {
            const savedToken = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');
            
            if (savedToken) {
                try {
                    setToken(savedToken);
                    
                    // Verify token with backend
                    const response = await axios.get('http://localhost:5000/api/auth/me', {
                        headers: {
                            Authorization: `Bearer ${savedToken}`
                        }
                    });
                    
                    if (response.data.success) {
                        const userData = response.data.data;
                        setUser(userData);
                        localStorage.setItem('user', JSON.stringify(userData));
                    } else {
                        // Invalid token, clear storage
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setToken(null);
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Token verification failed:', error);
                    // Don't clear localStorage on first load if backend is not available
                    if (savedUser && savedToken) {
                        try {
                            setUser(JSON.parse(savedUser));
                        } catch (e) {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            setToken(null);
                            setUser(null);
                        }
                    }
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password
            });

            if (response.data.success) {
                const { token, user: userData } = response.data.data;
                
                // Store in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                
                // Set axios default header
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                // Update state
                setToken(token);
                setUser(userData);
                
                console.log('Login successful, user data:', userData);
                return { success: true, user: userData };
            } else {
                throw new Error(response.data.message || 'Giriş başarısız');
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Giriş yapılırken hata oluştu';
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:5000/api/auth/register', userData);

            if (response.data.success) {
                return { success: true, message: 'Kayıt başarılı!' };
            } else {
                throw new Error(response.data.message || 'Kayıt başarısız');
            }
        } catch (error) {
            console.error('Register error:', error);
            throw new Error(error.response?.data?.message || 'Kayıt olurken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Clear axios header
        delete axios.defaults.headers.common['Authorization'];
        
        // Clear state
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            register, 
            logout, 
            loading,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
