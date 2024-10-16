export default class UserResponse {
    constructor(data) {
      this.items = data.items ? data.items.map(user => new User(user)) : [];
      this.totalPages = data.totalPages || 0;
      this.totalItems = data.totalItems || 0;
      this.pageNumber = data.pageNumber || 1;
      this.pageSize = data.pageSize || 10;
    }
  }
  
  class User {
    constructor(data) {
      this.userName = data.userName || '';
      this.fullName = data.fullName || '';
      this.dateOfBirth = data.dateOfBirth || null;
      this.avatar = data.avatar || '';
      this.email = data.email || '';
      this.createTime = data.createTime || null;
      this.updateTime = data.updateTime || null;
      this.phoneNumber = data.phoneNumber || '';
      this.teamId = data.teamId || null;
      this.isActive = data.isActive || false;
      this.id = data.id || null;
    }
  }
  