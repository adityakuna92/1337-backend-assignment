import jwt from 'jsonwebtoken';
import { JWT_EXPIRATION , JWT_SECRET  } from "./constants";

export const generateToken = (user) => {
	const userObj = { username : user.username };
	return jwt.sign(userObj, JWT_SECRET, {
		expiresIn: JWT_EXPIRATION,
	});
};

export const validateToken = (token) => {
    try {
		const verified = jwt.verify(token, JWT_SECRET);
		return true;
	} catch (error) {
		return false;
	}
}