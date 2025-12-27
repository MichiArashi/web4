const LoginPage = {
    data() {
        return {
            username: '',
            password: '',
            error: '',
            isRegistering: false
        };
    },
    methods: {
        validateUsername(username) {
            if (username.length > 14) {
                return 'Имя пользователя не должно превышать 14 символов';
            }
            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                return 'Имя пользователя может содержать только буквы, цифры и нижнее подчеркивание';
            }
            return null;
        },
        async handleSubmit() {
            this.error = '';
            
            if (!this.username || !this.password) {
                this.error = 'Заполните все поля';
                return;
            }
            
            if (this.isRegistering) {
                const usernameError = this.validateUsername(this.username);
                if (usernameError) {
                    this.error = usernameError;
                    return;
                }
            }

            try {
                let response;
                if (this.isRegistering) {
                    response = await apiService.register(this.username, this.password);
                } else {
                    response = await apiService.login(this.username, this.password);
                }
                this.$emit('login', response.username);
            } catch (error) {
                this.error = error.message || 'Ошибка авторизации';
            }
        },
        toggleMode() {
            this.isRegistering = !this.isRegistering;
            this.error = '';
        }
    },
    template: `
        <div class="login-container">
            <div class="login-card">
                <h1>Лабораторная работа №4</h1>
                <h2>Проверка попадания точки в область</h2>
                
                <div class="student-info">
                    <p><strong>ФИО:</strong> Ожеховский Александр Сергеевич</p>
                    <p><strong>Группа:</strong> P3231</p>
                    <p><strong>Вариант:</strong> 4466</p>
                </div>

                <form @submit.prevent="handleSubmit" class="login-form">
                    <div class="form-group">
                        <label for="username">Логин:</label>
                        <input 
                            type="text" 
                            id="username" 
                            v-model="username" 
                            @input="if (isRegistering) { username = username.replace(/[^a-zA-Z0-9_]/g, ''); if (username.length > 14) username = username.substring(0, 14); }"
                            :maxlength="isRegistering ? 14 : undefined"
                            required
                            class="form-input"
                            :placeholder="isRegistering ? 'Только буквы, цифры, _ (макс. 14)' : ''"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Пароль:</label>
                        <input 
                            type="password" 
                            id="password" 
                            v-model="password" 
                            required
                            class="form-input"
                        >
                    </div>
                    
                    <div v-if="error" class="error-message">{{ error }}</div>
                    
                    <button type="submit" class="btn-primary">
                        {{ isRegistering ? 'Зарегистрироваться' : 'Войти' }}
                    </button>
                    
                    <button type="button" @click="toggleMode" class="btn-link">
                        {{ isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться' }}
                    </button>
                </form>
            </div>
        </div>
    `
};

