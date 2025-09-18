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
    const generateNotificacionsBtn = document.getElementById('mandar-correos-btn');
    const daysInput = document.getElementById('days-input');
    //const todoistInput = document.getElementById('todoist-input');
    const todoistSelect = document.getElementById('todoist-select');
    const dragDropArea = document.getElementById('drag-drop-area');
    const processXlsxBtn = document.getElementById('process-xlsx-btn');
    const todoistBtn = document.getElementById('todoist-btn');
    const experimentalTitle = document.getElementById('experimental-title');
    const experimentalContainer = document.getElementById('experimental-container');
    const aboutBtn = document.getElementById('about-icon');
    let selectedFile = null;

        // Fetch user info from the server
    async function fetchPendingTransactions() {        
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
                    const readytoprocess = result.readytoprocess ? result.readytoprocess : 0;
                    pendientesBtn.innerHTML = `<img src="../images/tasks-icon.png" alt="Pendents"> ${result.status}`;
                    pendientesBtn.disabled=true;
                    if (total > 0) {
                        document.getElementById('financial-dashboard-container').classList.add('show');
                        displayPendingMovements(result.tasks);
                        if(readytoprocess > 0) {
                            pendientesBtn.disabled=false;
                        }
                    }
                } else {
                    console.error('Error fetching pending transactions.' );
                }
            } else {
                console.error('User not authenticated', response.status);
                document.getElementById('user-name').innerHTML = `<span>User not authenticated</span>`;
                document.getElementById('user-icon').src = '../images/user-icon.png';
                pendientesBtn.innerHTML = `<img src="../images/tasks-icon.png" alt="Pendents"> Pendents | 0`;
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    function displayPendingMovements(movement) {
        const taskGrid = document.getElementById('task-grid');
        taskGrid.innerHTML = ''; // Clear existing tasks

        movement.forEach(task => {
            let to = '';
            let from = '';
            let description = '';
            let monto = task.properties.mto_to.number;
            for (const people of task.properties['πpol_to'].multi_select) 
                to += (to.length > 0 ? ', ' : '') + people.name 
            for (const people of task.properties['πpol_from'].multi_select) 
                from += (from.length > 0 ? ', ' : '') + people.name 
            for (const text of task.properties.description.rich_text)
                description += (description.length > 0 ? ', ' : '') + text.plain_text;
            const card = document.createElement('div');
            card.id = task.id;
            card.className = 'task-card ' + (task.properties.pending.checkbox ? 'pending' : 'ready');
            card.innerHTML = `
                <h3 id=monto${task.id}>$${monto}</h3>
                <p align="center">${task.properties.type.select.name}</p>
                <p><em>${description}</em></p>
                <p><b>To:</b> ${to}</p>
                <p><b>From:</b> ${from}</p>
            `;

            // Add click event to handle task completion
            card.addEventListener('click', async () => {
                if (monto == 0){
                    //console.log("registering monto");
                    const newMonto = prompt("Introduïu l'import a pagar:");
                    if (newMonto != null && newMonto != 0) {
                        monto = parseFloat(newMonto); // Update the outer monto variable
                        await confirmTaskPending(task.id, 'pending', monto);
                        const taskMonto = document.getElementById('monto'+task.id);
                        taskMonto.innerHTML = `$${monto}`;
                    }
                }else if (task.properties.pending.checkbox) {
                    //console.log("registering from pending to ready");
                    card.classList.remove('pending');            
                    await confirmTaskPending(task.id, 'ready', monto);
                    task.properties.pending.checkbox = false;
                    //card.classList.add('ready')
                }else if (!task.properties.processed.checkbox){                    
                    //console.log("registering ready to proessed");
                    card.classList.remove('ready');            
                    await confirmTaskPending(task.id, 'completed', monto);
                    task.properties.processed.checkbox = true;
                    //card.classList.add('completed');
                }else if (task.properties.processed.checkbox){ 
                    //console.log("ready to reactivate");
                    card.classList.remove('completed');
                    await confirmTaskPending(task.id, 'pending', monto);
                    task.properties.processed.checkbox = false;
                    task.properties.pending.checkbox = true;
                }
            });
            
            taskGrid.appendChild(card);
        });
    }

    async function confirmTaskPending(taskId, status, monto) {
        //const card = document.querySelector(`.task-card[data-id="${taskId}"]`);
        const card = document.getElementById(`${taskId}`);
        try {
            const response = await fetch(`/api/confirm-task/${taskId}/${status}/${monto}`, { method: 'POST' });
            if (!response.ok) {
                throw new Error('Failed to update task status');
            }
            //fetchPendingTransactions();
            if (card) {
                card.classList.add(status);
            }            
        } catch (error) {
            console.error('Error updating task status:', error);
            // Change card color to red if there's an error
            if (card) {
                card.classList.remove('completed');
                card.classList.add('error');
            }
        }
    }


    fetchPendingTransactions();

    // Fetch and populate the todoist-select dropdown
    async function fetchPeople(peopleType) {
        try {
            const response = await fetch(`/notion/get-people/${(peopleType)}`, { method: 'GET' });
            if (response.ok) {
                const result = await response.json();
                const select = document.getElementById('todoist-select');
                select.innerHTML = ''; // Clear existing options
    
                result.people.forEach(person => {
                    const option = document.createElement('option');
                    option.value = person.id;
                    option.textContent = person.name;
                    select.appendChild(option);
                });
                select.value = result.people[0].id; // Select the first person by default
                select.disabled = false;
                //generateNotificacionsBtn.disabled = false;
            } else {
                console.error('Error fetching people.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    pendientesBtn.addEventListener('click', async () => { // add event listener to pendientes button
        pendientesBtn.disabled = true; // Disable the button during the operation
        banner.style.display = 'block';
        banner.textContent = 'Processant les transaccions pendents...';
        try {
            // Call the backend API for processing pending transactions
            const response = await fetch('/api/pendientes', { method: 'POST' });
            if (response.ok) {
                const result = await response.json();
                banner.textContent = `Estat: ${result.status}`; // Display the response message
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
        banner.textContent = 'Generant estadístiques...';
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
    generateNotificacionsBtn.addEventListener('click', async () => {
        const days = parseInt(daysInput.value, 10);
        const todoist = todoistSelect.value ? todoistSelect.value : 'all';
        // Validate the input
        if (isNaN(days) || days <= 0) {
            banner.style.display = 'block';
            banner.textContent = 'Please enter a valid number of days.';
            return;
        }
        // Check if todoist is "all" and alert the user
        if (todoist === 'all') {
            const confirmSendToAll = confirm("No s'ha proporcionat cap ID de Todoist específic. \n Els correus electrònics s'enviaran a TOTS. \n Voleu continuar?");
            if (!confirmSendToAll) {
                return; // Cancel the operation if the user does not confirm
            }
        }        

        generateNotificacionsBtn.disabled = true; // Disable the button during the operation
        todoistSelect.disabled = true;
        banner.style.display = 'block';
        banner.textContent = 'generant notificacions...';

        try {
            // Call the backend API to send emails
            const response = await fetch('/api/send-emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'todoist': todoist,
                    'days': days,
                },
                body: JSON.stringify({ days: days, todoist: todoist })
            });

            if (response.ok) {
                const result = await response.json();
                const total_pending_to_generate = result.total_pending_to_generate;
                const total_generated_not_sent = result.total_generated_not_sent;
                const total_sit_to_be_sent = result.total_sit_to_be_sent;
                generateNotificacionsBtn.innerHTML = `<img src="../images/notifications-icon.png" alt="Generate Notifications"> ${result.status}`;

                console.log('response | ' + response)
                console.log('result | ' + result)
                banner.textContent = `Estat: ${result.status}`;
                const total_confirmations = result.confirmations.length  || 0;
                banner.textContent += (total_confirmations > 0)
                    ?' | Total confirmations: ' + total_confirmations
                    :' | Weird but NO confirmation, 👁️ on this!';
            } else {
                banner.textContent = 'Error sending emails. Please try again.';
            }
        } catch (error) {
            banner.textContent = 'An error occurred while sending emails.';
            console.error('Error:', error);
        } finally {
            setTimeout(() => {
                banner.style.display = 'none';
                generateNotificacionsBtn.disabled = false; // Re-enable the button after processing
                todoistSelect.disabled = false;
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

    aboutBtn.addEventListener('click', () => {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent gray */
            z-index: 999; /* Ensure it's behind the floating window */
        `;    
        // Create floating window
        const floatingWindow = document.createElement('div');
        floatingWindow.style.cssText = `
            position: fixed;
            top: 20%;
            right: 20%;
            transform: translate(-50%, -50%);
            background-color: #f0f0f0;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
            z-index: 1000;
            max-height: 40vh;
            max-width: 40vw;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            `;

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.classList.add('close-button');
        closeButton.onclick = () => {
            document.body.removeChild(overlay); // Remove overlay
            document.body.removeChild(floatingWindow); // Remove floating window
        };
        const versionContainer = document.createElement('div');
        const versionText = document.createElement('span');
        versionText.classList.add('sixtyfour-convergence-prompt');
        versionContainer.style.cssText = `
            margin-top: 10px;
        `;
        fetch('/auth/user')
            .then(response => response.json())
            .then(userInfo => {
                versionText.textContent = `v${userInfo.version}`;
            })
            .catch(error => {
                console.error('Error fetching user info:', error);
                versionText.textContent = 'Version unavailable';
            })
            .finally(() => {
                versionContainer.appendChild(versionText);
            });
        
        const healthChecksContainer = document.createElement('div');
        const todoistIcon = document.createElement('img');
        todoistIcon.src = '../images/todoist-logo.png';
        todoistIcon.alt = 'Todoist';
        todoistIcon.style.cssText = `
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 0.5px solid #000;
            padding: 5px;
            margin-top: 10px;
        `;
        const notionIcon = document.createElement('img');
        notionIcon.src = '../images/notion-logo.png';
        notionIcon.alt = 'Notion';
        notionIcon.style.cssText = `
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 0.5px solid #000;
            padding: 5px;
            margin-top: 10px;
        `;
        // Perform health checks
        performHealthChecks().then(healthChecks => {
            if (!healthChecks.todoistEnabled) {
                todoistIcon.alt = 'Todoist disabled';
                todoistIcon.src = '../images/todoist-logo-gray.png';
            }
            if (!healthChecks.notionEnabled) {
                notionIcon.src = '../images/notion-logo-gray.png';
                notionIcon.alt = 'Notion disabled';
            }
        });
        healthChecksContainer.appendChild(todoistIcon);
        healthChecksContainer.appendChild(notionIcon);
        floatingWindow.appendChild(closeButton);
        floatingWindow.appendChild(versionContainer);
        floatingWindow.appendChild(healthChecksContainer);
        // Append overlay and floating window to the body
        document.body.appendChild(overlay);
        document.body.appendChild(floatingWindow);

    });


// Function to perform health checks for Todoist and Notion
async function performHealthChecks() {
    try {
        const todoistResponse = await fetch('/todoist/health-check', { method: 'GET' });
        const todoistEnabled = todoistResponse.ok;
        const todoistResult = await todoistResponse.json();
        //document.getElementById('todoist-btn').disabled = false;
        const notionResponse = await fetch('/notion/health-check', { method: 'GET' });
        const notionEnabled = notionResponse.ok;
        const notionResult = await notionResponse.json();
        return { todoistEnabled, todoistResult, notionEnabled, notionResult };
    } catch (error) {
        throw new Error('Error checking health: '+error);
    } 
}

// Add event listener to experimental title
experimentalTitle.addEventListener('click', () => {
    if (experimentalContainer.style.display === 'none') {
        experimentalContainer.style.display = 'block';
        experimentalTitle.textContent = 'Amaga Experimental .Ø_Ø.';
        //banner.style.display = 'block';
    } else {
        experimentalContainer.style.display = 'none';
        experimentalTitle.textContent = 'Mostra Experimental .Ø_Ø.';
    }
    const financialDashboardContainer = document.getElementById('financial-dashboard-container');
    if (financialDashboardContainer.style.display !== 'none') {
        financialDashboardContainer.classList.remove('show');
        //financialDashboardContainer.style.display = 'none';
    }


    });

    // Call the function to fetch people on page load
    fetchPeople('A');

});