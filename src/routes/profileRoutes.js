const express = require('express')
const router = express.Router()

const {
  getUserByUsername,
  getUserById,
  searchUsers,
  searchEngagements,
  followUser, unFollowUser
} = require('../controllers/profileController')

const { isAuth } = require('../middleware/authMiddleware')

router.get('/:id', getUserById)

router.get('/search/:query', searchUsers)

router.get('/username/:username', isAuth, getUserByUsername)

router.get('/engagements/:id', searchEngagements)

router.post('/follow/:id', isAuth, followUser)

router.post('/unfollow/:id', isAuth, unFollowUser)

module.exports = router
