type Designation = "Engineer" | "Lead" | "Manager" | "Director" | "CEO";

// Base Class for Employee
abstract class Employee {
  constructor(
    public readonly id: string,
    public name: string,
    public dateOfBirth: string,
    public designation: Designation
  ) {
    if (!this.isValidDate(dateOfBirth)) {
      throw new Error(`Invalid date format for ${name}. Expected mm/dd/yyyy.`);
    }
  }

  private isValidDate(dateStr: string): boolean {
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    return regex.test(dateStr);
  }

  abstract getDetails(): string;
}

class Engineer extends Employee {
  public reportees: string[] = [];

  constructor(
    id: string,
    name: string,
    dateOfBirth: string,
    public reportsTo: string
  ) {
    super(id, name, dateOfBirth, "Engineer");
  }

  getDetails(): string {
    return `Engineer [ID: ${this.id}, Name: ${this.name}, Reports To: ${this.reportsTo}]`;
  }
}

class Lead extends Employee {
  constructor(
    id: string,
    name: string,
    dateOfBirth: string,
    public reportsTo: string, // Manager ID
    public reportees: string[] = []
  ) {
    super(id, name, dateOfBirth, "Lead");
  }

  getDetails(): string {
    return `Lead [ID: ${this.id}, Name: ${this.name}, Reports To: ${this.reportsTo}, Reportees: [${this.reportees.join(", ")}]]`;
  }
}

class Manager extends Employee {
  constructor(
    id: string,
    name: string,
    dateOfBirth: string,
    public reportsTo: string, // Director ID
    public reportees: string[] = []
  ) {
    super(id, name, dateOfBirth, "Manager");
  }

  getDetails(): string {
    return `Manager [ID: ${this.id}, Name: ${this.name}, Reports To: ${this.reportsTo}, Reportees: [${this.reportees.join(", ")}]]`;
  }
}

class Director extends Employee {
  constructor(
    id: string,
    name: string,
    dateOfBirth: string,
    public reportsTo: string, // CEO ID
    public reportees: string[] = []
  ) {
    super(id, name, dateOfBirth, "Director");
  }

  getDetails(): string {
    return `Director [ID: ${this.id}, Name: ${this.name}, Reports To: ${this.reportsTo}, Reportees: [${this.reportees.join(", ")}]]`;
  }
}

class CEO extends Employee {
  public reportsTo: string | null = null; // CEO reports to no one

  constructor(
    id: string,
    name: string,
    dateOfBirth: string,
    public reportees: string[] = []
  ) {
    super(id, name, dateOfBirth, "CEO");
  }

  getDetails(): string {
    return `CEO [ID: ${this.id}, Name: ${this.name}, Reportees: [${this.reportees.join(", ")}]]`;
  }
}

class Organization {
  private employees: Map<string, Employee> = new Map();
  private ceoId: string | null = null;


  addEmployee(employee: Employee): void {
    if (this.employees.has(employee.id)) {
      throw new Error(`Employee ID ${employee.id} must be unique.`);
    }

    if (employee instanceof CEO) {
      if (this.ceoId) {
        throw new Error("Organization already has a CEO. Cannot add multiple CEOs.");
      }
      this.ceoId = employee.id;
    } else {
      // Validate reporting hierarchy for non-CEO
      const reportsToId = (employee as any).reportsTo;
      if (!reportsToId || !this.employees.has(reportsToId)) {
        throw new Error(`Invalid reporting relationship: Superior ID ${reportsToId} does not exist.`);
      }

      const superior = this.employees.get(reportsToId);
      this.validateHierarchy(employee, superior);
      
      // Update superior's reportees list automatically
      if (superior && 'reportees' in superior) {
          (superior as any).reportees.push(employee.id);
      }
    }

    this.employees.set(employee.id, employee);
    console.log(`Added: ${employee.name} (${employee.designation})`);
  }

