const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

const projectCreate = require('./project/project.create');
const projectUpdate = require('./project/project.update');
const projectGet = require('./project/project.get');
const projectsGet = require('./project/projects.get');
const upload = require('./image/upload');
const validate = require('./image/validate');
const login = require('./user/login');
const logout = require('./user/logout');
const register = require('./user/register');
const confirmation = require('./user/confirmation');
const reset = require('./user/reset');
const password = require('./user/password');

router.post('/login', (req, res, next) => {
    login(req, res, next);
});

router.post('/register', (req, res, next) => {
    register(req, res, next);
});

router.post('/confirmation', (req, res, next) => {
    confirmation(req, res, next);
});

router.post('/reset', (req, res, next) => {
    reset(req, res, next);
});

router.post('/password', (req, res, next) => {
    password(req, res, next);
});

router.get('/project/:id', (req, res, next) => {
    projectGet(req, res, next);
});

router.get('/projects', (req, res, next) => {
    projectsGet(req, res, next);
});

// Authenticated routes
router.get('/logout', auth, (req, res, next) => {
    logout(req, res, next);
});

router.post('/project/:id/upload', auth, (req, res, next) => {
    upload(req, res, next);
});

router.put('/project', auth, (req, res, next) => {
    projectUpdate(req, res, next);
});

router.post('/project', auth, (req, res, next) => {
    projectCreate(req, res, next);
});

router.post('/image/:id/validate', auth, (req, res, next) => {
    validate(req, res, next);
});

// All other routes get 404.
router.get('*', (req, res, next) => {
    next({ status: 404, success: false, message: 'This URL can not be found on the API, try a valid route.' });
});

module.exports = router;