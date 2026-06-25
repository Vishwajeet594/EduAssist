import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {

  const navigate = useNavigate();

  const [form,setForm] =
    useState({
      name:"",
      email:"",
      password:""
    });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
      e.target.value
    });
  };

  const register = async () => {

    await API.post(
      "/auth/signup",
      form
    );

    alert("Registered");

    navigate("/");
  };

  return (
    <div>

      <h1>Register</h1>

      <input
        name="name"
        placeholder="Name"
        onChange={handleChange}
      />

      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
      />

      <button onClick={register}>
        Register
      </button>

    </div>
  );
}

export default Register;