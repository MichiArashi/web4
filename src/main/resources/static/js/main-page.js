const MainPage = {
    props: ['username'],
        data() {
        return {
            x: '',
            y: '',
            r: '',
            errors: {},
            results: [],
            currentPage: 0,
            pageSize: 10,
            totalPages: 0,
            totalElements: 0,
            plotDiv: null,
            currentR: 1.0,
            isProcessingClick: false,
            clickHandler: null
        };
    },
    mounted() {
        if (this.username) {
            NeonTheme.applyTheme(this.username);
        }
        this.loadResults();
        this.initPlot();
    },
    methods: {
        handleXInput(event) {
            let value = event.target.value;
            value = value.replace(/[^0-9.\-]/g, '');
            if (value.indexOf('-') > 0) {
                value = value.replace(/-/g, '');
            }
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
            this.x = value;
        },
        handleYInput(event) {
            let value = event.target.value;
            value = value.replace(/[^0-9.\-]/g, '');
            if (value.indexOf('-') > 0) {
                value = value.replace(/-/g, '');
            }
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
            this.y = value;
        },
        validateInput() {
            this.errors = {};
            
            const xNum = Number(this.x);
            if (this.x === '' || isNaN(xNum)) {
                this.errors.x = 'X должен быть числом';
            } else if (xNum < -3 || xNum > 3) {
                this.errors.x = 'X должен быть числом от -3 до 3';
            }
            
            const yNum = Number(this.y);
            if (this.y === '' || isNaN(yNum)) {
                this.errors.y = 'Y должен быть числом';
            } else if (yNum < -3 || yNum > 3) {
                this.errors.y = 'Y должен быть числом от -3 до 3';
            }
            
            const rNum = Number(this.r);
            if (this.r === '' || isNaN(rNum)) {
                this.errors.r = 'R должен быть числом';
            } else if (rNum <= 0) {
                this.errors.r = 'R должен быть больше 0';
            } else if (rNum > 3) {
                this.errors.r = 'R должен быть не больше 3';
            }
            
            return Object.keys(this.errors).length === 0;
        },
        
        async checkPoint() {
            if (!this.validateInput()) {
                return;
            }

            try {
                const x = Number(this.x);
                const y = Number(this.y);
                const r = Number(this.r);
                
                const result = await apiService.checkPoint(x, y, r);
                
                this.x = '';
                this.y = '';
                this.loadResults();
                this.updatePlot();
                this.showNotification('Точка проверена и сохранена', 'success');
            } catch (error) {
                this.showNotification('Ошибка при проверке точки: ' + error.message, 'error');
            }
        },
        
        showNotification(message, type = 'info') {

            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            

            let icon = 'ℹ';
            if (type === 'success') icon = '✓';
            if (type === 'error') icon = '✕';
            
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 14px; color: #FFD700;">${icon}</span>
                    <span style="font-size: 12px;">${message}</span>
                </div>
            `;
            
            Object.assign(notification.style, {
                position: 'fixed',
                top: '15px',
                right: '15px',
                padding: '8px 12px',
                borderRadius: '4px',
                color: '#E8E8E8',
                fontWeight: 'normal',
                fontSize: '12px',
                zIndex: '10000',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.6), inset 0 0 1px rgba(255, 215, 0, 0.3)',
                animation: 'slideIn 0.3s ease-out',
                backgroundColor: 'rgba(20, 20, 25, 0.95)',
                border: '1px solid rgba(255, 215, 0, 0.4)',
                backdropFilter: 'blur(4px)',
                minWidth: '200px',
                maxWidth: '300px'
            });
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        },
        
        async loadResults() {
            try {
                const response = await apiService.getResults(this.currentPage, this.pageSize);
                this.results = response.content;
                this.totalPages = response.totalPages;
                this.totalElements = response.totalElements;
                this.updatePlot();
            } catch (error) {
                console.error('Error loading results:', error);
            }
        },
        
        changePage(page) {
            this.currentPage = page;
            this.loadResults();
        },
        
        initPlot() {
            this.plotDiv = document.getElementById('plot');
            this.updatePlot();
        },
        
        updatePlot() {
            if (!this.plotDiv) return;
            

            const r = Number(this.r) || 1.0;
            this.currentR = r;
            

            const data = this.getPathData(r);
            

            const hitPoints = this.results.filter(r => Math.abs(r.r - this.currentR) < 0.001 && r.hit)
                .map(r => ({ x: r.x, y: r.y }));
            const missPoints = this.results.filter(r => Math.abs(r.r - this.currentR) < 0.001 && !r.hit)
                .map(r => ({ x: r.x, y: r.y }));
            
            if (hitPoints.length > 0) {
                data.push({
                    x: hitPoints.map(p => p.x),
                    y: hitPoints.map(p => p.y),
                    mode: 'markers',
                    marker: { 
                        color: '#00FF80', 
                        size: 8,
                        line: { color: '#00D9FF', width: 1 }
                    },
                    name: 'Попадание',
                    showlegend: false
                });
            }
            
            if (missPoints.length > 0) {
                data.push({
                    x: missPoints.map(p => p.x),
                    y: missPoints.map(p => p.y),
                    mode: 'markers',
                    marker: { 
                        color: '#FF0080', 
                        size: 8,
                        line: { color: '#FF0080', width: 1 }
                    },
                    name: 'Промах',
                    showlegend: false
                });
            }
            
            const neonPrimary = getComputedStyle(document.documentElement).getPropertyValue('--neon-primary').trim() || '#00D9FF';
            const neonGlow = getComputedStyle(document.documentElement).getPropertyValue('--neon-glow').trim() || 'rgba(0, 217, 255, 0.5)';
            const gridColor = neonGlow.replace('0.5', '0.2');
            
            const layout = {
                title: {
                    text: 'График области',
                    font: { color: neonPrimary, size: 16 }
                },
                xaxis: { 
                    title: { text: 'X', font: { color: neonPrimary } },
                    range: [-4, 4],
                    gridcolor: gridColor,
                    linecolor: neonPrimary,
                    tickfont: { color: neonPrimary },
                    zerolinecolor: neonPrimary,
                    zerolinewidth: 2
                },
                yaxis: { 
                    title: { text: 'Y', font: { color: neonPrimary } },
                    range: [-4, 4], 
                    scaleanchor: 'x', 
                    scaleratio: 1,
                    gridcolor: gridColor,
                    linecolor: neonPrimary,
                    tickfont: { color: neonPrimary },
                    zerolinecolor: neonPrimary,
                    zerolinewidth: 2
                },
                showlegend: false,
                margin: { l: 50, r: 20, t: 50, b: 50 },
                plot_bgcolor: 'rgba(0, 0, 0, 0.5)',
                paper_bgcolor: 'rgba(0, 0, 0, 0.3)'
            };
            
            const plotElement = document.getElementById('plot');
            const self = this;
            
            Plotly.newPlot('plot', data, layout, { responsive: true })
                .then(() => {
                    if (self.clickHandler) {
                        plotElement.removeEventListener('click', self.clickHandler);
                        plotElement.removeAllListeners('plotly_click');
                    }
                    
                    self.clickHandler = async (evt) => {
                        if (self.isProcessingClick) {
                            return;
                        }
                        
                        if (!evt) return;
                        
                        const gd = plotElement;
                        const fullLayout = gd._fullLayout || layout;
                        const xAxis = fullLayout.xaxis || { range: [-4, 4] };
                        const yAxis = fullLayout.yaxis || { range: [-4, 4] };
                        
                        const rect = gd.getBoundingClientRect();
                        const xRange = xAxis.range || [-4, 4];
                        const yRange = yAxis.range || [-4, 4];
                        
                        const marginL = fullLayout.margin?.l || 50;
                        const marginR = fullLayout.margin?.r || 20;
                        const marginT = fullLayout.margin?.t || 50;
                        const marginB = fullLayout.margin?.b || 50;
                        
                        const plotWidth = rect.width - marginL - marginR;
                        const plotHeight = rect.height - marginT - marginB;
                        const plotLeft = rect.left + marginL;
                        const plotTop = rect.top + marginT;
                        
                        const mouseX = evt.clientX - plotLeft;
                        const mouseY = evt.clientY - plotTop;
                        
                        if (mouseX < 0 || mouseX > plotWidth || mouseY < 0 || mouseY > plotHeight) {
                            return;
                        }
                        
                        const x = xRange[0] + (mouseX / plotWidth) * (xRange[1] - xRange[0]);
                        const y = yRange[1] - (mouseY / plotHeight) * (yRange[1] - yRange[0]);
                        
                        const r = Number(self.r) || 1.0;
                        
                        if (r <= 0 || r > 3) {
                            self.showNotification('R должен быть больше 0 и не больше 3', 'error');
                            return;
                        }
                        
                        if (!isNaN(x) && !isNaN(y) && !isNaN(r)) {
                            self.isProcessingClick = true;
                            
                            try {
                                const result = await apiService.checkPointFromGraph(x, y, r);
                                await self.loadResults();
                                self.updatePlot();
                                self.showNotification('Точка проверена и сохранена', 'success');
                            } catch (error) {
                                self.showNotification('Ошибка при проверке точки: ' + error.message, 'error');
                            } finally {
                                self.isProcessingClick = false;
                            }
                        }
                    };
                    
                    plotElement.on('plotly_click', (clickData) => {
                        if (clickData && clickData.event) {
                            self.clickHandler(clickData.event);
                        }
                    });
                    
                    plotElement.addEventListener('click', self.clickHandler);
                });
        },
        
        getPathData(r) {
            const trianglePoints = 50;
            const triangle_x_line = [];
            const triangle_y_line = [];
            for (let i = 0; i <= trianglePoints; i++) {
                const x = r * i / trianglePoints;
                const y = -0.5 * x + r/2;
                triangle_x_line.push(x);
                triangle_y_line.push(y);
            }
            const neonPrimary = getComputedStyle(document.documentElement).getPropertyValue('--neon-primary').trim() || '#00D9FF';
            const neonGlow = getComputedStyle(document.documentElement).getPropertyValue('--neon-glow').trim() || 'rgba(0, 217, 255, 0.5)';
            const tronColor = neonGlow.replace('0.5', '0.4');
            const tronLineColor = neonPrimary;
            
            const triangle = {
                x: [0, r, ...triangle_x_line, 0],
                y: [0, 0, ...triangle_y_line, r/2, 0],
                fill: 'toself',
                fillcolor: tronColor,
                line: { color: tronLineColor, width: 2 },
                type: 'scatter',
                mode: 'lines',
                name: 'Треугольник'
            };
            
            const rect = {
                x: [-r/2, 0, 0, -r/2, -r/2],
                y: [0, 0, r, r, 0],
                fill: 'toself',
                fillcolor: tronColor,
                line: { color: tronLineColor, width: 2 },
                type: 'scatter',
                mode: 'lines',
                name: 'Прямоугольник'
            };
            
            const theta = Array.from({ length: 100 }, (_, i) => (Math.PI / 2) * (i / 99) + Math.PI);
            const circle_x = theta.map(angle => (r/2) * Math.cos(angle));
            const circle_y = theta.map(angle => (r/2) * Math.sin(angle));
            const circle = {
                x: [0, ...circle_x, 0],
                y: [0, ...circle_y, 0],
                fill: 'toself',
                fillcolor: tronColor,
                line: { color: tronLineColor, width: 2 },
                type: 'scatter',
                mode: 'lines',
                name: 'Четверть круга'
            };
            
            return [triangle, rect, circle];
        },
        
        logout() {
            this.$emit('logout');
        },
        
        formatDateTime(dateTime) {
            const date = new Date(dateTime);
            return date.toLocaleString('ru-RU');
        },
        
        async clearUserPoints() {
            const confirmed = await this.showConfirmNotification(
                'Вы уверены, что хотите удалить все свои точки?',
                'Подтвердите удаление'
            );
            
            if (!confirmed) {
                return;
            }
            
            try {
                await apiService.clearUserPoints();
                this.currentPage = 0;
                this.loadResults();
                this.updatePlot();
                this.showNotification('Ваши точки успешно удалены', 'success');
            } catch (error) {
                this.showNotification('Ошибка при удалении точек: ' + error.message, 'error');
            }
        },
        
        showConfirmNotification(message, title = 'Подтвердите действие') {
            return new Promise((resolve) => {

                const removeElements = () => {
                    if (overlay && overlay.parentNode) {
                        document.body.removeChild(overlay);
                    }
                    if (notification && notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                };
                
                const notification = document.createElement('div');
                notification.className = 'notification notification-confirm';
                
                notification.innerHTML = `
                    <div style="font-weight: bold; margin-bottom: 10px;">${title}</div>
                    <div style="margin-bottom: 15px;">${message}</div>
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button class="btn-confirm-ok" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">OK</button>
                        <button class="btn-confirm-cancel" style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Отмена</button>
                    </div>
                `;
                
                Object.assign(notification.style, {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    padding: '20px',
                    borderRadius: '10px',
                    color: 'white',
                    fontWeight: 'normal',
                    zIndex: '10001',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                    backgroundColor: '#333',
                    minWidth: '300px',
                    maxWidth: '400px'
                });
                
                const overlay = document.createElement('div');
                overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000;';
                
                const okBtn = notification.querySelector('.btn-confirm-ok');
                const cancelBtn = notification.querySelector('.btn-confirm-cancel');
                
                okBtn.onclick = () => {
                    removeElements();
                    resolve(true);
                };
                
                cancelBtn.onclick = () => {
                    removeElements();
                    resolve(false);
                };
                
                overlay.onclick = () => {
                    removeElements();
                    resolve(false);
                };
                
                notification.onclick = (e) => {
                    e.stopPropagation();
                };
                
                document.body.appendChild(overlay);
                document.body.appendChild(notification);
            });
        }
    },
    watch: {
        r() {
            this.updatePlot();
        }
    },
    template: `
        <div class="main-container">
            <header class="main-header">
                <h1>Ожеховский Александр Сергеевич</h1>
                <div class="user-info">
                    <span>Пользователь: {{ username }}</span>
                    <button @click="logout" class="btn-logout">Выйти</button>
                </div>
            </header>
            
            <div class="main-content">
                <div class="form-section">
                    <h2>Ввод координат</h2>
                    <form @submit.prevent="checkPoint" class="point-form">
                        <div class="form-group">
                            <label>X (-3 до 3):</label>
                            <input 
                                type="text" 
                                v-model="x" 
                                @input="handleXInput"
                                class="form-input"
                                :class="{ 'error': errors.x }"
                                placeholder="Только числа"
                            >
                            <span v-if="errors.x" class="error-text">{{ errors.x }}</span>
                        </div>
                        
                        <div class="form-group">
                            <label>Y (-3 до 3):</label>
                            <input 
                                type="text" 
                                v-model="y" 
                                @input="handleYInput"
                                class="form-input"
                                :class="{ 'error': errors.y }"
                                placeholder="Только числа"
                            >
                            <span v-if="errors.y" class="error-text">{{ errors.y }}</span>
                        </div>
                        
                        <div class="form-group">
                            <label>R (-3 до 3):</label>
                            <input 
                                type="text" 
                                v-model="r" 
                                @input="r = r.replace(/[^0-9.]/g, '')"
                                class="form-input"
                                :class="{ 'error': errors.r }"
                                placeholder="Только числа, больше 0"
                            >
                            <span v-if="errors.r" class="error-text">{{ errors.r }}</span>
                        </div>
                        
                        <button type="submit" class="btn-primary">Проверить точку</button>
                    </form>
                </div>
                
                <div class="plot-section">
                    <div id="plot"></div>
                </div>
            </div>
            
            <div class="results-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0;">Результаты проверок</h2>
                    <button @click="clearUserPoints" class="btn-clear">Очистить мои точки</button>
                </div>
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>X</th>
                            <th>Y</th>
                            <th>R</th>
                            <th>Попадание</th>
                            <th>Время отправки</th>
                            <th>Время работы (мс)</th>
                            <th>Пользователь</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="result in results" :key="result.id">
                            <td>{{ result.x }}</td>
                            <td>{{ result.y }}</td>
                            <td>{{ result.r }}</td>
                            <td>
                                <span :class="result.hit ? 'hit' : 'miss'">
                                    {{ result.hit ? '✅ Попадание' : '❌ Промах' }}
                                </span>
                            </td>
                            <td>{{ formatDateTime(result.timestamp) }}</td>
                            <td>{{ result.executionTime }}</td>
                            <td>{{ result.username }}</td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="pagination">
                    <button 
                        @click="changePage(currentPage - 1)" 
                        :disabled="currentPage === 0"
                        class="btn-page"
                    >
                        Предыдущая
                    </button>
                    <span>Страница {{ currentPage + 1 }} из {{ totalPages }} (Всего: {{ totalElements }})</span>
                    <button 
                        @click="changePage(currentPage + 1)" 
                        :disabled="currentPage >= totalPages - 1"
                        class="btn-page"
                    >
                        Следующая
                    </button>
                </div>
            </div>
        </div>
    `
};

