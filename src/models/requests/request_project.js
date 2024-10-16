// models/requests/request_project.js
export default class RequestProject {
    constructor(projectName, requestDescriptionFromCustomer, startDate, image, expectedEndDate, customerId) {
      this.projectName = projectName;
      this.requestDescriptionFromCustomer = requestDescriptionFromCustomer;
      this.startDate = startDate;
      this.image = image;
      this.expectedEndDate = expectedEndDate;
      this.customerId = customerId;
    }
  }
  