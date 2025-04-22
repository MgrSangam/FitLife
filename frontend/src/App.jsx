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
              </Route>
             
              
            </Routes>
          } 
      />

    }
      
      

    </>
  )
}

export default App
