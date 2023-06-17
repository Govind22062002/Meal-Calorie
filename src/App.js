import logo from './logo.svg';
import './App.css';
import Login from './components/login/Login';
// import register from './components/register/register';
// import Register from './components/register/register';
import Register from './components/register/Register';
import Homepage from './components/homepage/Homepage';
import "bootstrap/dist/css/bootstrap.min.css"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState }from 'react'


function App() {
    const storage = JSON.parse(localStorage.getItem('login'))
    console.log(storage , "storage");
    const [data, setData] = useState(storage)
    console.log(data,'data');

    // console.clear();

  return (
    <>
      {/* <Login></Login> */}
      {/* <Register></Register> */}
      {/* <Homepage></Homepage> */}

      <Router>
        <Routes>
          <Route exact path='/'
            element={data? <Homepage/> : <Login/>}>
          </Route>
          <Route exact path='/homepage' element={<Homepage />}></Route>
          <Route exact path='/register' element={<Register />}></Route>
          <Route exact path='/login' element={<Login/>}></Route>
        </Routes>
      </Router>

    </>
  );
}

export default App;
