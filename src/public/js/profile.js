function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    requestAnimationFrame(() => {
        modal.classList.add('active');
        modal.querySelector('.modal-content')?.focus();
    });

    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal(modalId);
        }
    };
    document.addEventListener('keydown', handleEscape);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modalId);
        }
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('active');

    const form = modal.querySelector('form');
    if (form) {
        form.reset();
    }
}

function openEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    if (!modal) return;

    const usernameElement = document.querySelector('h1');
    const emailElement = document.querySelector('.email')?.nextElementSibling;

    const usernameInput = document.getElementById('editUsername');
    const emailInput = document.getElementById('editEmail');

    if (usernameInput && usernameElement) {
        usernameInput.value = usernameElement.textContent.trim();
    }

    if (emailInput && emailElement) {
        emailInput.value = emailElement.textContent.trim();
    }

    openModal('editProfileModal');
}

function closeEditProfileModal() {
    closeModal('editProfileModal');
}

function openChangePasswordModal() {
    openModal('changePasswordModal');
    document.querySelectorAll('.toggle-password').forEach(button => {
        const icon = button.querySelector('i');
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        const input = document.getElementById(button.getAttribute('data-target'));
        if (input) input.type = 'password';
    });
}

function closeChangePasswordModal() {
    closeModal('changePasswordModal');
}

