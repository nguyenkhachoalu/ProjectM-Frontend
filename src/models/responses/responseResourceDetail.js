export class ResponseResourceDetail {
    constructor(propertyId, propertyDetailName, image, price, quantity) {
      this.propertyId = propertyId;
      this.propertyDetailName = propertyDetailName;
      this.image = image;
      this.price = price;
      this.quantity = quantity;
    }
  
    static fromApiResponse(data) {
      return new ResponseResourceDetail(
        data.propertyId,
        data.propertyDetailName,
        data.image,
        data.price,
        data.quantity
      );
    }
  }