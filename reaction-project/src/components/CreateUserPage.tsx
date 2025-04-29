import { useForm} from "react-hook-form"
import { useState } from "react"
import { apiBase } from "../lib/api"
import { useNavigate } from "react-router"

interface User{
    email: string
    name: string
    age?: number
    password: string
}
export default function CreateUserPage() {
const [errorMsg, setErrorMsg] = useState("");
const {register, handleSubmit} = useForm<User>();
const navigate = useNavigate();

const handleCloseDisplayLogin = () => {
    navigate("/");
}
const onSubmit = async (data: User) => {

    try{
        const response = await apiBase.request({
            method: 'post',
            url: 'users/create',
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        console.log(response.data)
    } catch (error: any) {
        setErrorMsg(error.message);
        console.log(error);
    }
}
    return(
        <section className="flex justify-center items-center w-screen h-screen color fixed z-10 bg-black/80">
            
            <section className="static aspect-square border-2 w-min ">
                <form onSubmit={handleSubmit(onSubmit)} noValidate>

                    <button
                    className=" w-full hover:bg-red-800 hover:text-red-800 transition duration-500 rounded-sm"
                    type="button"
                    onClick={handleCloseDisplayLogin}
                    >x</button>

                    <input {...register('email', {required: true})} placeholder="EMAIL" className="mt-5 ml-5 rounded-sm text-black hover:text-slate-300 focus:outline-none bg-transparent text-white"/>
                    <input {...register('name', {required: true})} placeholder="NAME" className="mt-2 ml-5 rounded-sm text-black focus:outline-none bg-transparent text-white"/>
                    <input {...register('age')} placeholder="AGE" className="mt-2 ml-5 rounded-sm text-black focus:outline-none bg-transparent text-white"/>
                    <input {...register('password', {required: true})} type='password' placeholder="PASSWORD" className="mt-2 ml-5 rounded-sm text-black focus:outline-none bg-transparent text-white"/>
                  
                    {errorMsg && <p
                    className="ml-5 text-red-800 text-xs uppercase">{errorMsg}</p>}  

                    <button type="submit" className="ml-5 mt-12 text-white hover:text-gray-200">CREATE</button>
                </form>
            </section>

        </section>
    );
}