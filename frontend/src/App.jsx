import { useState } from 'react'
import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './components/Login'
import Register from './components/Register'
import Home from './Pages/Home'
import Challenge from './Pages/Challenge'
import Education from './Pages/Education'
import EducationDetail from './Pages/InternalPages/EducationDetail'
import ChallengeDetail from './Pages/InternalPages/ChallengesDetail'
import GoalsPage from './Pages/GoalSetup'
import Instructor from './Pages/Instructor'
import Subscription from './Pages/Subscription'
import FitnessPlan from './Pages/FitnessPlan'
import MealPlan from './Pages/MealPlan'
import FitnessPlanDetail from './Pages/InternalPages/FitnessDescription'
import MealPlanDetail from './Pages/InternalPages/MealPlanDetails'
import Profile from './Pages/Profile'
import Payment from './components/Payment'
import Chat from './components/Chat'
import ProtectedRoute from './components/ProtectedRoutes'
import AdminPage from './Pages/Admin'
import PasswordResetRequest from './components/PasswordResetRequest'
import PasswordReset from './components/PasswordReset '
import Footer from './components/Footer'

function App() {
  const location = useLocation()
  const noNavbar = location.pathname === "/register" || 
                   location.pathname === "/" || 
                   location.pathname === "/reset" || 
                   location.pathname ==='/password-reset' || 
                   location.pathname === '/admin'

  const noFooter = location.pathname === "/register" ||
                   location.pathname === "/" || 
                   location.pathname === "/reset" || 
                   location.pathname ==='/password-reset' || 
                   location.pathname === '/admin'
  return (
    <>

    {
      noNavbar ?(
      <Routes>
         <Route path='/' element={<Login />} />
         <Route path='/register' element={<Register />} />
         <Route path='/reset' element={< PasswordResetRequest/>} />
         <Route path='/password-reset' element={< PasswordReset/>} />
         
         content = {
          <Route path='/admin' element={<AdminPage/>} />
         }

      </Routes>

        ):(
          <>
      <Navbar
          content={
            <Routes>
              <Route element={<ProtectedRoute/>}>
                  <Route path='/home' element={<Home />} />
                  <Route path='/challenges' element={<Challenge />} />
                  <Route path='/education' element={<Education/>} />
                  <Route path='/education/:id' element={<EducationDetail/>} />
                  <Route path='/challenge-detail/:id' element={<ChallengeDetail/>} />
                  <Route path='/goals' element={<GoalsPage/>} />
                  <Route path='/instructor' element={<Instructor/>} />
                  <Route path='/subscriptions' element={<Subscription/>} />
                  <Route path='/fitnessplan' element={<FitnessPlan/>} />
                  <Route path='/mealsplan' element={<MealPlan/>} />
                  <Route path='/fitnessplan-detail/:id' element={<FitnessPlanDetail/>} />
                  <Route path='/mealplan-detail/:id' element={<MealPlanDetail/>} />
                  <Route path='/profile' element={<Profile/>} />
                  <Route path='/payment' element={<Payment/>} />
                  <Route path='/chat/:userId' element={<Chat />} />
              </Route>
            </Routes>
          } 
      />
      <Footer/>
      </>
        )

    }
      
      

    </>
  )
}

export default App
