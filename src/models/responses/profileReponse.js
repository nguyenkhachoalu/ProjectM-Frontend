// src/models/responses/profileResponse.js
export default class ProfileResponse {
    constructor(data) {
      this.userName = data.userName;
      this.fullName = data.fullName;
      this.dateOfBirth = data.dateOfBirth;
      this.avatar = data.avatar;
      this.email = data.email;
      this.phoneNumber = data.phoneNumber;
      this.id = data.id;
    }
  }
  