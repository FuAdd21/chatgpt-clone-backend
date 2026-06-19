export const errorHandler = (err, req, res, next) => {
    // let customError {
    //     statusCode: err.statusCode || statusCodes.INTERNAL_SERVER_ERROR,
    //     message: err.message || 'something went wrong try again later',
    // }
    console.error('Error in request:', err.message);

    return res.status(err.status || 500).json({
        status: false,
        message: err.message || 'something went wrong try again later'
    })
}