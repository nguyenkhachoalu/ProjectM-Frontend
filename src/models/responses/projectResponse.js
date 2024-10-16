// projectResponse.js
export default class ProjectResponse {
  constructor(responseData) {
    this.items = responseData.items.map((item) => ({
      id: item.id,
      projectName: item.projectName,
      requestDescriptionFromCustomer: item.requestDescriptionFromCustomer,
      startDate: item.startDate,
      image: item.image,
      employeeId: item.employeeId,
      expectedEndDate: item.expectedEndDate,
      customerId: item.customerId,
      projectStatus: item.projectStatus,
    }));
    this.totalPages = responseData.totalPages;
    this.totalItems = responseData.totalItems;
    this.pageNumber = responseData.pageNumber;
    this.pageSize = responseData.pageSize;
  }
}
