const API_BASE_URL = '/api';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async login(username, password) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            if (errorText === 'User not found') {
                throw new Error('Пользователь не найден');
            } else if (errorText === 'Invalid password') {
                throw new Error('Неверный пароль');
            } else {
                throw new Error(errorText || 'Ошибка авторизации');
            }
        }
        
        const data = await response.json();
        this.setToken(data.token);
        return data;
    }

    async register(username, password) {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            if (errorText.includes('already exists') || errorText.includes('уже существует')) {
                throw new Error('Пользователь с таким именем уже существует');
            } else if (errorText.includes('Username can only contain')) {
                throw new Error('Имя пользователя может содержать только буквы, цифры и нижнее подчеркивание');
            } else if (errorText.includes('Username must be at most')) {
                throw new Error('Имя пользователя не должно превышать 14 символов');
            } else {
                throw new Error(errorText || 'Ошибка регистрации');
            }
        }
        
        const data = await response.json();
        this.setToken(data.token);
        return data;
    }

    async checkPoint(x, y, r) {
        const response = await fetch(`${API_BASE_URL}/points/check`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ x, y, r })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            if (errorText.includes('R must be greater than 0')) {
                throw new Error('R должен быть больше 0');
            } else if (errorText.includes('R must be <= 3')) {
                throw new Error('R должен быть не больше 3');
            } else if (errorText.includes('X must be')) {
                throw new Error('X должен быть числом от -3 до 3');
            } else if (errorText.includes('Y must be')) {
                throw new Error('Y должен быть числом от -3 до 3');
            } else {
                throw new Error(errorText || 'Ошибка при проверке точки');
            }
        }
        
        return await response.json();
    }

    async checkPointFromGraph(x, y, r) {
        const response = await fetch(`${API_BASE_URL}/points/check-from-graph`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ x, y, r })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to check point');
        }
        
        return await response.json();
    }

    async getResults(page = 0, size = 10) {
        const response = await fetch(`${API_BASE_URL}/points?page=${page}&size=${size}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to get results');
        }
        
        return await response.json();
    }

    async clearUserPoints() {
        const response = await fetch(`${API_BASE_URL}/points/clear`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to clear points');
        }
        
        return await response.text();
    }

    logout() {
        this.setToken(null);
    }

    isAuthenticated() {
        return !!this.token;
    }
}

const apiService = new ApiService();

