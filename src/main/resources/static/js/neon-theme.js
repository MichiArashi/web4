const NeonTheme = {
    themeMap: {
        'michiCoV': {
            primary: '#FF0040',
            secondary: '#FF3366',
            glow: 'rgba(255, 0, 64, 0.5)',
            gradient: 'linear-gradient(90deg, #CC0033, #FF0040, #FF3366, #FF0040, #CC0033)',
            gradientSize: '200%'
        },
        'arcadeCoS': {
            primary: '#FFFF00',
            secondary: '#FFD700',
            glow: 'rgba(255, 255, 0, 0.5)',
            gradient: 'linear-gradient(90deg, #B8860B, #FFD700, #FFFF00, #FFD700, #B8860B)',
            gradientSize: '200%'
        },
        'sakuraCoC': {
            primary: '#FF69B4',
            secondary: '#FFB6C1',
            glow: 'rgba(255, 105, 180, 0.5)',
            gradient: 'linear-gradient(90deg, #FF1493, #FF69B4, #FFB6C1, #FF69B4, #FF1493)',
            gradientSize: '200%'
        },
        'paulCoJ': {
            primary: '#0066FF',
            secondary: '#0080FF',
            glow: 'rgba(0, 102, 255, 0.5)',
            gradient: 'linear-gradient(90deg, #0033CC, #0066FF, #0080FF, #0066FF, #0033CC)',
            gradientSize: '200%'
        },
        'adamCoA': {
            primary: '#39FF14',
            secondary: '#00FF41',
            glow: 'rgba(57, 255, 20, 0.5)',
            gradient: 'linear-gradient(90deg, #00CC00, #39FF14, #00FF41, #39FF14, #00CC00)',
            gradientSize: '200%'
        },
        'xiaofenCoR': {
            primary: '#FF6600',
            secondary: '#FF8C00',
            glow: 'rgba(255, 102, 0, 0.5)',
            gradient: 'linear-gradient(90deg, #CC5500, #FF6600, #FF8C00, #FF6600, #CC5500)',
            gradientSize: '200%'
        },
        'lizaCoT': {
            primary: '#00FFFF',
            secondary: '#00CED1',
            glow: 'rgba(0, 255, 255, 0.5)',
            gradient: 'linear-gradient(90deg, #0099CC, #00FFFF, #00CED1, #00FFFF, #0099CC)',
            gradientSize: '200%'
        },
        'michi': {
            primary: '#FF0080',
            secondary: '#00FFFF',
            glow: 'rgba(255, 0, 128, 0.5)',
            gradient: 'linear-gradient(90deg, #FF0000, #FF6600, #FFFF00, #00FF00, #00FFFF, #0066FF, #8000FF, #FF00FF, #FF0000)',
            gradientSize: '800%',
            isRainbow: true
        }
    },
    
    defaultTheme: {
        primary: '#00D9FF',
        secondary: '#00FFFF',
        glow: 'rgba(0, 217, 255, 0.5)',
        gradient: null,
        gradientSize: null,
        isRainbow: false
    },
    
    getTheme(username) {
        if (username && this.themeMap[username]) {
            return this.themeMap[username];
        }
        return this.defaultTheme;
    },
    
    applyTheme(username) {
        const theme = this.getTheme(username);
        
        document.documentElement.style.setProperty('--neon-primary', theme.primary);
        document.documentElement.style.setProperty('--neon-secondary', theme.secondary);
        document.documentElement.style.setProperty('--neon-glow', theme.glow);
        
        if (theme.gradient) {
            document.documentElement.style.setProperty('--neon-gradient', theme.gradient);
            document.documentElement.style.setProperty('--neon-gradient-size', theme.gradientSize);
            document.body.classList.add('has-gradient-neon');
        } else {
            document.documentElement.style.setProperty('--neon-gradient', 'none');
            document.documentElement.style.setProperty('--neon-gradient-size', '100%');
            document.body.classList.remove('has-gradient-neon');
        }
        
        if (theme.isRainbow) {
            document.body.classList.add('has-rainbow-neon');
        } else {
            document.body.classList.remove('has-rainbow-neon');
        }
        
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        if (username && this.themeMap[username]) {
            document.body.classList.add(`theme-${username}`);
        }
    }
};

