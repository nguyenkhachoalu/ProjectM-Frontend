
  // ResponsePrint.js
  
  export class ResponsePrint {
    constructor(designId, printJobStatus, id) {
      this.designId = designId;
      this.printJobStatus = printJobStatus;
      this.id = id;
    }
  
    static fromApiResponse(data) {
      return new ResponsePrint(
        data.designId,
        data.printJobStatus,
        data.id
      );
    }
  }
  