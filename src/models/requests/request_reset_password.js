// src/models/requests/request_reset_password.js
export class ResetPasswordRequest {
    constructor(confirmCode, newPassword, confirmPassword) {
      this.confirmCode = confirmCode;
      this.newPassword = newPassword;
      this.confirmPassword = confirmPassword;
    }
  
    toJson() {
      return {
        newPassword: this.newPassword,
        confirmPassword: this.confirmPassword
      };
    }
    
  }
  