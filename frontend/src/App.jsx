import { useState } from 'react'
import './App.css'
import Home from './components/Home'
import Register from './components/Register'
import Login from './components/Login'
import Navbar from './components/Navbar'
import PasswordResetRequest from './components/PasswordResetRequest'
import PasswordReset from './components/PasswordReset '
import { Routes, Route,useLocation } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoutes'
import Challenge from './components/Challenge'
import Education from './components/Education'
import EducationDetail from './components/EducationDetail'
import ChallengeDetail from './components/ChallengesDetail'
import GoalsPage from './components/GoalSetup'
import Instructor from './components/Instructor'
import Subscription from './components/Subscription'
import FitnessPlan from './components/FitnessPlan'
import MealPlan from './components/MealPlan'
import FitnessPlanDetail from './components/FitnessDescription'
import MealPlanDetail from './components/MealPlanDetails'

function App() {
  const location = useLocation()
  const noNavbar = location.pathname === "/register" || location.pathname === "/" || location.pathname === "/reset" || location.pathname ==='/password-reset'
  return (
    <>

    {
      noNavbar ?
      <Routes>
         <Route path='/' element={<Login />} />
         <Route path='/register' element={<Register />} />
         <Route path='/reset' element={< PasswordResetRequest/>} />
         <Route path='/password-reset' element={< PasswordReset/>} />
         

      </Routes>

      :

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
              </Route>
             
              
            </Routes>
          } 
      />

    }
      
      

    </>
  )
}

export default App