function openEditAvatarModal() {
    openModal('editAvatarModal');
    const currentAvatarSrc = document.getElementById('profileAvatar').src;
    const avatarPreview = document.getElementById('avatarPreview');
    if (avatarPreview) {
        avatarPreview.src = currentAvatarSrc;
    }
    const urlInput = document.getElementById('avatarUrlInput');
    if (urlInput) {
        urlInput.value = '';
        const loadUrlBtn = document.getElementById('loadUrlBtn');
        const submitBtn = document.getElementById('editAvatarForm')?.querySelector('button[type="submit"]');
        if (loadUrlBtn) {
            loadUrlBtn.disabled = true;
            loadUrlBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }
}

function closeEditAvatarModal() {
    closeModal('editAvatarModal');
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    if (password.length < 6) {
        return {
            isValid: false,
            message: 'Mật khẩu phải có ít nhất 6 ký tự'
        };
    }
    return {
        isValid: true,
        message: ''
    };
}

document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.notificationManager === 'undefined') {
        window.notificationManager = new NotificationManager();
    }

    const editProfileBtn = document.getElementById('editProfileBtn');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const avatarInputTrigger = document.querySelector('label[for="avatarInputTrigger"]');
    const editProfileForm = document.getElementById('editProfileForm');
    const changePasswordForm = document.getElementById('changePasswordForm');
    const editAvatarForm = document.getElementById('editAvatarForm');
    const loadUrlBtn = document.getElementById('loadUrlBtn');
    const avatarUrlInput = document.getElementById('avatarUrlInput');
    const avatarPreview = document.getElementById('avatarPreview');

    function handleServerMessages() {
        try {
            if (typeof locals !== 'undefined') {
                if (locals.error) {
                    window.showNotification(locals.error, 'error');
                }
                if (locals.success) {
                    window.showNotification(locals.success, 'success');
                }
            }
        } catch (error) {
            console.debug('No server messages to display or locals not found:', error.message);
        }
    }

    handleServerMessages();

    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            openEditProfileModal();
        });
    }

    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            openChangePasswordModal();
        });
    }

    if (avatarInputTrigger) {
        avatarInputTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            openEditAvatarModal();
        });
    }

    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const submitButton = editProfileForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Đang lưu...';

            const formData = new FormData(editProfileForm);
            const data = Object.fromEntries(formData.entries());

            if (!data.username.trim()) {
                window.showNotification('Vui lòng nhập tên người dùng.', 'error');
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                return;
            }
            if (!data.email.trim()) {
                window.showNotification('Vui lòng nhập email.', 'error');
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                return;
            }
            if (!isValidEmail(data.email)) {
                window.showNotification('Email không đúng định dạng. Vui lòng thử lại.', 'error');
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                return;
            }

            try {
                const response = await axios.post('/auth/profile/update', data);

                if (response.data.success) {
                    window.showNotification('Cập nhật thông tin thành công!', 'success', 2000);
                    setTimeout(() => window.location.reload(), 2000);
                } else {
                    window.showNotification(response.data.message || 'Có lỗi xảy ra khi cập nhật thông tin.', 'error', 4000);
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                window.showNotification(
                    error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật thông tin. Vui lòng thử lại.',
                    'error',
                    4000
                );
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        });
    }

    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const submitButton = changePasswordForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Đang đổi...';

            try {
                const currentPassword = document.getElementById('currentPassword').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmNewPassword = document.getElementById('confirmNewPassword').value;

                if (!currentPassword) {
                    window.showNotification('Vui lòng nhập mật khẩu hiện tại.', 'warning');
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                    return;
                }

                const passwordValidation = validatePassword(newPassword);
                if (!passwordValidation.isValid) {
                    window.showNotification(passwordValidation.message, 'warning');
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                    return;
                }

                if (newPassword !== confirmNewPassword) {
                    window.showNotification('Mật khẩu mới và xác nhận mật khẩu không khớp.', 'error');
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                    return;
                }

                const response = await axios.post('/auth/profile/change-password', {
                    currentPassword,
                    newPassword
                });

                if (response.data.success) {
                    window.showNotification('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', 'success', 3000);
                    event.target.reset();
                    closeChangePasswordModal();
                    setTimeout(() => {
                        window.location.href = '/auth/logout';
                    }, 2000);
                } else {
                    window.showNotification(response.data.message || 'Có lỗi xảy ra khi đổi mật khẩu.', 'error', 4000);
                }
            } catch (error) {
                console.error('Error changing password:', error);
                window.showNotification(
                    error.response?.data?.message || 'Đã xảy ra lỗi khi đổi mật khẩu. Vui lòng thử lại sau.',
                    'error',
                    4000
                );
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        });
    }

    if (editAvatarForm) {
        editAvatarForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const submitButton = editAvatarForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Đang lưu...';

            const imageUrlToSave = avatarUrlInput.value.trim();

            if (!imageUrlToSave) {
                window.showNotification('Vui lòng nhập URL ảnh để cập nhật.', 'warning');
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                return;
            }

            try {
                new URL(imageUrlToSave);
            } catch (error) {
                window.showNotification('URL ảnh không hợp lệ. Vui lòng kiểm tra lại.', 'error');
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                return;
            }

            try {
                const response = await axios.post('/auth/profile/update-avatar', {
                    avatarUrl: imageUrlToSave
                });

                if (response.data.success) {
                    window.showNotification('Ảnh đại diện đã được cập nhật thành công!', 'success', 2000);

                    const profileAvatar = document.getElementById('profileAvatar');
                    if (profileAvatar) {
                        profileAvatar.src = imageUrlToSave;
                    }

                    closeEditAvatarModal();
                } else {
                    window.showNotification(response.data.message || 'Không thể cập nhật ảnh đại diện.', 'error', 4000);
                }
            } catch (error) {
                console.error('Error updating avatar:', error);
                window.showNotification(
                    error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật ảnh đại diện.',
                    'error',
                    4000
                );
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        });

        if (loadUrlBtn && avatarPreview && avatarUrlInput) {
            loadUrlBtn.addEventListener('click', () => {
                const imageUrl = avatarUrlInput.value.trim();

                if (!imageUrl) {
                    window.showNotification('Vui lòng nhập URL ảnh.', 'warning');
                    return;
                }

                try {
                    new URL(imageUrl);
                } catch (error) {
                    window.showNotification('URL không hợp lệ. Vui lòng kiểm tra lại.', 'error');
                    return;
                }

                avatarPreview.style.opacity = '0.5';

                const testImage = new Image();
                testImage.onload = () => {
                    avatarPreview.src = imageUrl;
                    avatarPreview.style.opacity = '1';
                    window.showNotification('Ảnh đã được tải lên thành công.', 'success');
                };
                testImage.onerror = () => {
                    avatarPreview.style.opacity = '1';
                    window.showNotification('Không thể tải ảnh từ URL này. Vui lòng thử URL khác.', 'error');
                };
                testImage.src = imageUrl;
            });

            avatarUrlInput.addEventListener('input', () => {
                const urlBtn = document.getElementById('loadUrlBtn');
                const submitBtn = editAvatarForm.querySelector('button[type="submit"]');
                const isValidUrl = avatarUrlInput.value.trim().length > 0;

                if (urlBtn) {
                    urlBtn.disabled = !isValidUrl;
                    if (!isValidUrl) {
                        urlBtn.classList.add('opacity-50', 'cursor-not-allowed');
                    } else {
                        urlBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                    }
                }
                if (submitBtn) {
                    submitBtn.disabled = !isValidUrl;
                    if (!isValidUrl) {
                        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
                    } else {
                        submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                    }
                }
            });
        }
    }

    document.querySelectorAll('.toggle-password').forEach(button => {
        if (button) {
            button.addEventListener('click', function () {
                const targetId = this.getAttribute('data-target');
                const input = document.getElementById(targetId);
                const icon = this.querySelector('i');

                if (input && icon) {
                    if (input.type === 'password') {
                        input.type = 'text';
                        icon.classList.remove('fa-eye');
                        icon.classList.add('fa-eye-slash');
                    } else {
                        input.type = 'password';
                        icon.classList.remove('fa-eye-slash');
                        icon.classList.add('fa-eye');
                    }
                }
            });
        }
    });
});
