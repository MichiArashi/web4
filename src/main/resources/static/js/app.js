const { createApp } = Vue;

const App = {
    data() {
        return {
            currentView: 'login',
            isAuthenticated: false,
            username: ''
        };
    },
    mounted() {
        NeonTheme.applyTheme('');
        
        if (apiService.isAuthenticated()) {
            this.isAuthenticated = true;
            this.currentView = 'main';
            const savedUsername = localStorage.getItem('username');
            if (savedUsername) {
                this.username = savedUsername;
                NeonTheme.applyTheme(savedUsername);
            }
        } else {
            this.currentView = 'login';
        }
    },
    methods: {
        handleLogin(username) {
            this.username = username;
            this.isAuthenticated = true;
            this.currentView = 'main';
            localStorage.setItem('username', username);
            NeonTheme.applyTheme(username);
        },
        handleLogout() {
            apiService.logout();
            this.isAuthenticated = false;
            this.currentView = 'login';
            this.username = '';
            NeonTheme.applyTheme('');
        }
    },
    template: `
        <div>
            <login-page v-if="currentView === 'login'" @login="handleLogin"></login-page>
            <main-page v-if="currentView === 'main'" :username="username" @logout="handleLogout"></main-page>
        </div>
    `
};

createApp(App)
    .component('login-page', LoginPage)
    .component('main-page', MainPage)
    .mount('#app');

