// /src/models/responses/teamResponse.js

export default class TeamResponse {
    constructor(data) {
      this.items = data.items ? data.items.map(team => new Team(team)) : [];
      this.totalPages = data.totalPages || 0;
      this.totalItems = data.totalItems || 0;
      this.pageNumber = data.pageNumber || 1;
      this.pageSize = data.pageSize || 10;
    }
  }
  
  class Team {
    constructor(data) {
      this.name = data.name || '';
      this.description = data.description || '';
      this.numberOfMember = data.numberOfMember || 0;
      this.createTime = data.createTime || null;
      this.updateTime = data.updateTime || null;
      this.managerId = data.managerId || null;
      this.id = data.id || null;
    }
  }
  