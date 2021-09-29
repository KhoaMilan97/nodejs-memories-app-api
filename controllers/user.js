import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import User from '../models/user.js';

export const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User doesn't exist." });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect)
      return res.status(400).json({ message: 'Invalid credentials.' });

    const token = jwt.sign({ email: user.email, id: user._id }, 'mySecretKey', {
      expiresIn: '1h',
    });

    res.status(200).json({ result: user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const signUp = async (req, res) => {
  const { email, password, firstName, lastName, cf_password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: 'User already exists.' });

    if (password !== cf_password)
      return res.status(400).json({ message: 'Password do not match.' });

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
    });

    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      'mySecretKey',
      {
        expiresIn: '1h',
      }
    );

    res.status(200).json({ result: newUser, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
