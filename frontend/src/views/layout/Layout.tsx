import React from 'react'
import styled from 'styled-components'
import { Routes, Route } from 'react-router-dom'
import Login from '../login/Login'
import Survey from '../survey/Survey'
import Dashboard from '../dashboard/Dashboard'
import AdminPanel from '../adminPanel/AdminPanel'
import Answers from '../answers/Answers'

// Styled component for the main layout container
const PageLayout = styled.div`
  height: 100vh; 
  background: #FFFFFF;
  color: white;
`
// Styled component for the main content area
const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

const Layout = () => {
  return (
    <PageLayout>
      <MainContent>
        {/* Define routes for different pages */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/adminPanel" element={<AdminPanel />} />
          <Route path="/survey/:id/answers" element={<Answers />} />
          <Route path="/survey/:id" element={<Survey />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/:surveyName" element={<Dashboard />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </MainContent>
    </PageLayout>
  )
}

export default Layout
