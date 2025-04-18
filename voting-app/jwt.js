const jwt = require('jsonwebtoken')


const jwtAuthMiddleware = (req, res, next) => {

// first check request heaaders has autorization or not
const autorization = req.headers.authorization
if(!autorization)
    return res.status(401).json({error: 'Token Not Found'});

// extract jwt token  from request headers

const token = req.headers.authorization.split(' ')[1];

if(!token) 
    return res.status (401).json ({error: ' Unauthrized'});


try{
    //verify the jwt token

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //attach user information to the request object

    req.user = decoded
    next();

} catch(err) {
    console.error(err);
    res.status(401).json ({error: 'Invaild token'});
}
}

//function to genrate token

const genrateToken = (userData) => {

    // gernate a new token using user data

    return jwt.sign(userData, process.env.JWT_SECRET, {
        expiresIn: 30000
    })
}

module.exports = {jwtAuthMiddleware, genrateToken}