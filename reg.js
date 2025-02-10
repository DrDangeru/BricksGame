export function createRegForm() {
    const modal = document.createElement('div');
    modal.style.display = 'none';
    modal.style.position = 'fixed';
    modal.style.zIndex = '1';
    modal.style.left = '50%';
    modal.style.top = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = '#fefefe';
    modal.style.padding = '20px';
    modal.style.border = '1px solid #888';
    modal.style.borderRadius = '5px';

    modal.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <div>Enter your name: <input id="nameInput" type="text"></div>
            <div>Enter your password: <input id="passwordInput" type="password"></div>
            <div>Enter your username: <input id="usernameInput" type="text"></div>
            <button id="registerButton">Register</button>
            <button id="closeButton">Close</button>
        </div>
    `;

    document.body.appendChild(modal);

    // Attach event listeners
    const registerButton = modal.querySelector('#registerButton');
    registerButton.addEventListener('click', handleRegister);

    const closeButton = modal.querySelector('#closeButton');
    closeButton.addEventListener('click', closeRegForm);

    return modal;
}

export function showRegForm() {
    const modal = document.querySelector('#regModal') || createRegForm();
    modal.id = 'regModal';
    modal.style.display = 'block';
}

export function closeRegForm() {
    const modal = document.querySelector('#regModal');
    if (modal) {
        modal.style.display = 'none';
        modal.parentNode.removeChild(modal);
    }
}

function handleRegister() {
    const name = document.getElementById("nameInput").value;
    const password = document.getElementById("passwordInput").value;
    const username = document.getElementById("usernameInput").value;
    
    if (!name || !password || !username) {
        alert('Please fill in all fields');
        return;
    }

    // Create user object
    const user = {
        name: name,
        username: username,
        password: password, // In a real app, this should be hashed
        dateJoined: new Date().toISOString()
    };

    // Save user data
    const users = JSON.parse(localStorage.getItem('brickGame_users') || '[]');
    if (users.some(u => u.username === username)) {
        alert('Username already exists!');
        return;
    }
    
    users.push(user);
    localStorage.setItem('brickGame_users', JSON.stringify(users));
    
    // Set as current user
    localStorage.setItem('brickGame_currentUser', username);
    
    // Initialize user's score history
    localStorage.setItem(`brickGame_scores_${username}`, JSON.stringify([]));
    
    // Update game state
    window.gameState.currentUser = username;
    
    console.log('User registered:', user);
    alert('Registration successful!');
    closeRegForm();
}