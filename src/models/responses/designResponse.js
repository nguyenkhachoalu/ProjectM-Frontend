// src/models/responses/DesignResponse.js

export default class DesignResponse {
    constructor(apiData) {
      this.projectId = apiData.projectId;
      this.designerId = apiData.designerId;
      this.filePath = apiData.filePath;
      this.designTime = apiData.designTime;
      this.designStatus = apiData.designStatus;
      this.approverId = apiData.approverId;
      this.id = apiData.id;
    }
  
    static fromApiResponse(apiResponse) {
      return apiResponse.map((data) => new DesignResponse(data));
    }
  }
  