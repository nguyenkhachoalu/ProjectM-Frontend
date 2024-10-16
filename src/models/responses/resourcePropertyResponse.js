// models/ResponseResourceProperty.js
export class ResponseResourceProperty {
    constructor(resourcePropertyName, resourceId, quantity, id) {
      this.resourcePropertyName = resourcePropertyName;
      this.resourceId = resourceId;
      this.quantity = quantity;
      this.id = id;
    }
  
    static fromApiResponse(data) {
      return new ResponseResourceProperty(
        data.resourcePropertyName,
        data.resourceId,
        data.quantity,
        data.id
      );
    }
  }
  