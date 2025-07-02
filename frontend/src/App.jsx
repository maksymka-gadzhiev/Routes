import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import Login from './components/login/Login';
import Registration from './components/registration/Registration';
import { Route, Routes } from 'react-router-dom';
import Home from './components/home/Home';
import Map from './components/map/Map';
import Profile from './components/profile/Profile';
import SaveRoute from './components/saveRoute/SaveRoute';
import FriendsPage from './components/friendship/FriendsPage';
import RouteDetail from './components/routeDetail/RouteDetail';
import RouteList from './components/routeList/RouteList'

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/registration' element={<Registration />} />
        <Route path='/map' element={<Map />} />
        <Route path="/profile" element={<Profile />} />
        <Route path='/profile/:userId' element={<Profile />} />
        <Route path='/saveRoute' element={<SaveRoute />} />
        <Route path='/friends' element={<FriendsPage />} />
        <Route path="/routes/:userId/:routeId" element={<RouteDetail />} />
        <Route path="/routes" element={<RouteList />} />
      </Routes>
    </>
  );
}

export default App;