/**
 * Auth Header Script
 * Updates navigation based on authentication state
 */

(function() {
    'use strict';

    // Find or create auth container in nav
    function initAuthHeader() {
        const nav = document.querySelector('nav ul');
        if (!nav) return;

        // Check if auth links already exist
        const existingAuthItem = nav.querySelector('.auth-nav-item');
        if (existingAuthItem) return;

        // Create auth nav item
        const authItem = document.createElement('li');
        authItem.className = 'auth-nav-item';
        authItem.innerHTML = '<span style="color: #94a3b8;">...</span>';
        nav.appendChild(authItem);

        // Check auth status
        checkAuthStatus(authItem);
    }

    async function checkAuthStatus(authItem) {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();

            if (data.authenticated) {
                renderLoggedIn(authItem, data.customer);
            } else {
                renderLoggedOut(authItem);
            }
        } catch (error) {
            renderLoggedOut(authItem);
        }
    }

    function renderLoggedIn(authItem, customer) {
        authItem.innerHTML = `
            <a href="/min-side" class="auth-user-link" style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="auth-avatar" style="
                    width: 28px;
                    height: 28px;
                    background: linear-gradient(135deg, #8DC99C, #6ab57a);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 0.8rem;
                ">${getInitials(customer.name)}</span>
                <span style="font-weight: 500;">${customer.name.split(' ')[0]}</span>
            </a>
        `;
    }

    function renderLoggedOut(authItem) {
        authItem.innerHTML = `
            <a href="/logg-inn" style="
                padding: 0.5rem 1rem;
                background: linear-gradient(135deg, #8DC99C, #6ab57a);
                color: white;
                border-radius: 8px;
                font-weight: 500;
                text-decoration: none;
            ">Logg inn</a>
        `;
    }

    function getInitials(name) {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuthHeader);
    } else {
        initAuthHeader();
    }
})();
