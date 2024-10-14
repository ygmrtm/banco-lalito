# Banco Lalito Dashboard

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features
- User authentication and profile display.
- Financial dashboard with visualizations.
- Integration with Todoist for task management.
- Email sending functionality for notifications.
- File upload and processing for XLSX files.
- Experimental features for future enhancements.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/ygmrtm/banco-lalito-dashboard.git
   ```
2. Navigate to the project directory:
   ```bash
   cd banco-lalito-dashboard
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables by creating a `.env` file in the root directory and adding the necessary keys:
   ```
   TODOIST_API_TOKEN=your_todoist_api_token
   DATABASE_BAK_ID=your_database_id
   PRICE_AMT=your_price_amount
   ```

## Usage
1. Start the server:
   ```bash
   npm start
   ```
2. Open your browser and navigate to `http://localhost:3000` to access the dashboard.

## Configuration
- Modify the `.env` file to configure API tokens and other settings.
- Adjust the front-end styles in `public/front-end/styles/style.css` to customize the appearance of the dashboard.

## API Documentation
### Endpoints
- **GET /auth/user**: Fetches user information.
- **GET /api/get-pendientes**: Retrieves pending tasks from Todoist.
- **POST /api/pendientes**: Processes pending transactions.
- **POST /api/send-emails**: Sends emails based on user input.
- **GET /notion/health-check**: Checks the connection to Notion.
- **GET /todoist/health-check**: Checks the connection to Todoist.

### Example Request
```javascript
fetch('/api/get-pendientes', {
	method: 'GET',
	headers: {
	'Authorization': Bearer ${process.env.TODOIST_API_TOKEN}
	}
});
```

## Contributing
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/YourFeature
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add some feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/YourFeature
   ```
5. Open a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact
For any inquiries or feedback, please contact:
- **Your Name** - [yog.mortuum@example.com](mailto:yog.mortuum@gmail.com)
- GitHub: [ygmrtm](https://github.com/ygmrtm)


