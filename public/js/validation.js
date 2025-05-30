// Form validation functions
const validateForm = {
    // Email validation
    email: function(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const errorElement = document.getElementById('emailError');
        
        if (!input.value.trim()) {
            this.showError(input, errorElement, 'Email is required');
            return false;
        } else if (!emailRegex.test(input.value)) {
            this.showError(input, errorElement, 'Please enter a valid email address');
            return false;
        } else {
            this.showSuccess(input, errorElement);
            return true;
        }
    },

    // Password validation
    password: function(input) {
        const errorElement = document.getElementById('passwordError');
        
        if (!input.value.trim()) {
            this.showError(input, errorElement, 'Password is required');
            return false;
        } else if (input.value.length < 6) {
            this.showError(input, errorElement, 'Password must be at least 6 characters long');
            return false;
        } else {
            this.showSuccess(input, errorElement);
            return true;
        }
    },

    // Show error message and highlight input
    showError: function(input, errorElement, message) {
        input.classList.add('border-red-500', 'focus:ring-red-500');
        input.classList.remove('border-gray-300', 'focus:ring-indigo-500');
        errorElement.textContent = message;
        errorElement.classList.add('text-red-500');
    },

    // Show success state
    showSuccess: function(input, errorElement) {
        input.classList.remove('border-red-500', 'focus:ring-red-500');
        input.classList.add('border-gray-300', 'focus:ring-indigo-500');
        errorElement.textContent = '';
    },

    // Show login error message and clear fields
    showLoginError: function() {
        const loginError = document.getElementById('loginError');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        // Show error message
        loginError.classList.remove('hidden');
        
        // Clear input fields
        emailInput.value = '';
        passwordInput.value = '';
        
        // Reset input styles
        emailInput.classList.remove('border-red-500', 'focus:ring-red-500');
        emailInput.classList.add('border-gray-300', 'focus:ring-indigo-500');
        passwordInput.classList.remove('border-red-500', 'focus:ring-red-500');
        passwordInput.classList.add('border-gray-300', 'focus:ring-indigo-500');
        
        // Clear error messages
        document.getElementById('emailError').textContent = '';
        document.getElementById('passwordError').textContent = '';
        
        // Focus on email field
        emailInput.focus();
        
        // Scroll to top of form
        loginError.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    // Hide login error message
    hideLoginError: function() {
        const loginError = document.getElementById('loginError');
        loginError.classList.add('hidden');
    },

    // Validate entire form
    validateAll: function(event) {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        const isEmailValid = this.email(emailInput);
        const isPasswordValid = this.password(passwordInput);
        
        if (!isEmailValid || !isPasswordValid) {
            event.preventDefault();
            return false;
        }
        
        return true;
    }
};

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginForm = document.getElementById('loginForm');

    // Real-time email validation
    emailInput.addEventListener('input', function() {
        validateForm.email(this);
    });

    // Real-time password validation
    passwordInput.addEventListener('input', function() {
        validateForm.password(this);
    });

    // Form submission validation
    loginForm.addEventListener('submit', function(event) {
        validateForm.validateAll(event);
    });
}); 