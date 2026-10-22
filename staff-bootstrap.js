/* Loaded last, after all staff feature modules have registered their functions. */
(async function bootStaff() {
  render();
  if (!sessionStorage.getItem(TOKEN)) return;
  try {
    const user = (await api('/api/me')).user;
    if (!admitStaff(user, true)) return;
    me = user;
    render();
    await loadDashboard();
    if (me?.role === 'ADMIN') pollRecoveryAdmin();
  } catch (error) {
    resetStaffSession();
    render();
    $('#error').textContent =
      error.message || 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }
})();
