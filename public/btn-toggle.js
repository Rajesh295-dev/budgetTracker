

document.addEventListener("DOMContentLoaded", function () {
    const closeButton = document.querySelector('.close-btn');
    const loginButton = document.querySelector('.login-btn');

    const authWrapper = document.querySelector('.auth-wrapper');
    const loginForm = document.querySelector('.login-form');

    closeButton.addEventListener('click', function () {
        authWrapper.style.display = 'none';
    });

    const registerBtn = document.querySelector('.register-btn');
    const loginBtn = document.querySelector('.login-btn');
    const registerForm = document.querySelector('.register-form');
    loginBtn.addEventListener('click', function () {
        authWrapper.style.display = 'flex';
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';

    });

    registerBtn.addEventListener('click', function () {
        authWrapper.style.display = 'flex';
        registerForm.style.display = 'flex';
        loginForm.style.display = 'none';
    });
});

