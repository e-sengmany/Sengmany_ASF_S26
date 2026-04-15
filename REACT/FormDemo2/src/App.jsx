import {useForm} from "react-hook-form";

import {object, string, number} from "yup";
// allows us to simplify validation of form data

import {yupResolver} from "@hookform/resolvers/yup";
// allows us to integrate yup in to react forms

import './App.css'

const App = () => {

  const userSchema = object({
    fname: string()
      .max(5, "Cannot be more than five characters in length")
      .required("This field is required"), //this is the custom error message
    age: number()
      .max(99, "No Betty Whites")
      .min(21, "Must be at least 21")
      .positive("Please enter a valid age"),
    password: string()
      .max(12, "Cannot be more than 12 characters in length")
      .required("This field is required")
  })

  const {register, setValue, handleSubmit, reset, formState: { errors }} = useForm({
    resolver: yupResolver(userSchema)
  })

  const onSubmit = (data) =>{
    console.log(data);
    reset(); //clears the data on submit. Different from button reset, because it clears when the form is submitted
  };

  const handleChange = (event) => {
    // console.log(`${event.target.name}: ${event.target.value}`);
    setValue(event.target.name, event.target.value);
    // changes the value of fname to the value for input
  }


  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <br/>
        <label htmlFor={"fname"}>
          Name
        </label>
        <input
          type={"text"}
          // name={"fname"}, instead of using this
          //value={"fname"}, not needed
          {...register("fname")}
          id={"fname"}
          //any values for fname is registered
          onChange={handleChange}
          />
        {errors.fname && <span style={{color:"red"}}>{errors.fname.message}</span>}
        <br/>
        <label htmlFor={"age"}>
          Age
        </label>
        <input
          type={"number"}

          {...register("age")}
          id={"age"}
          //any values for fname is registered
          onChange={handleChange}
        />
        {errors.age && <span style={{color:"red"}}>{errors.age.message}</span>}
        <br/>
        <label htmlFor={"password"}>
          Password
        </label>
        <input
          type={"password"}
          {...register("password")}
          id={"password"}
          //any values for fname is registered
          onChange={handleChange}
        />
        {errors.password && <span style={{color:"red"}}>{errors.password.message}</span>}
        <br/>
        <button type={"submit"}> Submit </button>
        <br/>
        <button type={"reset"}> Reset </button>
        {/*reset is only for user*/}

      </form>


    </>
  )

}

export default App
