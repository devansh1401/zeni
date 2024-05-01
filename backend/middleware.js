const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./config");

const authMiddleware = (req, res, next) => {
    // extract the authorization header
    const authHeader = req.headers.authorization;

     // Check if the Authorization header is present and formatted correctly
     if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({
            message : "Forbidden"
        });
     }

     // Extract the token from the Authorization header
     const token = authHeader.split(" ")[1];
     console.log("Token:", token);

     try {
        // Verify and decode the token
        const decode = jwt.verify(token, JWT_SECRET);
      //  console.log("Decoded:", decode);

        //attach the user id to the request object
        req.userId = decode.userId;
       // console.log("req.userId:", req.userId);

        //proceed to the next Middleware
        next();
     } catch(error){
        // if the token is invalid, return a 403 error
        console.error("JWT verification error:", error);
        return res.status(403).json({
            message : "Forbidden while decoding and adding user-id"
        });
     }
};

module.exports = {
    authMiddleware
}
// const { JWT_SECRET } = require("./config");
// const jwt = require("jsonwebtoken");

// const authMiddleware = (req, res, next) => {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res.status(403).json({});
//     }

//     const token = authHeader.split(' ')[1];

//     try {
//         const decoded = jwt.verify(token, JWT_SECRET);
//         console.log("Decoded:", decoded);
//         req.userId = decoded.userId;
//         console.log("req.userId:", req.userId);
//         next();
//     } catch (err) {
//         return res.status(403).json({});
//     }
// };

// module.exports = {
//     authMiddleware
// }