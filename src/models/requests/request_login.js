// src/models/requests/request_login.js
export class LoginRequest {
  constructor(userName, password) {  // Chữ "N" trong "UserName" phải viết hoa
    this.userName = userName;
    this.password = password;
  }
}