  private validateHierarchy(employee: Employee, superior: Employee | undefined): void {
    if (!superior) return;
    
    let valid = false;
    if (employee instanceof Engineer && superior instanceof Lead) valid = true;
    else if (employee instanceof Lead && superior instanceof Manager) valid = true;
    else if (employee instanceof Manager && superior instanceof Director) valid = true;
    else if (employee instanceof Director && superior instanceof CEO) valid = true;

    if (!valid) {
      throw new Error(
        `Invalid hierarchy: A ${employee.designation} cannot report to a ${superior.designation}.`
      );
    }
  }

  // Retrieve All Employees
  getAllEmployees(): Employee[] {
    return Array.from(this.employees.values());
  }

  // Retrieve Specific Employee
  getEmployee(id: string): Employee | undefined {
    return this.employees.get(id);
  }

  // Update Employee
  updateEmployee(id: string, newName?: string, newDob?: string): void {
    const emp = this.employees.get(id);
    if (!emp) {
      throw new Error(`Cannot update: Employee with ID ${id} not found.`);
    }

    if (newName) emp.name = newName;
    if (newDob) {
      const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
      if (!regex.test(newDob)) throw new Error("Invalid date format. Use mm/dd/yyyy");
      emp.dateOfBirth = newDob;
    }
    console.log(`Updated Employee ID: ${id}`);
  }

  // Delete Employee
  deleteEmployee(id: string): void {
    const emp = this.employees.get(id);
    if (!emp) {
      throw new Error(`Cannot delete: Employee with ID ${id} not found.`);
    }

    if ('reportees' in emp && (emp as any).reportees.length > 0) {
      throw new Error(`Cannot delete: ${emp.name} has reportees. Reassign them first.`);
    }

    if (emp.designation !== "CEO") {
        const superiorId = (emp as any).reportsTo;
        const superior = this.employees.get(superiorId);
        if (superior && 'reportees' in superior) {
            (superior as any).reportees = (superior as any).reportees.filter((rId: string) => rId !== id);
        }
    }

    if (emp instanceof CEO) {
      this.ceoId = null;
    }

    this.employees.delete(id);
    console.log(`Deleted Employee ID: ${id}`);
  }
}


const org = new Organization();

try {
  // 1. Add CEO
  const ceo = new CEO("C1", "Narendra Modi", "05/15/1975");
  org.addEmployee(ceo);

  // 2. Add Director
  const dir1 = new Director("D1", "Amit Shah", "08/20/1980", "C1");
  org.addEmployee(dir1);

  // 3. Add Manager
  const mgr1 = new Manager("M1", "Yogi Adityanath", "11/02/1985", "D1");
  org.addEmployee(mgr1);

  // 4. Add Lead
  const lead1 = new Lead("L1", "Devendra Fadnavis", "02/14/1990", "M1");
  org.addEmployee(lead1);

  // 5. Add Engineers
  const eng1 = new Engineer("E1", "Rahul Gandhi", "06/30/1995", "L1");
  const eng2 = new Engineer("E2", "Priyanka Gandhi", "09/12/1996", "L1");
  org.addEmployee(eng1);
  org.addEmployee(eng2);

 
  org.getAllEmployees().forEach((e) => console.log(e.getDetails()));

  // 6. Validations
  console.log("\n--- Testing Cases ---");
  
  // Try adding multiple CEOs
  try {
    org.addEmployee(new CEO("C2", "Lal Krishna Advani", "01/01/1980"));
  } catch (e: any) {
    console.log("Expected Error:", e.message);
  }

  try {
    org.addEmployee(new Engineer("E3", "Invalid Eng", "01/01/1998", "C1"));
  } catch (e: any) {
    console.log("Expected Error:", e.message);
  }

  // Try deleting an employee with reportees
  try {
    org.deleteEmployee("L1"); 
  } catch (e: any) {
    console.log("Expected Error:", e.message);
  }

  // 7. Update and Delete
  console.log("\n--- Updating and Deleting ---");
  org.updateEmployee("E1", "Shashank");
  console.log(org.getEmployee("E1")?.getDetails());

  org.deleteEmployee("E2"); // Has no reportees
  console.log("After deleting E2, Lead's reportees:", (org.getEmployee("L1") as Lead).reportees);

} catch (error: any) {
  console.error("Critical Error:", error.message);
}