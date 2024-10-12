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
    const dragDropArea = document.getElementById('drag-drop-area');
    const processXlsxBtn = document.getElementById('process-xlsx-btn');
    const todoistBtn = document.getElementById('todoist-btn');
    const experimentalTitle = document.getElementById('experimental-title');
    const experimentalContainer = document.getElementById('experimental-container');
    let selectedFile = null;

        // Fetch user info from the server
    (async function() {
        try {
            const response = await fetch('/auth/user');
            if (response.ok && response.status === 200) {
                const userInfo = await response.json();
                // Update the user name and icon in the UI
                document.getElementById('user-name').innerHTML = `<span>${userInfo.userName}</span>`;
                document.getElementById('user-icon').src = userInfo.userIcon;
                document.querySelector('footer').textContent = `${getCurrentDate()} | ygmrtm | v${userInfo.version}`;
                // get pending transactions
                const pendingTransactions = await fetch('/api/get-pendientes', { method: 'GET' });
                if (pendingTransactions.ok) {
                    const result = await pendingTransactions.json();
                    const total = result.total;
                    console.log('Pending transactions:', result.status);
                    pendientesBtn.innerHTML = `<img src="../images/tasks-icon.png" alt="Pendientes"> ${result.status}`;
                    if (total > 0) {
                        document.getElementById('financial-dashboard-container').classList.add('show');
                    }
                } else {
                    console.error('Error fetching pending transactions.');
                }
            } else {
                console.error('User not authenticated', response.status);
                document.getElementById('user-name').innerHTML = `<span>User not authenticated</span>`;
                document.getElementById('user-icon').src = '../images/user-icon.png';
                pendientesBtn.innerHTML = `<img src="../images/tasks-icon.png" alt="Pendientes"> Pendientes(0)`;
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    })();

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
            window.location.reload();
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
        // Check if todoist is "all" and alert the user
        if (todoist === 'all') {
            const confirmSendToAll = confirm('No specific Todoist identifier provided. Emails will be sent to ALL. Do you want to proceed?');
            if (!confirmSendToAll) {
                return; // Cancel the operation if the user does not confirm
            }
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



    // Open file dialog when clicking the drag-drop area
    dragDropArea.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.xlsx';
        fileInput.onchange = (event) => {
            handleFileSelect(event.target.files[0]);
        };
        fileInput.click();
    });

    // Handle drag-and-drop events
    dragDropArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        dragDropArea.classList.add('drag-over');
    });

    dragDropArea.addEventListener('dragleave', () => {
        dragDropArea.classList.remove('drag-over');
    });

    dragDropArea.addEventListener('drop', (event) => {
        event.preventDefault();
        dragDropArea.classList.remove('drag-over');
        handleFileSelect(event.dataTransfer.files[0]);
    });

    function handleFileSelect(file) {
        if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            selectedFile = file;
            processXlsxBtn.disabled = false; // Enable the button
            dragDropArea.textContent = `Selected file: ${file.name}`;
        } else {
            alert('Please select a valid .xlsx file.');
        }
    }

    // Process the file when the button is clicked
    processXlsxBtn.addEventListener('click', async () => {
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('/api/process-xlsx', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Processed records:', result.status);
                alert('File processed successfully!');
                processXlsxBtn.disabled = true; // Disable the button after processing
            } else {
                alert('Error processing file. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while processing the file.');
        }
    });

