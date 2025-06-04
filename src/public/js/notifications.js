class NotificationManager {
    constructor() {
        this.container = this.createContainer();
        this.notifications = new Map();
    }

    createContainer() {
        let container = document.getElementById('notifications-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications-container';
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }
        return container;
    }

    show({ message, type = 'info', title = '', duration = 3000 }) {
        const id = Date.now().toString();
        const notification = this.createNotification(type, title, message);

        this.notifications.set(id, notification);
        this.container.appendChild(notification);

        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        if (duration > 0) {
            const progressBar = this.createProgressBar();
            notification.appendChild(progressBar);

            setTimeout(() => {
                const progressBarInner = progressBar.querySelector('.notification-progress-bar');
                if (progressBarInner) {
                    progressBarInner.style.width = '0%';
                    progressBarInner.style.transitionDuration = `${duration}ms`;
                }
            }, 50);

            setTimeout(() => {
                this.dismiss(id);
            }, duration);
        }

        return id;
    }

    createNotification(type, title, message) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icons = {
            success: '<i class="fas fa-check-circle text-green-500"></i>',
            error: '<i class="fas fa-times-circle text-red-500"></i>',
            warning: '<i class="fas fa-exclamation-triangle text-yellow-500"></i>',
            info: '<i class="fas fa-info-circle text-blue-500"></i>'
        };

        notification.innerHTML = `
            <div class="notification-icon">
                ${icons[type] || icons.info}
            </div>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${title}</div>` : ''}
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" aria-label="Close">
                <i class="fas fa-times"></i>
            </button>
        `;

        notification.querySelector('.notification-close').addEventListener('click',
            () => this.dismiss(notification));

        return notification;
    }

    createProgressBar() {
        const progress = document.createElement('div');
        progress.className = 'notification-progress';
        progress.innerHTML = '<div class="notification-progress-bar"></div>';
        return progress;
    }

    dismiss(idOrElement) {
        const notification = typeof idOrElement === 'string'
            ? this.notifications.get(idOrElement)
            : idOrElement;

        if (!notification) return;

        notification.classList.remove('show');

        setTimeout(() => {
            notification.remove();
            if (typeof idOrElement === 'string') {
                this.notifications.delete(idOrElement);
            }
        }, 300);
    }

    dismissAll() {
        this.notifications.forEach((notification, id) => {
            this.dismiss(id);
        });
    }
}

window.notificationManager = new NotificationManager();

window.showNotification = (message, type = 'info', duration = 3000) => {
    window.notificationManager.show({ message, type, duration });
};

document.addEventListener('DOMContentLoaded', () => {
    const existingNotifications = document.querySelectorAll('.notification-item');
    existingNotifications.forEach(notification => {
        setTimeout(() => {
            if (notification && notification.parentElement) {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            }
        }, 1000);
    });
});
