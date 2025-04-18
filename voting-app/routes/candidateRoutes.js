

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {jwtAuthMiddleware, genrateToken} = require('../jwt');
const User = require('../models/user');
const Candidate = require('../models/candidate');

const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        console.log('Found user:', user); 
        if (!user) {
            console.log('User not found');
            return false;
        }
        console.log('User role:', user.role); 
        return user.role === 'admin'; 
    } catch (err) {
        console.error('Error in checkAdminRole:', err);
        return false;
    }
}

// Create candidate (admin only)
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        console.log('JWT Payload:', req.user);
        console.log('User ID from token:', req.user.id);
        
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({message: 'User does not have admin role'});
        }

        const data = req.body;
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save();
        
        console.log('Data saved');
        return res.status(200).json({response: response});
    } catch(err) {
        console.error(err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
});

// Voting endpoint
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    const candidateID = req.params.candidateID;
    const userId = req.user.id;

    try {
        // Validate candidate ID format
        if (!mongoose.Types.ObjectId.isValid(candidateID)) {
            return res.status(400).json({message: 'Invalid candidate ID format'});
        }

        // Find the candidate
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({message: 'Candidate not found'});
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        // Check voting eligibility
        if (user.isVoted) {
            return res.status(400).json({message: 'You have already voted'});
        }

        if (user.role === 'admin') {
            return res.status(403).json({message: 'Admin is not allowed to vote'});
        }

        if (user.age < 18) {
            return res.status(400).json ({message: `your age just: ${user.age}. not eligible to vote`})
        }
        // Update candidate vote count and record the vote
        candidate.votes.push({user: userId});
        candidate.voteCount++;
        await candidate.save();

        // Update user's voting status
        user.isVoted = true;
        await user.save();

        return res.status(200).json({message: 'Vote recorded successfully'});
    } catch (err) {
        console.error('Error in voting:', err);
        return res.status(500).json({message: 'Internal Server Error'});
    }
});

// Vote count (admin only)
router.get('/vote/count', jwtAuthMiddleware, async (req, res) => {
    try {
        // Verify admin role
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({message: 'User does not have admin role'});
        }

        // Find all candidates and sort by vote count
        const candidates = await Candidate.find().sort({voteCount: 'desc'});
    
        // Map the candidates to return their party and voteCount
        const voteRecord = candidates.map((data) => { 
            return {
                party: data.party,
                count: data.voteCount
            }
        });

        return res.status(200).json(voteRecord);
    } catch (err) {
        console.error(err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
});

module.exports = router;