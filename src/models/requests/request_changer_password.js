// src/models/requests/request_change_password.js
export default class ChangePasswordRequest {
  constructor(oldPassword, newPassword, confirmPassword) {
    this.oldPassword = oldPassword;
    this.newPassword = newPassword;
    this.confirmPassword = confirmPassword;
  }

  toJSON() {
    return {
      oldPassword: this.oldPassword,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword,
    };
  }
}
