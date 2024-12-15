
# Synthetic Data Generator

A **React-based application** that generates synthetic data for database tables based on metadata fetched from an API. The tool allows users to define data generators, record counts, and constraints for tables while visualizing the table hierarchy (central, parent, and child tables).

## Features
- Fetches metadata for a table from an API.
- Supports **customizable data generation**:
  - Selectable data generators for each column.
  - Configurable record counts for tables.
  - Toggle data generation for specific tables.
- Visualizes table metadata and relationships:
  - Displays central, parent, and child tables.
  - Includes constraints between tables.
- Outputs JSON with selected settings and constraints.

## Demo
### User Workflow:
1. Enter a table name and fetch its metadata.
2. Configure data generators, record counts, and toggle data generation for each table.
3. Generate a JSON configuration for the synthetic data.

## Technologies Used
- **React**: For building the interactive UI.
- **JavaScript**: Core logic for dynamic behavior.
- **CSS**: Styling the application interface.
- **REST API**: Fetching metadata and constraints.

---

## Installation and Setup

### Prerequisites
- Node.js and npm installed on your machine.
- API endpoint running locally or accessible (e.g., `http://127.0.0.1:5000/get_metadata`).

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/synthetic-data-generator.git
   cd synthetic-data-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open the app in your browser:
   ```
   http://localhost:3000
   ```

---

## Usage

### Fetch Metadata
1. Enter the name of the central table in the input field.
2. Click **Fetch Metadata**. The app fetches metadata from the API and displays:
   - Central table.
   - Related parent and child tables.
   - Columns, data types, and maximum lengths.

### Configure Data Generation
- **Record Counts**: Adjust the number of records to generate for each table.
  - Use the input field to specify the number of records.
  - This input is **enabled** when the **Generate Data** toggle is turned on for the respective table.
- **Generators**: Choose column-specific data generators (e.g., First Name, Email, etc.).
  - A dropdown appears for each column when **Generate Data** is enabled.
  - Select the appropriate generator for each column.
- **Enable/Disable Data Generation**: Use the toggle switch to include/exclude a table for data generation.
  - The toggle is used to control whether synthetic data should be generated for a table.
  - When toggled off, the generators and record count inputs for the table are disabled.

### Generate JSON
- Click **Generate JSON** to output the configuration in JSON format.
- The JSON contains:
  - Whether data generation is enabled or not for each table.
  - The number of records to generate for each table.
  - The selected data generator for each column.
- View the generated JSON in the console or use it programmatically.

---

## File Structure

```
/synthetic-data-generator
├── /public
│   └── index.html          # HTML file
├── /src
│   ├── App.css             # Styles for the app
│   ├── App.js              # Main React component
│   ├── index.js            # Entry point for React app
│   └── README.md           # This file
├── package.json            # Project metadata and dependencies
└── .gitignore              # Git ignore file
```

- **App.js**: Contains the core logic for fetching metadata, managing state, and rendering the table.
- **App.css**: Contains the styles for the user interface.
- **index.js**: Entry point for the React application.

---

## API Details

The app interacts with an API endpoint to fetch table metadata and constraints.

### API Request
```http
GET http://127.0.0.1:5000/get_metadata?table_name={table_name}
```

### API Response
```json
{
  "central_table_metadata": { ... },
  "parent_tables_metadata": { ... },
  "child_tables_metadata": { ... }
}
```

### Sample Response:
```json
{
  "central_table_metadata": {
    "users": [
      {
        "COLUMN_NAME": "user_id",
        "DATA_TYPE": "INT",
        "CHARACTER_MAXIMUM_LENGTH": null
      },
      {
        "COLUMN_NAME": "first_name",
        "DATA_TYPE": "VARCHAR",
        "CHARACTER_MAXIMUM_LENGTH": 255
      }
    ]
  },
  "parent_tables_metadata": {
    "addresses": [
      {
        "COLUMN_NAME": "address_id",
        "DATA_TYPE": "INT",
        "CHARACTER_MAXIMUM_LENGTH": null
      },
      {
        "COLUMN_NAME": "street",
        "DATA_TYPE": "VARCHAR",
        "CHARACTER_MAXIMUM_LENGTH": 255
      }
    ]
  },
  "child_tables_metadata": {
    "orders": [
      {
        "COLUMN_NAME": "order_id",
        "DATA_TYPE": "INT",
        "CHARACTER_MAXIMUM_LENGTH": null
      },
      {
        "COLUMN_NAME": "order_date",
        "DATA_TYPE": "DATE",
        "CHARACTER_MAXIMUM_LENGTH": null
      }
    ]
  }
}
```

---

## Contributing

Contributions are welcome! If you'd like to contribute, please fork the repository and create a pull request with your changes. 

### Steps for contributing:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add new feature'`).
5. Push to your forked repository (`git push origin feature-branch`).
6. Create a pull request.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
