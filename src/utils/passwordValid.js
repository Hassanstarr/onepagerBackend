const passwordValid = (password) => {

    if (password.length < 8) {
        return {
            valid: false,
            message: "Password must be at least 8 characters long"
        };
    }

    if (!/[A-Z]/.test(password)) {
        return {
            valid: false,
            message: "Password must contain at least one uppercase character."
        };
    }

    if (!/[a-z]/.test(password)) {
        return {
            valid: false,
            message: "Password must contain at least one lowercase character."
        };
    }

    if (!/[0-9]/.test(password)) {
        return {
            valid: false,
            message: "Password must contain at least one number."
        };
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]/;'`~+=]/.test(password)) {
        return {
            valid: false,
            message: "Password must contain at least one special character."
        };
    }

    return {
        valid: true
    };
};

export default passwordValid;