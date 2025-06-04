const colors = {
    primary: {
        light: '#ef4444',
        hover: '#dc2626',
        dark: '#b91c1c'
    },
    secondary: {
        light: '#f1f5f9',
        hover: '#e2e8f0',
        dark: '#475569'
    },
    accent: {
        success: '#22c55e',
        warning: '#f59e0b',
        info: '#3b82f6'
    },
    text: {
        primary: '#0f172a',
        secondary: '#475569',
        light: '#94a3b8'
    },
    background: {
        light: '#f8fafc',
        dark: '#1e293b',
        overlay: '#0f172a80'
    }
};

const defaultSettings = {
    theme: 'light',
    fontSize: 100,
    background: colors.background.light,
    language: 'vi'
};

let currentSettings = {
    theme: localStorage.getItem('theme') || defaultSettings.theme,
    fontSize: parseInt(localStorage.getItem('fontSize')) || defaultSettings.fontSize,
    background: localStorage.getItem('background') || defaultSettings.background,
    language: localStorage.getItem('language') || defaultSettings.language
};

function updateSettingsUI() {
    const themeButtons = document.querySelectorAll('.theme-btn');
    const fontSizeDisplay = document.getElementById('fontSizeDisplay');
    const backgroundButtons = document.querySelectorAll('[onclick^="updateBackground"]');
    const languageSelect = document.getElementById('languageSelect');

    themeButtons.forEach(button => {
        if (button.dataset.theme === currentSettings.theme) {
            button.classList.add('bg-blue-600', 'text-white');
            button.classList.remove('bg-gray-200', 'text-gray-700');
        } else {
            button.classList.remove('bg-blue-600', 'text-white');
            button.classList.add('bg-gray-200', 'text-gray-700');
        }
    });

    if (fontSizeDisplay) {
        fontSizeDisplay.textContent = currentSettings.fontSize + '%';
    }

    backgroundButtons.forEach(button => {
        if (button.dataset.background === currentSettings.background) {
            button.classList.add('ring-2', 'ring-offset-2', 'ring-blue-600');
        } else {
            button.classList.remove('ring-2', 'ring-offset-2', 'ring-blue-600');
        }
    });

    if (languageSelect) {
        languageSelect.value = currentSettings.language;
    }
}

function applySettings() {
    if (currentSettings.theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.style.backgroundColor = colors.background.dark;
        document.body.style.color = colors.text.light;
    } else {
        document.documentElement.classList.remove('dark');
        document.body.style.backgroundColor = currentSettings.background;
        document.body.style.color = colors.text.primary;
    }

    document.documentElement.style.fontSize = `${currentSettings.fontSize}%`;

    localStorage.setItem('theme', currentSettings.theme);
    localStorage.setItem('fontSize', currentSettings.fontSize);
    localStorage.setItem('background', currentSettings.background);
    localStorage.setItem('language', currentSettings.language);

    updateSettingsUI();
}

window.updateTheme = (theme) => {
    currentSettings.theme = theme;
    applySettings();
};

window.updateFontSize = (change) => {
    let newSize = currentSettings.fontSize + change;
    if (newSize >= 80 && newSize <= 120) {
        currentSettings.fontSize = newSize;
        applySettings();
    }
};

window.updateBackground = (color) => {
    currentSettings.background = color;
    applySettings();
};

window.updateLanguage = (language) => {
    currentSettings.language = language;
    applySettings();
    console.log('Ngôn ngữ được đặt thành:', language);
};

window.resetSettingsToDefault = () => {
    currentSettings = { ...defaultSettings };
    applySettings();
    showNotification('Cài đặt đã được đặt lại về mặc định!', 'info');
};

window.showSettingsModal = () => {
    const settingsModalContainer = document.getElementById('settingsModalContainer');
    if (settingsModalContainer) {
        settingsModalContainer.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        updateSettingsUI();
    }
};

window.closeSettingsModal = () => {
    const settingsModalContainer = document.getElementById('settingsModalContainer');
    if (settingsModalContainer) {
        settingsModalContainer.classList.add('hidden');
        document.body.style.overflow = '';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    applySettings();

    document.addEventListener('keydown', (event) => {
        const settingsModalContainer = document.getElementById('settingsModalContainer');
        if (event.key === 'Escape' && settingsModalContainer && !settingsModalContainer.classList.contains('hidden')) {
            closeSettingsModal();
        }
    });

    const settingsModalContainer = document.getElementById('settingsModalContainer');
    if (settingsModalContainer) {
        settingsModalContainer.addEventListener('click', (event) => {
            if (event.target === settingsModalContainer) {
                closeSettingsModal();
            }
        });
    }

    const signInButton = document.getElementById('signIn');
    const signUpButton = document.getElementById('signUp');
    const container = document.querySelector('.container');

    if (signInButton && signUpButton && container) {
        signUpButton.addEventListener('click', () => {
            container.classList.add("right-panel-active");
        });

        signInButton.addEventListener('click', () => {
            container.classList.remove("right-panel-active");
        });
    }

    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const closeForgotPasswordModalButton = document.getElementById('closeForgotPasswordModal');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const forgotPasswordEmailInput = document.getElementById('forgotPasswordEmail');

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (forgotPasswordModal) forgotPasswordModal.classList.remove('hidden');
        });
    }

    if (closeForgotPasswordModalButton) {
        closeForgotPasswordModalButton.addEventListener('click', () => {
            if (forgotPasswordModal) forgotPasswordModal.classList.add('hidden');
        });
    }

    if (forgotPasswordModal) {
        forgotPasswordModal.addEventListener('click', (e) => {
            if (e.target === forgotPasswordModal) {
                forgotPasswordModal.classList.add('hidden');
            }
        });
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = forgotPasswordEmailInput.value;

            if (!email) {
                showNotification('Vui lòng nhập địa chỉ email của bạn.', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showNotification('Địa chỉ email không hợp lệ.', 'error');
                return;
            }

            try {
                const response = await fetch('/auth/forgot-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email
                    })
                });

                const clonedResponse = response.clone();
                let result;
                try {
                    result = await response.json();
                } catch (jsonError) {
                    const rawResponseText = await clonedResponse.text();
                    console.error('Không thể phân tích phản hồi JSON:', jsonError);
                    console.error('Phản hồi thô từ máy chủ (không phải JSON):', rawResponseText);
                    showNotification('Đã xảy ra lỗi không mong muốn. Vui lòng kiểm tra lại email hoặc thử lại sau.', 'error');
                    return;
                }

                if (result.success) {
                    showNotification(result.message, 'success');
                    if (forgotPasswordModal) forgotPasswordModal.classList.add('hidden');
                    forgotPasswordEmailInput.value = '';
                } else {
                    showNotification(result.message, 'error');
                }
            } catch (error) {
                console.error('Lỗi:', error);
                showNotification('Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại sau.', 'error');
            }
        });
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        return emailRegex.test(email);
    }
});
