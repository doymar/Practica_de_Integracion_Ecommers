import { Router } from "express";
import passport from "passport";
import { usersMiddleware } from "../middlewares/items.middleware.js";
import { UserManager } from '../DAL/daos/mongo/users.mongo.js'
import { hashData, compareData, generateToken } from "../utils/utils.js";
import { logger } from "../utils/logger.js";
import { transporter } from "../utils/nodemailer.js";
const router = Router();

router.get('/current', passport.authenticate('jwt',{session: false}), async (req,res) =>{
  res.status(200).json({message: 'User loged', user: req.user})
})

// SIGNUP - LOGIN - PASSPORT LOCAL

router.post('/signup2', usersMiddleware,passport.authenticate('signup',{
    successRedirect: '/login',
    failureRedirect: '/signup2'
}))

router.post('/login',passport.authenticate('login'),(req,res) => {
  const {first_name, last_name, email, role} = req.user;
  const token = generateToken({first_name, last_name, email, role});
  res.cookie("token", token, { maxAge: 60000, httpOnly: true })
  .redirect('/home');
})

// SIGNUP - LOGIN - PASSPORT GITHUB

router.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }
  ));

router.get('/callback', passport.authenticate('github'), (req,res) =>{
    res.redirect('/home');
})  

// SIGNUP - LOGIN - PASSPORT GOOGLE

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile','email'] }));

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),(req, res)=> {
    // Successful authentication, redirect home.
    res.redirect('/home');
  });

router.get("/signout", async(req,res) => {
    const id = req.session.passport.user
    const fecha = new Date(Date.now());
    await UserManager.updateOne(id,{last_connection: fecha})
    req.session.destroy(()=>{
        res.redirect("/login")
    })
})

router.post('/password_reset', async(req,res) =>{
  const { email } = req.body;
  try {
    const user = await UserManager.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "User not found with the email provided" });
    }

    const mailOptions = {
      from: 'DoymarEcommers',
      to: email,
      subject: 'User Password Reset',
      //text: 'Primera prueba mail',
      html: `<b>Please click on the link below</b>
      <a href="http://localhost:8080/restaurar/${email}">Restore password</a>`,
    }
    await transporter.sendMail(mailOptions);

    const token = generateToken({email})   
    res.cookie('token', token, { maxAge: 3600000, httpOnly: true })
    logger.info("token", token)
    
    res.status(200).json({ message: "Recovery email sent" });
  } catch (error) {
    res.status(500).json({ error });
  }
})

router.post("/restaurar/:email", async (req, res) => {
    const { password } = req.body;
    const { email } = req.params;
    try {
      const user = await UserManager.findByEmail(email);
      if (!req.cookies.token){
        return res.redirect("/password_rest")
      }
      const isPasswordValid = await compareData(password,user.password);
      if (isPasswordValid) {
        return res.status(400).json({ message: "The password cannot be the same as the previous ones. Please enter a different password" });
      }
      const hashedPassword = await hashData(password);
      user.password = hashedPassword;
      await user.save();
      res.status(200).json({ message: "Password updated" });
    } catch (error) {
      res.status(500).json({ error });
    }
  });

export default router;