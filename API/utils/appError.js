class AppError extends Error {
  constructor(message = "Internal Server Error", status = 500, data = [], ) {
    super(message);
    this.status = status;
    this.success = false;
    this.data = data;
  }
}

export { AppError };
