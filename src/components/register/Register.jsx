import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
  } = useForm();

  const myfun = async () => {
    if (isValid) {
      console.log(getValues());
      const user = getValues();
      console.log(user, "values");
      if (user) {
        axios.post("http://localhost:3030/register", user).then((res) => {
          alert(res.data.message);
        });
      }
      navigate("/login");
    }
  };

  return (
    // <div>Register</div>
    <>
      <div
        className="container mt-20 "
        style={{
          boxShadow: "0 2px 4px rgb(0 0 0 / 10%), 0 8px 16px rgb(0 0 0 / 10%)",
        }}
      >
        <div className="m-5">
          <header className="text-center mt-4">
            {" "}
            <b>Register Form</b>{" "}
          </header>
          <form onSubmit={handleSubmit(myfun)} className="mt-5">
            <div className="mb-3">
              <label for="exampleInputEmail1" className="form-label">
                Name
              </label>
              <input
                {...register('name', {required:true,pattern: new RegExp("^[a-zA-Z ]*$")})}
                type="text"
                className="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
              />
            </div>
           {errors.name && (
            errors.name.type === "required"
            ? <p className='text-danger'>Please enter the name</p>
            : errors.name.type === "pattern"
           && <p className='text-danger'>Please enter in Alphabets</p>
             )}

            <div className="mb-3">
              <label for="exampleInputEmail1" className="form-label">
                Email address
              </label>
              <input 
                {...register('email', {required:true , pattern:new RegExp("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$") })}
                type="email"
                className="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
              />
            </div>
            {errors.email && (
             errors.email.type === "required"
             ? <p className="text-danger">Please enter the email</p>
             : errors.email.type === "pattern"
             && <p className="text-danger">Please enter a valid email</p>
            )}

            <div className="mb-3">
              <label for="exampleInputPassword1" className="form-label">
                Password
              </label>
              <input 
                {...register("password", {required:true })}
                type="password"
                className="form-control"
                id="exampleInputPassword1"
              />
            </div>
            {errors.password && errors.password.type === "required" && <p className={`text-danger`} >Please enter the password</p>}

            <div className="flex row mt-4" style={{ marginBottom: "5px" }}>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="btn btn-primary col-3"
              >
                Login
              </button>
              <div className="col-6" style={{ textAlign: "center" }}>
              </div>
              <button type="submit" className="btn btn-success col-3">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