// New function to display pending tasks in a floating window
function displayPendingTasks(tasks) {
    // Create floating window
    const floatingWindow = document.createElement('div');
    floatingWindow.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
        z-index: 1000;
        max-height: 80vh;
        max-width: 80vw;
        overflow-y: auto;
        `;

        //Create div for buttons
        const buttonDiv = document.createElement('div');
        buttonDiv.classList.add('button-group');

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.classList.add('close-button');
        closeButton.onclick = () => document.body.removeChild(floatingWindow);
        buttonDiv.appendChild(closeButton);
        // Create task table
        const taskTable = document.createElement('table');
        taskTable.style.cssText = `
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-family: 'Courier New', Courier, monospace;
        `;

        // Create table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr style="background-color: #f2f2f2;">
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; font-color: white;">Task</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; font-color: white;">Due Date</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; font-color: white;">Priority</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; font-color: white;">Actions</th>
            </tr>
        `;
        taskTable.appendChild(thead);

        // Create table body
        const tbody = document.createElement('tbody');
        tasks.forEach(task => {
            const tr = document.createElement('tr');
            tr.style.cssText = 'border-bottom: 1px solid #ddd;';
            
            // Task content and description
            const tdContent = document.createElement('td');
            tdContent.style.cssText = 'padding: 12px; text-align: center;';
            tdContent.innerHTML = `
            <div style="font-weight: bold;">${marked.parse(task.content)}</div>
            ${task.description ? `<div style="font-size: 0.9em; color: #666; margin-top: 5px;">${marked.parse(task.description)}</div>` : ''}
        `;
  
            
            // Due date
            const tdDue = document.createElement('td');
            tdDue.style.cssText = 'padding: 12px; text-align: center;';
            tdDue.textContent = task.due ? task.due.string : 'No due date';
            
            // Priority
            const tdPriority = document.createElement('td');
            tdPriority.style.cssText = 'padding: 12px; text-align: center;';
            const priorityColors = ['#777', '#4073ff', '#ffa500', '#ff4500'];
            tdPriority.innerHTML = `<span style="color: ${priorityColors[task.priority]};">●</span>`;
            
            // Actions
            const tdActions = document.createElement('td');
            tdActions.style.cssText = 'padding: 12px; text-align: center;';
            tdActions.innerHTML = `
                <a href="${task.url}" target="_blank" style="text-decoration: none; color: #4073ff;">View</a>
                <span style="color: #666; font-size: 0.9em;">${task.id}</span>
            `;
            
            tr.appendChild(tdContent);
            tr.appendChild(tdDue);
            tr.appendChild(tdPriority);
            tr.appendChild(tdActions);
            tbody.appendChild(tr);
        });

        taskTable.appendChild(tbody);

        // Replace taskList with taskTable in the floating window
        floatingWindow.appendChild(buttonDiv);
        floatingWindow.appendChild(taskTable);

        // Add to body
        document.body.appendChild(floatingWindow);
    }    
    
    // Add event listener to the Todoist button
    todoistBtn.addEventListener('click', async () => {
        todoistBtn.disabled = true; // Disable the button during the operation
        banner.style.display = 'block';
        banner.textContent = 'Checking Pending Tasks...';
    
        try {
            const response = await fetch('/todoist/get-pending', { method: 'GET' });
            if (response.ok) {
                const result = await response.json();
                displayPendingTasks(result.tasks); // New function to display tasks
            } else {
                banner.textContent = 'Error checking Pending Tasks. Please try again.';
            }
        } catch (error) {
            banner.textContent = 'An error occurred while checking Pending Tasks.';
            console.error('Error:', error);
        } finally {
            setTimeout(() => {
                banner.style.display = 'none';
                todoistBtn.disabled = false; // Re-enable the button after processing
            }, 3000);
        }
    });    


    notionBtn.addEventListener('click', async () => {
        notionBtn.disabled = true; // Disable the button during the operation
        banner.style.display = 'block';
        banner.textContent = 'Checking Notion connection...';
        
        try {
            const response = await fetch('/notion/health-check', { method: 'GET' });
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

// Function to perform health checks for Todoist and Notion
async function performHealthChecks() {
    try {
        const todoistResponse = await fetch('/todoist/health-check', { method: 'GET' });
        if (!todoistResponse.ok) {
            throw new Error('Error checking Todoist connection');
        }
        const todoistResult = await todoistResponse.json();
        document.getElementById('todoist-btn').disabled = false;
        const notionResponse = await fetch('/notion/health-check', { method: 'GET' });
        if (!notionResponse.ok) {
            throw new Error('Error checking Notion connection');
        }
        const notionResult = await notionResponse.json();
        document.getElementById('notion-btn').disabled = false;
        // Display combined results
        banner.textContent = `${todoistResult.status} ${notionResult.status}`;
    } catch (error) {
        banner.textContent = error.message; // Display specific error message
    } finally {
        setTimeout(() => {
            banner.style.display = 'none';
        }, 3000);
    }
}

// Add event listener to experimental title
experimentalTitle.addEventListener('click', () => {

    if (experimentalContainer.style.display === 'none') {
        experimentalContainer.style.display = 'block';
        experimentalTitle.textContent = 'Hide Experimental .Ø_Ø.';
        banner.style.display = 'block';
        banner.textContent = 'Performing health check...';
        performHealthChecks(); // Call the health check function
    } else {
        experimentalContainer.style.display = 'none';
        experimentalTitle.textContent = 'Show Experimental .Ø_Ø.';
    }
    

    });
});