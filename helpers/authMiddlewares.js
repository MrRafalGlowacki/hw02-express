import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { config } from "./config.js";
import User from "../models/userSchema.js";


const strategyParams = {
  secretOrKey: config.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new Strategy(strategyParams, (payload, done) => {
    User.findOne({ _id: payload.id })
      .then((user) =>
        !user ? done(new Error("User not existing")) : done(null, user)
      )
      .catch(done);
  })
);

export const auth = (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (error, user) => {
      if (!user || error) return res.status(401).json({ message: "Unauthorized" });
      req.user = user;
      next();
    })(req, res, next);
  };
