// src/models/requests/request_register.js

export class RegisterRequest {
    constructor(username, password, fullName, dateOfBirth, avatar, email, phoneNumber) {
      this.username = username;
      this.password = password;
      this.fullName = fullName;
      this.dateOfBirth = dateOfBirth;
      this.avatar = avatar; // File avatar
      this.email = email;
      this.phoneNumber = phoneNumber;
    }
  
    // Phương thức chuyển đổi thành FormData
    toFormData() {
      const formData = new FormData();
      formData.append('UserName', this.username);
      formData.append('Password', this.password);
      formData.append('FullName', this.fullName);
      formData.append('DateOfBirth', this.dateOfBirth);
      formData.append('Avatar', this.avatar); // File
      formData.append('Email', this.email);
      formData.append('PhoneNumber', this.phoneNumber);
      return formData;
    }
  }
  