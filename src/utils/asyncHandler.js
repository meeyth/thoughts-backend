// const asyncHandler = () => { }

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            console.log("Async handler: " + err.message);
            next(err)
        })
    }
}


// const asyncHandler = (fn) => async (req,res,next) => {

//     try {
//         await fn(req,res,next)
//     } catch (err)
//     {
//         console.log("hilu "+err.message);

//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message

//         })
//     }
// }


export { asyncHandler }