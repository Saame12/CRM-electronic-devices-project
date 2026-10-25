/* Only browser assets are public. Source, SQL, data, node_modules and secrets are not. */
const files = new Set([
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/birth-date.js',
  '/recovery-client.js',
  '/recovery.css',
  '/admin.html',
  '/manager.html',
  '/admin.css',
  '/admin.js',
  '/role-ui.js',
  '/staff-surveys.js',
  '/staff-controller.js',
  '/staff-bootstrap.js',
  '/reports.js',
  '/reports.css',
  '/recovery-admin.js',
  '/customer-details.js',
  '/customer-details.css',
  '/account-password.css',
  '/staff-focus.css'
]);
function publicAssetsOnly(req, res, next) {
  if (req.path.startsWith('/api/')) return next();
  if (['GET', 'HEAD'].includes(req.method) && files.has(req.path)) return next();
  return res.status(404).end();
}
module.exports = publicAssetsOnly;
