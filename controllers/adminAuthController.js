const jwt = require('jsonwebtoken');

exports.adminLogin = (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '6h' }
    );

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: false, // ✅ Set to true in production (HTTPS)
      sameSite: 'lax', // ✅ Prevent CSRF
      maxAge: 6 * 60 * 60 * 1000 // 6 hours
    });

    res.json({ success: true, message: 'Logged in' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

exports.adminLogout = (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true, message: 'Logged out' });
};
