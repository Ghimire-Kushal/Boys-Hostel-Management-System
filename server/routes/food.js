const router = require('express').Router()
const ctrl = require('../controllers/foodController')
const protect = require('../middleware/auth')

router.use(protect)
router.get('/menu/today', ctrl.getTodayMenu)
router.route('/menu').get(ctrl.getMenus).post(ctrl.upsertMenu)
router.delete('/menu/:id', ctrl.deleteMenu)

router.route('/complaints').get(ctrl.getComplaints).post(ctrl.createComplaint)
router.put('/complaints/:id/resolve', ctrl.resolveComplaint)
router.delete('/complaints/:id', ctrl.deleteComplaint)

module.exports = router
