const express =require('express');
const router = express.Router();
// const user = require('./../models/user');
const {jwtAuthMiddleware, genrateToken} = require('./../jwt');
const User = require('./../models/user');


router.post('/signup', async (req, res) => {
    try{
        const data=req.body
  
        console.log(req.body);

        if (data.age < 18) {
            return res.status(400).json({
                error: `You must be at least 18 years old to register. Your age is ${data.age}.`
            });
        }

        // Check for existing Aadhaar number
        const existingAadhaarUser = await User.findOne({ adharCardNumber: data.adharCardNumber });
        if (existingAadhaarUser) {
            return res.status(400).json({
                error: `User with Aadhaar number ${data.adharCardNumber} already exists`
            });
        }

                // Check for existing email
                const existingEmailUser = await User.findOne({ email: data.email.toLowerCase() });
                if (existingEmailUser) {
                    return res.status(400).json({
                        error: `User with email ${data.email} already exists`
                    });
                }
        const newUser = new User( data);


        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id,
            username: response.username
        }

        console.log(JSON.stringify(payload));
        const token = genrateToken(payload);
        console.log("Token is : ", token);

        res.status(200).json({response: response, token: token});
    }
     catch(err){
        console.error('Registration error:', err);
        
        // Handle duplicate key error (race condition)
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({
                error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
            });
        }
        
        // Handle validation errors
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ error: errors.join(', ') });
        }
        
        res.status(500).json({ error: 'Internal server error during registration' });
    }
    });


     router.post('/login', async(req, res) => {
        try{
            //extract username and password from request.body

         const {adharCardNumber, password} = req.body;


         //find the user by adharCardNumber

        const user = await user.findOne({adharCardNumber: adharCardNumber});

        //if user doesn't exist or password not match, return error

        if(!user || !(await user.comparePassword (password))) {
            return res.status(401).json(
                {error: 'Invaild Username or Password'}
            );
        }

        // genrate Token

        const payload = {
            id: user.id
        }

        const token  = genrateToken(payload);

        // retrun token as response

        res.json({token})
        } catch(err) {
            console.error(err);
            res.status(500).json({error: 'Internal Server error'});

        }

     });

     //profile route

     router.get ('/profile', jwtAuthMiddleware, async (req, res) => {
        try{
            const userData = req.user;
            const userId = userData.id;
            const user = await user.findById(userId);


            res.status (200).json({user});

        } catch (err){
            console.error(err);
            res.status(500).json({error: 'Internal Server Error'});
        }

     })

     router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
        try{
            const userId = req.user;
            const {currentPassword, newPassword} = req.body

            //find the user by UserId

            const user = await user.findById(userId);

            //if password does not match , return error

            if(!await user.comparePassword(currentPassword)){
                return res.status(401).json({error: 'Invalid username or Password'})
            }
            user.password = newPassword;
            await user.save();

            console.log('password updated')
            res.status(200).json({message: "password updated"})
        }catch(err){
            console.error(err);
            res.status(500).json({error: 'Internal Server Error'});
        }
     })

     module.exports = router;






