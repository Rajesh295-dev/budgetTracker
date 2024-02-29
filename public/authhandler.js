// Register handler function
function registerUser(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    // Get form inputs
    const username = document.getElementById("username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const retypePassword = document.getElementById("retype-password").value;

    // Validate passwords match
    if (password !== retypePassword) {
        alert("Passwords do not match");
        return;
    }

    // Prepare data to send in the request
    const userData = {
        username,
        email,
        password
    };


    // Send a POST request to your register endpoint
    fetch('/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Registration failed');
            }
            alert('Registration successful');
            // Optionally, redirect the user to a login page or dashboard
            // Close the register form
            document.querySelector('.register-form').style.display = 'none';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Registration failed');
        });
}


// Function to store user data in sessionStorage
function storeUserData(userData) {
    sessionStorage.setItem('userData', JSON.stringify(userData));

}

// Function to retrieve user data from sessionStorage
function getUserData() {
    const userDataString = sessionStorage.getItem('userData');
    return userDataString ? JSON.parse(userDataString) : null;

}

// Function to clear user data from sessionStorage
function clearUserData() {
    sessionStorage.removeItem('userData');
}


function updateUsername() {
    const userData = getUserData();
    const userNameSpan = document.querySelector('.userName');

    if (userData && userData.username) {
        // Set the text content of the element to include the username with additional text
        userNameSpan.textContent = 'Welcome, ' + userData.username + '!'; // Additional text before and after the username
    } else {
        // If userData doesn't contain the username property or is null, display a default message
        userNameSpan.textContent = 'Welcome, Guest!!';
    }

}



// Check if user is logged in on page load
window.addEventListener('load', () => {
    const userData = getUserData();
    if (userData) {
        updateUsername();
        // console.log('User is logged in:', userData);
        document.querySelector('.login-btn').style.display = 'none';
        document.querySelector('.logout-btn').style.display = 'flex';

        // Retrieve user data from sessionStorage
        const userDataString = sessionStorage.getItem('userData');
        const userData = userDataString ? JSON.parse(userDataString) : null;

    } else {
        console.log('User is not logged in');
    }
});

// Login handler function
function loginUser(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    // Get form inputs
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    // Prepare data to send in the request
    const loginData = {
        email,
        password
    };
    console.log("loginData", loginData)
    // Send a POST request to your login endpoint
    fetch('/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Login failed');
            }
            return response.json(); // Parse response JSON
        })
        .then(userData => {
            document.querySelector('.login-form').style.display = 'none';
            document.querySelector('.login-btn').style.display = 'none';
            document.querySelector('.auth-wrapper').style.display = 'none';
            document.querySelector('.logout-btn').style.display = 'flex';
            storeUserData(userData);
            updateUsername();
            // Reload the page after successful login
            location.reload();


        })
        .catch(error => {
            console.error('Error:', error);
            alert('Login failed');
        });
}


// Logout handler function
function logoutUser() {
    // Clear user data from sessionStorage
    clearUserData();
    updateUsername();
    document.querySelector('.login-btn').style.display = 'flex';
    document.querySelector('.logout-btn').style.display = 'none';
    // Optionally, redirect the user to a logout page or home page
}

// Add event listeners to the forms
document.querySelector('.register-form').addEventListener('submit', registerUser);
document.querySelector('.login-form').addEventListener('submit', loginUser);