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
