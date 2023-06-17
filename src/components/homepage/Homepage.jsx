import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { useNavigate } from "react-router-dom";
import {
  MDBBtn,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
} from "mdb-react-ui-kit";
import axios from "axios";
import { Modal, Button, Form  } from 'react-bootstrap'

const Homepage = () => {
  const navigate = useNavigate();
  const [mealData, setMealData  ] = useState({});
  const [todaysData, setTodaysData] = useState([]);
  const [isShown, setIsShown] = useState(false);
  const [loginData, setLoginData] = useState(
    JSON.parse(localStorage.getItem("login"))
  );

  const [basicModal, setBasicModal] = useState(false);

  function getDataFun(){
    setLoginData(JSON.parse(localStorage.getItem("login")))
    if (loginData) {
        axios.get(`http://localhost:3030/totalData/${loginData._id}`).then(res => {
            console.log(res , "response");
            setMealData(res.data.data);
            setTodaysData(res.data.todayData)
        });
      navigate("/homePage");
    } else {
      navigate("/login");
    }
  }

  useEffect(() => {
      getDataFun()
  }, []);



  const { register, handleSubmit, getValues, reset} = useForm();
  const [updateHeading, setUpdateHeading] = useState("Add");

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  const [meal , setMeal] = useState({
    id : "",
    mealTime : "",
    mealName : "",
    quantity : "",
  })

  const handleChange = (e) => {
    const {name , value}= e.target;
    console.log(name , value , "name value"); 
    setMeal({
        ...meal,
        [name] : value
    })
  }

  const myfun = async () => {
    const mealData = getValues();
       mealData["userId"] =  loginData._id;
    axios.post("http://localhost:3030/addMeal",mealData ).then(res => {
        console.log(res , "res");
        getDataFun()
    })
    reset();
    setBasicModal(false);
    navigate("/homepage")

  };

  function addUpdate(mealId, name, quantity, mealType) {
      setShow(true);
   setMeal({
    id : mealId,
    mealTime : mealType,
    mealName : name,
    quantity ,
   })

  }
 
  const onUpdateFun = () => {
    const MealData = meal ; 
   axios.post(`http://localhost:3030/updateMeal`, MealData).then(res => {
    console.log(res , "update response");
     getDataFun()
   })
   
   handleClose(); 
      navigate("/homePage");
  
  }


 
  const deleteMeal = (mealId) => {
    console.log(mealId ,"mealId");
    axios.get(`http://localhost:3030/deleteMeal/${mealId}`).then(res => {
        alert(res.data.message);
         getDataFun();
    })
   
  }

  function logOut() {
    localStorage.removeItem("login");
    navigate("/login");
  }

  return (
    
    <>
      <div>
        <nav className="navbar " style={{ backgroundColor: "#2a2760", margin:'auto', maxWidth:'100%' }}>
          <div className="container-fluid">
            <p className="navbar-brand"></p>
            <form className="d-flex" role="search">
              <button
                className="btn btn-danger me-2"
                type="button"
                onClick={() => {
                  setBasicModal(!basicModal);
                  setUpdateHeading("Add");
                }}
              >
                Add Meal
              </button>
              <button
                onMouseEnter={() => setIsShown(true)}
                style={{
                  borderRadiusl: "50%",
                  display: "inline-block",
                  background: "#efef",
                }}
                className="btn"
                type="button"
              >
                {loginData?.name[0]}
              </button>
            </form>
          </div>
        </nav>

        <div>
          {isShown && (
            <div
              style={{ textAlign: "end", margin: "3px" }}
              onMouseLeave={() => setIsShown(false)}
            >
              <button
                style={{
                  outline: "none",
                  borderRadius: "2px",
                  backgroundColor: "ababab",
                  color: "#fff",
                  width: "180px",
                  height: "80px",
                }}
              >
                <div
                  type="button"
                  onClick={() => {
                    logOut();
                  }}
                  className="btn btn-danger"
                >
                  Logout
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    

      <div className="row" style={{ width: "100%", justifyContent: "space-between", paddingTop: "30px" }}>
  <div className="col-md-6 col-sm-12">
    <div className="d-flex justify-content-around">

    <div style={{ color: "#6BE5E8", width: "90px" }}>
  <CircularProgressbar
    value={(mealData[0]?.todayCalories / 2500) * 100}
    text={"2500 kcal"}
    strokeWidth={20}
    styles={buildStyles({
      pathColor: `#6BE5E8`,
      trailColor: "#474747",
      textSize: "10px",
    })}
  />
  <h6 style={{ color: "black", fontSize: "1rem", textAlign: "center", marginTop: "0.5rem" }}>Today Calories</h6>
</div>

      <div style={{ color: "#6BE5E8", width: "90px" }}>
        <CircularProgressbar
          value={(mealData[0]?.thisWeekCalories / 17500) * 100}
          text={"17500 kcal"}
          strokeWidth={20}
          styles={buildStyles({
            pathColor: `#6BE5E8`,
            trailColor: "#474747",
            textSize: "10px",
          })}
        />
        <h6 style={{ color: "black" }}>This Week Calories</h6>
      </div>
      <div style={{ color: "#6BE5E8", width: "90px" }}>
        <CircularProgressbar
          value={(mealData[0]?.thisMonthCalories / 75000) * 100}
          text={"75000 kcal"}
          strokeWidth={20}
          styles={buildStyles({
            pathColor: `#6BE5E8`,
            trailColor: "#474747",
            textSize: "10px",
          })}
        />
        <h6 style={{ color: "black" }}>This Month Calories</h6>
      </div>
    </div>
  </div>
  <div className="col-md-6 col-sm-12"   >
    <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={mealData[0]?.data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="protein" fill="#6BE5E8" />
        <Bar dataKey="carbs" fill="#41B8D6" />
        <Bar dataKey="fats" fill="#2C8BB9" />
      </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>

                                                                         
{todaysData.map((meal,index)=> (
    <div key={index} style={{ display: "flex", margin: "20px" }}>
      <div style={{ background: "#2A2760", width: "200px", height: "100px", padding: "20px" }}>
        <div style={{ color: "#fff", fontSize: "20px", fontWeight: "bold" }}>
          {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
        </div>
      </div>
      <hr />
      <div style={{ padding: "0px 10px" }}>
        {meal.mealNames.map((name, index) => (
          <>
            <div key={index} style={{ color: "#222", fontSize: "15px" }}>
              {name} {meal.quantities[index]} serving 
              <button className="btn" onClick={()=> {addUpdate(meal.mealId[index],name, meal.quantities[index], meal.mealType)}} >
               <i className="bi bi-pencil-square"></i></button>
              <button className="btn bg-light-danger" onClick={()=> deleteMeal(meal.mealId[index])} ><i className="bi bi-trash"></i></button>
            </div>
              
          </>

        ))}
        <hr />
      </div>
      
    </div>
))}
      

      <MDBModal show={basicModal} setShow={setBasicModal} tabIndex="-1">
        <MDBModalDialog>
          <MDBModalContent>
            <MDBModalHeader>
              <MDBModalTitle>{updateHeading}</MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={() => setBasicModal(!basicModal)}
              ></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody>
              <form onSubmit={handleSubmit(myfun)}>
                <h4>BreakFast</h4>

                <div className="d-flex">
                  <input
                    {...register("breakFastMeal",{pattern:new RegExp("^[a-zA-Z ]*$")})}
                    className="form-control"
                    type="text"
                    name="breakFastMeal"
                    placeholder="Enter your Meal Name"
                  />

                  <input
                    {...register("breakFastQty")}
                    className="form-control"
                    type="text"
                    name="breakFastQty"
                    placeholder="Enter quantity "
                  />
                </div>
                <br />
                <h4>Lunch</h4>

                <div className="d-flex">
                  <input
                    {...register("lunchMeal",{pattern:new RegExp("^[a-zA-Z ]*$")})}
                    className="form-control"
                    type="text"
                    name="lunchMeal"
                    placeholder="Enter your Meal Name"
                  />

                  <input
                    {...register("lunchQty")}
                    className="form-control"
                    type="text"
                    name="lunchQty"
                    placeholder="Enter quantity "
                  />
                </div>
                <br />
                <h4>Dinner</h4>

                <div className="d-flex">
                  <input
                    {...register("dinnerMeal",{pattern:new RegExp("^[a-zA-Z ]*$")})}
                    className="form-control"
                    type="text"
                    name="dinnerMeal"
                    placeholder="Enter your Meal Name"
                  />

                  <input
                    {...register("dinnerQty")}
                    className="form-control"
                    type="text"
                    name="dinnerQty"
                    placeholder="Enter quantity "
                  />
                </div>
                <br />

                <button
                  className="btn btn-danger"
                  color="secondary"
                  onClick={() => setBasicModal(!basicModal)}
                >
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </form>
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Updata Meal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form >
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1" required  onChange={handleChange}>
             <Form.Select aria-label="Default select example" onChange={handleChange}  name="mealTime">
                    <option>Open this select menu</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Lunch">Lunch</option>

          </Form.Select>
            </Form.Group>
             <Form.Group className="mb-3" controlId="exampleForm.ControlInput1" 
               name="mealName">
              <Form.Label>Meal Name</Form.Label>
              <Form.Control onChange={handleChange}  pattern={new RegExp("^[a-zA-Z ]*$")} required
                type="text"
                name="mealName"
                value={meal.mealName}
                placeholder="Enter Meal Name"
                autoFocus
              />
            </Form.Group>
          <Form.Group className="mb-3"  controlId="exampleForm.ControlInput1"  name="quantity"> 
              <Form.Label>Quantity</Form.Label>
              <Form.Control onChange={handleChange} 
               name="quantity" required
                type="text"
                value ={meal.quantity}
                placeholder="Enter Quantity"
                autoFocus
              />
            </Form.Group>
             <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button type="button" variant="primary" onClick={onUpdateFun }>
            Update
          </Button>
        </Modal.Footer>
          </Form>
        </Modal.Body>
       
      </Modal>


    </>
  );
};

export default Homepage;
