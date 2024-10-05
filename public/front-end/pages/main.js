// Function to generate current date in YYYY-MM-DD format
function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Inject the current date into the footer
document.addEventListener('DOMContentLoaded', function() {
    const footer = document.querySelector('footer');
    footer.textContent = `${getCurrentDate()} | ygmrtm | Version 2.0.0`;
});

document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('response_banner');
    const pendientesBtn = document.getElementById('pendientes-btn');
    const estadisticasBtn = document.getElementById('estadisticas-btn');
    const notionBtn = document.getElementById('notion-btn');
    const mandarCorreosBtn = document.getElementById('mandar-correos-btn');
    const daysInput = document.getElementById('days-input');
    const todoistInput = document.getElementById('todoist-input');


    pendientesBtn.addEventListener('click', async () => { // add event listener to pendientes button
        pendientesBtn.disabled = true; // Disable the button during the operation
        banner.style.display = 'block';
        banner.textContent = 'Processing pending transactions...';
        try {
            // Call the backend API for processing pending transactions
            const response = await fetch('/api/pendientes', { method: 'POST' });
            if (response.ok) {
                const result = await response.json();
                banner.textContent = `Status: ${result.status}`; // Display the response message
            } else {
                banner.textContent = 'Error processing transactions. Please try again.';
            }
        } catch (error) {
            banner.textContent = 'An error occurred while processing transactions.';
            console.error('Error:', error);
        } finally {
            setTimeout(() => {  
                banner.style.display = 'none';
            pendientesBtn.disabled = false; // Re-enable the button after processing
            }, 3000);
        }
    });

    // add event listener to estadisticas button
    estadisticasBtn.addEventListener('click', async () => {
        estadisticasBtn.disabled = true; // Disable the button during the operation
        banner.style.display = 'block';
        banner.textContent = 'Generating statistics...';
        try {
            // Call the backend API for generating statistics
            const response = await fetch('/api/estadisticas', { method: 'POST' });
            if (response.ok) {
                const result = await response.json();
                banner.textContent = `Status: ${result.status}`; // Display the response message
            } else {
                banner.textContent = 'Error generating statistics. Please try again.';
            }
        } catch (error) {
            banner.textContent = 'An error occurred while generating statistics.';
            console.error('Error:', error);
        } finally {
            setTimeout(() => {
                banner.style.display = 'none';
                estadisticasBtn.disabled = false; // Re-enable the button after processing
            }, 3000);
        }
    });

    // add event listener to mandar correos button
    mandarCorreosBtn.addEventListener('click', async () => {
        const days = parseInt(daysInput.value, 10);
        const todoist = todoistInput.value ? todoistInput.value : 'all';
        // Validate the input
        if (isNaN(days) || days <= 0) {
            banner.style.display = 'block';
            banner.textContent = 'Please enter a valid number of days.';
            return;
        }

        mandarCorreosBtn.disabled = true; // Disable the button during the operation
        banner.style.display = 'block';
        banner.textContent = 'Sending emails...';

        try {
            // Call the backend API to send emails
            const response = await fetch('/api/send-emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ days: days, todoist: todoist })
            });

            if (response.ok) {
                const result = await response.json();
                banner.textContent = `Status: ${result.status}`; // Display the response message
            } else {
                banner.textContent = 'Error sending emails. Please try again.';
            }
        } catch (error) {
            banner.textContent = 'An error occurred while sending emails.';
            console.error('Error:', error);
        } finally {
            setTimeout(() => {
                banner.style.display = 'none';
                mandarCorreosBtn.disabled = false; // Re-enable the button after processing
            }, 3000);
        }
    });

    /**
     * this to implement later
     */
    // add event listener to notion button
    notionBtn.addEventListener('click', async () => {
        notionBtn.disabled = true; // Disable the button during the operation
        banner.style.display = 'block';
        banner.textContent = 'Checking Notion connection...';
        
        try {
            const response = await fetch('/api/health-check', { method: 'GET' });
            if (response.ok) {
                const result = await response.json();
                banner.textContent = `Status: ${result.status}`; // Display the response message
            } else {
                banner.textContent = 'Error checking connection. Please try again.';
            }
        } catch (error) {
            banner.textContent = 'An error occurred while checking connection.';
            console.error('Error:', error);
        } finally {
            setTimeout(() => {
                banner.style.display = 'none';
                notionBtn.disabled = false; // Re-enable the button after processing
            }, 3000);
        }
    });
});