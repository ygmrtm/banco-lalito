// New function to display pending tasks in a floating window
function displayPendingTasks(tasks) {
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
        closeButton.onclick = () => {
            document.body.removeChild(overlay); // Remove overlay
            document.body.removeChild(floatingWindow); // Remove floating window
        };
        buttonDiv.appendChild(closeButton);
        const karmaButton = document.createElement('button');
        const karmaImage = document.createElement('img');
        karmaImage.src = '../images/karma.png';
        karmaImage.alt = 'Karma';
        karmaButton.appendChild(karmaImage);
        karmaButton.classList.add('button');
        karmaButton.onclick = () => {
            displayKarma();
        };
        buttonDiv.appendChild(karmaButton);
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
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; font-color: #f0f0f0;font-weight: bold; width: 10%;">(!)</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; font-color: #f0f0f0;font-weight: bold; width: 50%;">Task</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; font-color: #f0f0f0;font-weight: bold; width: 20%;">Due Date</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; font-color: #f0f0f0;font-weight: bold; width: 20%;">Actions</th>
            </tr>
        `;
        taskTable.appendChild(thead);

        // Create table body
        const tbody = document.createElement('tbody');
        tasks.forEach(task => {
            const tr = document.createElement('tr');
            tr.style.cssText = 'border-bottom: 1px solid #ddd;';
            
            // Priority
            const tdPriority = document.createElement('td');
            tdPriority.style.cssText = 'padding: 12px; text-align: center;';
            const priorityColors = ['#520556', '#8B104E', '#CA431D', '#FF9900'];
            tdPriority.innerHTML = `<span style="color: ${priorityColors[task.priority]};">✘</span>`;
            
            // Task content and description
            const tdContent = document.createElement('td');
            tdContent.style.cssText = 'padding: 12px; text-align: justify;';
            tdContent.innerHTML = `
            <div style="font-weight: bold;">${marked.parse(task.content)}</div>
            ${task.description ? `<div style="font-size: 0.9em; color: #666; margin-top: 5px;">${marked.parse(task.description)}</div>` : ''}`;
            
            // Due date
            const tdDue = document.createElement('td');
            tdDue.style.cssText = 'padding: 12px; text-align: center;';
            tdDue.textContent = task.due ? task.due.date : 'No due date';
            
            // Actions
            const tdActions = document.createElement('td');
            tdActions.style.cssText = 'padding: 12px; text-align: center;';
            tdActions.innerHTML = `
                <a href="${task.url}" target="_blank" style="text-decoration: none; color: #4073ff;">${task.id}</a>
            `;
            
            tr.appendChild(tdPriority);
            tr.appendChild(tdContent);
            tr.appendChild(tdDue);
            tr.appendChild(tdActions);
            tbody.appendChild(tr);
        });

        taskTable.appendChild(tbody);

        // Append overlay and floating window to the body
        document.body.appendChild(overlay);
        floatingWindow.appendChild(buttonDiv);
        floatingWindow.appendChild(taskTable);

        // Add to body
    document.body.appendChild(floatingWindow);
}    

async function displayKarma() {
    try {
        const response = await fetch('/todoist/karma', { method: 'GET' });
        const karma = await response.json();
        if (!response.ok) {
            throw new Error('Error fetching karma');
        }
        console.log(karma);

        let badReasonsTotal = 0;
        let goodReasonsTotal = 0;
        const listOfReasons = [];
        for (const reason of karma.karmaUpdateReasons) {
            if (reason.negative_karma > 0) {
                badReasonsTotal += reason.negative_karma;
                for (const badReasons of reason.negative_karma_reasons) {
                    if (!listOfReasons.includes(badReasons)) {
                        listOfReasons.push(badReasons);
                    }
                }
            } else if (reason.positive_karma > 0) { 
                goodReasonsTotal += reason.positive_karma;
                for (const goodReason of reason.positive_karma_reasons) {
                    if (!listOfReasons.includes(goodReason)) {
                        listOfReasons.push(goodReason);
                    }
                }
            }
        }
        
        const karmaWindow = document.createElement('div');
        karmaWindow.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: transparent;
            padding: 1px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
            z-index: 3000;
            max-height: 520px;
            overflow-y: auto;
        `;

        // Create div for buttons
        const buttonDiv = document.createElement('div');
        buttonDiv.classList.add('button-group');
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.classList.add('close-button');
        closeButton.onclick = () => {
            document.body.removeChild(karmaWindow);
        };
        buttonDiv.appendChild(closeButton);
        karmaWindow.appendChild(buttonDiv);

        // Create content for the karma dashboard
        // Fetch the karma dashboard HTML template
        fetch('karmadash.html')
        .then(response => response.text())
        .then(templateHTML => {
            const karmaContent = document.createElement('div');
            karmaContent.innerHTML = templateHTML.replace('{{completedCount}}', karma.completedCount)
                                            .replace('{{karmaScore}}', karma.karmaScore)
                                            .replace('{{goodReasonsTotal}}', goodReasonsTotal)
                                            .replace('{{badReasonsTotal}}', badReasonsTotal);
            const matrixContainer = document.createElement('div');
            matrixContainer.style.cssText = `
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 1px;
                margin-top: 1px;
                position: absolute; /* Position it absolutely */
                top: 40px; /* Align it to the top of the container */
                left: 0; /* Align it to the left of the container */
                width: 100%; /* Full width */
                height: 85%; /* Full height */
                z-index: 3001; /* Lower z-index to be behind other elements */
                color: #FFC94A; /* Updated to warm color */
                text-align: center;
            `;
            matrixContainer.id = 'skeleton-matrix';
            for (let i = 0; i < 50; i++) {
                const skeletonIcon = document.createElement('span');
                skeletonIcon.className = 'material-symbols-outlined';
                skeletonIcon.textContent = 'skull'; 
                skeletonIcon.style.fontSize = '30px';
                matrixContainer.appendChild(skeletonIcon);
            }
            karmaContent.appendChild(matrixContainer);
            karmaWindow.appendChild(karmaContent);
        });
        document.body.appendChild(karmaWindow);
    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching karma');
    }
}