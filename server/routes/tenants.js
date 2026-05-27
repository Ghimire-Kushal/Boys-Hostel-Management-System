const router = require('express').Router()
const { getTenants, getTenant, createTenant, updateTenant, deleteTenant } = require('../controllers/tenantController')
const protect = require('../middleware/auth')

router.use(protect)
router.route('/').get(getTenants).post(createTenant)
router.route('/:id').get(getTenant).put(updateTenant).delete(deleteTenant)

module.exports = router
