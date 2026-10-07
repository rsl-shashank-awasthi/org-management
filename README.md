# Organization Management System

## Project Setup and Installation

1. Ensure you have Node.js installed on your machine (Node v22+).
2. Clone the repository and navigate to the project directory.
3. Install the required dependencies (TypeScript and type definitions):
   ```bash
   npm install typescript @types/node --save-dev
   ```

## Execution commands:
```bash
npx tsx index.ts
```

## Project Structure

- index.ts: Contains the entire application logic.

- Employee (Base Class): Base class containing shared attributes (id, name, dateOfBirth, designation) and date format validation.

- Designation Subclasses: Engineer, Lead, Manager, Director, and CEO. These extend Employee and implement the abstract getDetails() method, alongside designation-specific fields (reportsTo, reportees).

- Organization (Management Class): Acts as the central orchestrator. It utilizes a Map to store employees and encapsulates all CRUD operations, hierarchy validation, and edge-case handling.

## Design Approach and Assumptions
Design Approach

- Inheritance & Polymorphism: Subclasses inherit common traits from Employee, while overriding getDetails() to format their specific outputs dynamically.

- Encapsulation: The Organization class hides the internal employees Map and manages all state changes, preventing invalid data entry.

- Lookups: Using a Map<string, Employee> allows for constant-time complexity when retrieving, updating, or validating parent IDs.

- Automated Updates: When a subordinate is added, the system automatically pushes their ID into their superior's reportees array.

## Assumptions
- A valid date of birth strictly follows the mm/dd/yyyy format.

- The organizational hierarchy is: Engineer -> Lead -> Manager -> Director -> CEO. Skips in the chain are considered invalid and rejected.

- Deletion is restricted if an employee still has active reportees to prevent orphaned records in the hierarchy.