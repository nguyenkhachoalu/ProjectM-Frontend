// requestTeam.js
export default class RequestTeam {
    constructor(name, description, managerId) {
      this.name = name || '';
      this.description = description || '';
      this.managerId = managerId || null;
    }
  
    toJson() {
      return {
        name: this.name,
        description: this.description,
        managerId: this.managerId,
      };
    }
  }
  